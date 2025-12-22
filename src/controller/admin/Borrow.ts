import { Request, Response } from "express";
import { Borrow } from "../../models/schema/Borrow";
import { BookModel, IBook } from "../../models/schema/books";
import { NotFound } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";
import mongoose, { Document } from "mongoose";
import { deletePhotoFromServer } from "../../utils/deleteImage";


// Scan borrow QR
export const scanBorrowQR = async (req: Request, res: Response) => {
  const { borrowId } = req.params;

  let borrow;

  // تحقق إذا كان ObjectId صالح
  if (mongoose.Types.ObjectId.isValid(borrowId)) {
    borrow = await Borrow.findById(borrowId)
      .populate<{ bookId: IBook & Document }>("bookId");
  } else {
    // إذا كان الـ QR يحتوي على قيمة مختلفة، ابحث بـ qrCodeBorrow
    borrow = await Borrow.findOne({ qrCodeBorrow: borrowId })
      .populate<{ bookId: IBook & Document }>("bookId");
  }

  if (!borrow) throw new NotFound("Borrow not found");

  if (borrow.scannedByAdminAt) {
    throw new BadRequest("Borrow QR has already been scanned");
  }

  if (borrow.status !== "pending") {
    throw new BadRequest("Borrow status must be pending to scan QR");
  }

  borrow.scannedByAdminAt = new Date();
  borrow.status = "on_borrow";

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

  let borrow;

  if (mongoose.Types.ObjectId.isValid(borrowId)) {
    borrow = await Borrow.findById(borrowId)
      .populate<{ bookId: IBook & Document }>("bookId");
  } else {
    borrow = await Borrow.findOne({ qrCodeReturn: borrowId })
      .populate<{ bookId: IBook & Document }>("bookId");
  }

  if (!borrow) throw new NotFound("Borrow not found");

  // ✅ يقبل on_borrow أو late
  if (borrow.status !== "on_borrow" && borrow.status !== "late") {
    throw new BadRequest("This borrow is not currently active");
  }

  if (borrow.qrReturnExpiresAt && borrow.qrReturnExpiresAt < new Date()) {
    throw new BadRequest("Return QR expired");
  }

  const wasLate = borrow.status === "late";

  borrow.status = "returned";
  borrow.returnedAt = new Date();
  borrow.qrCodeReturn = undefined;
  borrow.qrReturnExpiresAt = undefined;

  await borrow.save();

  const bookDoc = borrow.bookId as IBook & Document;
  if (bookDoc) {
    bookDoc.numberInStock += 1;
    bookDoc.borrowedBy -= 1;
    if (bookDoc.borrowedBy < 0) bookDoc.borrowedBy = 0;
    await bookDoc.save();
  }

  return SuccessResponse(res, {
    borrow,
    wasLate, // ✅ يخبر الأدمن إذا كان متأخر
    message: wasLate ? "Book returned (was late)" : "Book returned successfully"
  });
};

// عرض كل borrowات
export const getAllBorrows = async (req: Request, res: Response) => {
  const borrows = await Borrow.find({})
    .populate("bookId")
    .populate("userId");

  const now = new Date();

  // تحديث حالة الكتب المتأخرة تلقائياً
  for (const b of borrows) {
    if (b.status === "on_borrow" && b.mustReturnDate < now) {
      b.status = "late";
      await b.save();
    }
  }

  const pendingBooks = borrows
    .filter(b => b.status === "pending")
    .map(b => formatBorrowResponse(b));

  const borrowedBooks = borrows
    .filter(b => b.status === "on_borrow")
    .map(b => formatBorrowResponse(b));

  const lateBooks = borrows
    .filter(b => b.status === "late")
    .map(b => ({
      ...formatBorrowResponse(b),
      daysLate: Math.floor((now.getTime() - b.mustReturnDate.getTime()) / (1000 * 60 * 60 * 24)),
    }));

  const returnedBooks = borrows
    .filter(b => b.status === "returned")
    .map(b => ({
      ...formatBorrowResponse(b),
      returnDate: b.returnedAt ? b.returnedAt.toISOString().split("T")[0] : null,
    }));

  return SuccessResponse(res, {
    pendingBooks,
    borrowedBooks,
    lateBooks,
    returnedBooks,
    summary: {
      pending: pendingBooks.length,
      onBorrow: borrowedBooks.length,
      late: lateBooks.length,
      returned: returnedBooks.length,
    }
  });
};

// Helper function
const formatBorrowResponse = (b: any) => ({
  _id: b._id,
  user: b.userId,
  book: b.bookId,
  borrowDate: b.borrowDate.toISOString().split("T")[0],
  borrowTime: b.borrowTime,
  mustReturnDate: b.mustReturnDate.toISOString().split("T")[0],
  status: b.status,
  qrCodeBorrow: b.qrCodeBorrow,
  qrCodeReturn: b.qrCodeReturn,
});
