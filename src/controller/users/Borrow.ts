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
import { uploadBase64ToCloudinary } from "../../utils/cloudinary";
// استعار الكتاب مباشرة
// استعار الكتاب مباشرة مع QR يحتوي على جميع التفاصيل

// ===================== Borrow Book =====================
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

  const existingBorrow = await Borrow.findOne({ userId, bookId, status: "on_borrow" });
  if (existingBorrow) throw new BadRequest("You already have this book borrowed");

  const now = new Date();
  const borrowDate = now;
  const borrowTime = now.toTimeString().slice(0, 5);
  const dateOnly = now.toISOString().split("T")[0];

  const mustReturnDate = new Date();
  mustReturnDate.setDate(borrowDate.getDate() + (book.dayesofreturn || 7));
  const returnDateOnly = mustReturnDate.toISOString().split("T")[0];

  // ✅ أنشئ الـ Borrow أولاً للحصول على الـ _id
  const borrow = await Borrow.create({
    userId,
    bookId,
    borrowDate,
    borrowTime,
    mustReturnDate,
    status: "pending",
    qrBorrowExpiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000),
  });

  // ✅ الآن أنشئ الـ QR بالـ borrowId
  const qrData = JSON.stringify({
    type: "borrow",
    borrowId: borrow._id.toString(),
    bookName: book.name,
    userName: user.name,
    borrowDate: dateOnly,
    returnBy: returnDateOnly,
  });

  const qrCodeBase64 = await QRCode.toDataURL(qrData);
  const qrCodeUrl = await uploadBase64ToCloudinary(qrCodeBase64, "qrcodes");

  // ✅ حدّث الـ Borrow بالـ QR URL
  borrow.qrCodeBorrow = qrCodeUrl;
  await borrow.save();

  const borrowResponse = {
    _id: borrow._id,
    user: { _id: user._id, name: user.name,phone: user.phone, // ✅ إضافة رقم التليفون
    },
    book: {
      _id: book._id,
      name: book.name,
      dayesofreturn: book.dayesofreturn,
      numberInStock: book.numberInStock,
      publisher: book.publisher,
      writer: book.writer,
      edition: book.edition,
      numPages: book.numPages,
      condition: book.condition,
      weight: book.weight,
      Synopsis: book.Synopsis,
      gallery: book.gallery,
      mainImage: book.mainImage,
    },
    borrowDate: dateOnly,
    borrowTime,
    mustReturnDate: returnDateOnly,
    status: borrow.status,
    qrCodeBorrow: qrCodeUrl,
  };

  return SuccessResponse(res, { borrow: borrowResponse, qrCodeBorrow: qrCodeUrl });
};

// ===================== Return Book =====================
export const returnBook = async (req: Request, res: Response) => {
  const { borrowId } = req.params;
  const userId = req.user?.id;
  if (!borrowId) throw new BadRequest("BorrowId is required");
  if (!userId) throw new BadRequest("User not found");

  const borrow = await Borrow.findById(borrowId)
    .populate<{ bookId: IBook & Document; userId: IUser & Document }>("bookId userId");

  if (!borrow) throw new NotFound("Borrow record not found");

  const bookDoc = borrow.bookId as IBook & Document;
  const userDoc = borrow.userId as IUser & Document;

  if (!userDoc._id || (userDoc._id as any).toString() !== userId)
    throw new BadRequest("Unauthorized");

  if (borrow.status !== "on_borrow" && borrow.status !== "late")
    throw new BadRequest("Book is not currently borrowed");
  const now = new Date();
  const returnDateOnly = now.toISOString().split("T")[0];

  // ✅ QR يحتوي على borrowId
  const qrData = JSON.stringify({
    type: "return",
    borrowId: borrow._id.toString(),
    bookName: bookDoc.name,
    userName: userDoc.name,
    returnDate: returnDateOnly,
  });

  const qrCodeBase64 = await QRCode.toDataURL(qrData);
  const qrCodeUrl = await uploadBase64ToCloudinary(qrCodeBase64, "qrcodes");

  borrow.qrCodeReturn = qrCodeUrl;
  borrow.qrReturnExpiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  await borrow.save();

  const borrowResponse = {
    _id: borrow._id,
    user: { _id: userDoc._id, name: userDoc.name,phone: userDoc.phone},
    book: { _id: bookDoc._id, name: bookDoc.name },
    borrowDate: borrow.borrowDate.toISOString().split("T")[0],
    borrowTime: borrow.borrowTime,
    mustReturnDate: borrow.mustReturnDate.toISOString().split("T")[0],
    qrCodeReturn: qrCodeUrl,
    status: borrow.status,
  };

  return SuccessResponse(res, { borrow: borrowResponse, qrCodeReturn: qrCodeUrl });
};

// استعراض كتب اليوزر
export const getUserBorrows = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new BadRequest("User not found");

  const borrows = await Borrow.find({ userId }).populate("bookId").sort({ createdAt: -1 });

  const now = new Date();
  const pending: any[] = [];
  const borrowed: any[] = [];
  const late: any[] = [];
  const returned: any[] = [];

  for (const b of borrows) {
    // تحديث حالة الكتب المتأخرة
    if (b.status === "on_borrow" && b.mustReturnDate < now) {
      b.status = "late";
      await b.save();
    }

    // امسح أي QR منتهية
    if (b.qrBorrowExpiresAt && b.qrBorrowExpiresAt < now && b.qrCodeBorrow) {
      b.qrCodeBorrow = undefined;
      b.qrBorrowExpiresAt = undefined;
      await b.save();
    }
    if (b.qrReturnExpiresAt && b.qrReturnExpiresAt < now && b.qrCodeReturn) {
      b.qrCodeReturn = undefined;
      b.qrReturnExpiresAt = undefined;
      await b.save();
    }

    if (b.status === "pending") pending.push(b);
    if (b.status === "on_borrow") borrowed.push(b);
    if (b.status === "late") {
      late.push({
        ...b.toObject(),
        daysLate: Math.floor((now.getTime() - b.mustReturnDate.getTime()) / (1000 * 60 * 60 * 24)),
      });
    }
    if (b.status === "returned") returned.push(b);
  }

  return SuccessResponse(res, { pending, borrowed, late, returned });
};
