import { Request, Response } from "express";
import { Borrow } from "../../models/schema/Borrow";
import { BookModel, IBook } from "../../models/schema/books";
import { NotFound } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";
import { Document } from "mongoose";
import { deletePhotoFromServer } from "../../utils/deleteImage";


// Scan borrow QR
export const scanBorrowQR = async (req: Request, res: Response) => {
  const { borrowId } = req.params;

  const borrow = await Borrow.findById(borrowId)
    .populate<{ bookId: IBook & Document }>("bookId");

  if (!borrow) throw new NotFound("Borrow not found");

  if (borrow.scannedByAdminAt) {
    throw new BadRequest("Borrow QR has already been scanned");
  }

  if (borrow.qrBorrowExpiresAt && borrow.qrBorrowExpiresAt < new Date()) {
    throw new BadRequest("Borrow QR expired");
  }

  if (borrow.status !== "pending") {
    throw new BadRequest("Borrow status must be pending to scan QR");
  }

  // تسجيل السكان
  borrow.scannedByAdminAt = new Date();
  borrow.status = "on_borrow";

  // إزالة QR بعد استخدامه
  borrow.qrCodeBorrow = undefined;
  borrow.qrBorrowExpiresAt = undefined;

  await borrow.save();

  const bookDoc = borrow.bookId as IBook & Document;
  if (bookDoc) {
    bookDoc.numberInStock -= 1;
    bookDoc.borrowedBy += 1;
    await bookDoc.save();
  }

  return SuccessResponse(res, { borrow });
};


// Scan return QR
export const scanReturnQR = async (req: Request, res: Response) => {
  const { borrowId } = req.params;

  const borrow = await Borrow.findById(borrowId)
    .populate<{ bookId: IBook & Document }>("bookId");

  if (!borrow) throw new NotFound("Borrow not found");

  // لازم يكون الكتاب في حالة on_borrow
  if (borrow.status !== "on_borrow") {
    throw new BadRequest("This borrow is not currently active");
  }

  // تحقق من صلاحية QR
  if (borrow.qrReturnExpiresAt && borrow.qrReturnExpiresAt < new Date()) {
    throw new BadRequest("Return QR expired");
  }

  borrow.status = "returned";
  borrow.returnedAt = new Date();

  // إزالة QR بعد الاستخدام
  borrow.qrCodeReturn = undefined;
  borrow.qrReturnExpiresAt = undefined;

  await borrow.save();

  // تحديث مخزون الكتاب
  const bookDoc = borrow.bookId as IBook & Document;
  if (bookDoc) {
    bookDoc.numberInStock += 1;
    bookDoc.borrowedBy -= 1;

    if (bookDoc.borrowedBy < 0) bookDoc.borrowedBy = 0;

    await bookDoc.save();
  }

  return SuccessResponse(res, { borrow });
};


// عرض كل borrowات
export const getAllBorrows = async (req: Request, res: Response) => {
  const borrows = await Borrow.find({})
    .populate("bookId")
    .populate("userId");

  // تصنيف الكتب حسب الحالة
  const borrowedBooks = borrows
    .filter(b => b.status === "on_borrow")
    .map(b => ({
      _id: b._id,
      user: b.userId,
      book: b.bookId,
      borrowDate: b.borrowDate.toISOString().split("T")[0],
      borrowTime: b.borrowTime,
      mustReturnDate: b.mustReturnDate.toISOString().split("T")[0],
      status: b.status,
      qrCodeBorrow: b.qrCodeBorrow,
    }));

  const returnedBooks = borrows
    .filter(b => b.status === "returned")
    .map(b => ({
      _id: b._id,
      user: b.userId,
      book: b.bookId,
      borrowDate: b.borrowDate.toISOString().split("T")[0],
      borrowTime: b.borrowTime,
      mustReturnDate: b.mustReturnDate.toISOString().split("T")[0],
      returnDate: b.returnedAt ? b.returnedAt.toISOString().split("T")[0] : null,
      status: b.status,
      qrCodeReturn: b.qrCodeReturn,
    }));

  return SuccessResponse(res, { borrowedBooks, returnedBooks });
};