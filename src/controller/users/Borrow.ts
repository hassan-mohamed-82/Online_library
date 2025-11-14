import { Document } from "mongoose";

// استيراد الموديلات
import { Borrow, IBorrow } from "../../models/schema/Borrow";
import { User, IUser } from "../../models/schema/auth/User";
import { BookModel, IBook } from "../../models/schema/books";
import QRCode from "qrcode";
import { saveBase64Image } from "../../utils/handleImages";
import { deletePhotoFromServer } from "../../utils/deleteImage";
import { NotFound } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
// استعار الكتاب مباشرة
// استعار الكتاب مباشرة مع QR يحتوي على جميع التفاصيل
export const borrowBook = async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const userId = req.user?.id;
  if (!bookId) throw new BadRequest("BookId is required");
  if (!userId) throw new BadRequest("User not found");

  const book = await BookModel.findById(bookId);
  if (!book) throw new NotFound("Book not found");
  if (book.numberInStock <= 0) throw new BadRequest("Book not in stock");

  const user = await User.findById(userId);
  if (!user) throw new NotFound("User not found");

  // حماية: التحقق إذا المستخدم لديه نفس الكتاب على حالة on_borrow
  const existingBorrow = await Borrow.findOne({
    userId,
    bookId,
    status: "on_borrow",
  });
  if (existingBorrow) {
    throw new BadRequest("You already have this book borrowed");
  }

  const now = new Date();
  const borrowDate = now;
  const borrowTime = now.toTimeString().slice(0, 5);
  const dateOnly = now.toISOString().split("T")[0];

  // استخدام daysOfReturn من الكتاب بدل الرقم الثابت
  const mustReturnDate = new Date();
  mustReturnDate.setDate(borrowDate.getDate() + (book.dayesofreturn || 7)); // 7 أيام افتراضي
  const returnDateOnly = mustReturnDate.toISOString().split("T")[0];

  // توليد QR للاستعارة فقط، بدون تغيير المخزون أو الحالة
  const qrText = `Book: ${book.name}\nUser: ${user.name}\nBorrow Date: ${dateOnly}\nBorrow Time: ${borrowTime}\nReturn By: ${returnDateOnly}`;
  const qrCodeBase64 = await QRCode.toDataURL(qrText);
  const qrCodeUrl = await saveBase64Image(qrCodeBase64, `${userId}_${bookId}`, req, "qrcodes");

  const borrow = await Borrow.create({
    userId,
    bookId,
    borrowDate,
    borrowTime,
    mustReturnDate,
    status: "pending", // الحالة تظل pending حتى الأدمن يؤكد
    qrCodeBorrow: qrCodeUrl,
    qrBorrowExpiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000), // صلاحية 3 ساعات
  });

  // لا يتم تحديث المخزون إلا بعد تأكيد الأدمن

  const borrowResponse = {
    _id: borrow._id,
    user: { _id: user._id, name: user.name },
    book: { _id: book._id, name: book.name },
    borrowDate: dateOnly,
    borrowTime,
    mustReturnDate: returnDateOnly,
    status: borrow.status, // pending
    qrCodeBorrow: qrCodeUrl,
  };

  return SuccessResponse(res, { borrow: borrowResponse, qrCodeBorrow: qrCodeUrl });
};


// إعادة الكتاب
export const returnBook = async (req: Request, res: Response) => {
  const { borrowId } = req.params;
  const userId = req.user?.id;
  if (!borrowId) throw new BadRequest("BorrowId is required");
  if (!userId) throw new BadRequest("User not found");

  // جلب الـ borrow مع populated fields
  const borrow = await Borrow.findById(borrowId)
    .populate<{ bookId: IBook & Document; userId: IUser & Document }>("bookId userId");

  if (!borrow) throw new NotFound("Borrow record not found");

  const bookDoc = borrow.bookId as IBook & Document;
  const userDoc = borrow.userId as IUser & Document;

  // تحقق من صلاحية المستخدم
  if (!userDoc._id || (userDoc._id as any).toString() !== userId)
    throw new BadRequest("Unauthorized");

  if (borrow.status !== "on_borrow") 
    throw new BadRequest("Book is not currently borrowed");

  const now = new Date();
  const returnDateOnly = now.toISOString().split("T")[0];

  // توليد QR للإرجاع فقط (لا تغيير الحالة ولا المخزون)
  const qrText = `Book: ${bookDoc.name}\nUser: ${userDoc.name}\nReturn Date: ${returnDateOnly}`;
  const qrCodeBase64 = await QRCode.toDataURL(qrText);
  const qrCodeUrl = await saveBase64Image(qrCodeBase64, `${userId}_${bookDoc._id}_return`, req, "qrcodes");

  // تخزين QR وصلاحية مسحها فقط
  borrow.qrCodeReturn = qrCodeUrl;
  borrow.qrReturnExpiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 ساعات
  await borrow.save();

  const borrowResponse = {
    _id: borrow._id,
    user: { _id: userDoc._id, name: userDoc.name },
    book: { _id: bookDoc._id, name: bookDoc.name },
    borrowDate: borrow.borrowDate.toISOString().split("T")[0],
    borrowTime: borrow.borrowTime,
    mustReturnDate: borrow.mustReturnDate.toISOString().split("T")[0],
    qrCodeReturn: qrCodeUrl,
    status: borrow.status, // تظل "on_borrow" حتى تأكيد الأدمن
  };

  return SuccessResponse(res, { borrow: borrowResponse, qrCodeReturn: qrCodeUrl });
};

// استعراض كتب اليوزر
export const getUserBorrows = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new BadRequest("User not found");

  const borrows = await Borrow.find({ userId }).populate("bookId").sort({ createdAt: -1 });

  const now = new Date();
  const borrowed: any[] = [];
  const returned: any[] = [];

  for (const b of borrows) {
    // امسح أي QR منتهية
    if (b.qrBorrowExpiresAt && b.qrBorrowExpiresAt < now && b.qrCodeBorrow) {
      await deletePhotoFromServer(b.qrCodeBorrow.replace(`${req.protocol}://${req.get("host")}/`, ""));
      b.qrCodeBorrow = undefined;
      b.qrBorrowExpiresAt = undefined;
      await b.save();
    }
    if (b.qrReturnExpiresAt && b.qrReturnExpiresAt < now && b.qrCodeReturn) {
      await deletePhotoFromServer(b.qrCodeReturn.replace(`${req.protocol}://${req.get("host")}/`, ""));
      b.qrCodeReturn = undefined;
      b.qrReturnExpiresAt = undefined;
      await b.save();
    }

    if (b.status === "on_borrow") borrowed.push(b);
    if (b.status === "returned") returned.push(b);
  }

  return SuccessResponse(res, { borrowed, returned });
};
