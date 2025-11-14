"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBorrows = exports.scanReturnQR = exports.scanBorrowQR = void 0;
const Borrow_1 = require("../../models/schema/Borrow");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
// Scan borrow QR
const scanBorrowQR = async (req, res) => {
    const { borrowId } = req.params;
    const borrow = await Borrow_1.Borrow.findById(borrowId)
        .populate("bookId");
    if (!borrow)
        throw new Errors_1.NotFound("Borrow not found");
    // تأكد إن QR ما اتحمسش قبل كده
    if (borrow.scannedByAdminAt) {
        throw new BadRequest_1.BadRequest("Borrow QR has already been scanned");
    }
    // تحقق من صلاحية QR
    if (borrow.qrBorrowExpiresAt && borrow.qrBorrowExpiresAt < new Date()) {
        throw new BadRequest_1.BadRequest("Borrow QR expired");
    }
    // وضع الحالة الأولية على pending قبل السكان
    if (borrow.status !== "pending") {
        throw new BadRequest_1.BadRequest("Borrow status must be pending to scan QR");
    }
    borrow.scannedByAdminAt = new Date();
    borrow.status = "on_borrow"; // تحويل الحالة بعد سكان QR
    await borrow.save();
    return (0, response_1.SuccessResponse)(res, { borrow });
};
exports.scanBorrowQR = scanBorrowQR;
// Scan return QR
const scanReturnQR = async (req, res) => {
    const { borrowId } = req.params;
    const borrow = await Borrow_1.Borrow.findById(borrowId)
        .populate("bookId");
    if (!borrow)
        throw new Errors_1.NotFound("Borrow not found");
    // تحقق إن QR ما تم سكانه قبل كده
    if (borrow.status !== "on_borrow") {
        throw new BadRequest_1.BadRequest("Borrow QR has already been scanned");
    }
    // تحقق من صلاحية QR
    if (borrow.qrReturnExpiresAt && borrow.qrReturnExpiresAt < new Date()) {
        throw new BadRequest_1.BadRequest("Return QR expired");
    }
    borrow.status = "returned";
    borrow.returnedAt = new Date();
    await borrow.save();
    // تحديث stock الكتاب
    const bookDoc = borrow.bookId;
    if (bookDoc) {
        bookDoc.numberInStock += 1;
        bookDoc.borrowedBy -= 1;
        await bookDoc.save();
    }
    return (0, response_1.SuccessResponse)(res, { borrow });
};
exports.scanReturnQR = scanReturnQR;
// عرض كل borrowات
const getAllBorrows = async (req, res) => {
    const borrows = await Borrow_1.Borrow.find({})
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
    return (0, response_1.SuccessResponse)(res, { borrowedBooks, returnedBooks });
};
exports.getAllBorrows = getAllBorrows;
