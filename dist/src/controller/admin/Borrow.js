"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBorrows = exports.scanReturnQR = exports.scanBorrowQR = void 0;
const Borrow_1 = require("../../models/schema/Borrow");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const mongoose_1 = __importDefault(require("mongoose"));
// Scan borrow QR
const scanBorrowQR = async (req, res) => {
    const { borrowId } = req.params;
    let borrow;
    // تحقق إذا كان ObjectId صالح
    if (mongoose_1.default.Types.ObjectId.isValid(borrowId)) {
        borrow = await Borrow_1.Borrow.findById(borrowId)
            .populate("bookId");
    }
    else {
        // إذا كان الـ QR يحتوي على قيمة مختلفة، ابحث بـ qrCodeBorrow
        borrow = await Borrow_1.Borrow.findOne({ qrCodeBorrow: borrowId })
            .populate("bookId");
    }
    if (!borrow)
        throw new Errors_1.NotFound("Borrow not found");
    if (borrow.scannedByAdminAt) {
        throw new BadRequest_1.BadRequest("Borrow QR has already been scanned");
    }
    if (borrow.status !== "pending") {
        throw new BadRequest_1.BadRequest("Borrow status must be pending to scan QR");
    }
    borrow.scannedByAdminAt = new Date();
    borrow.status = "on_borrow";
    borrow.qrCodeBorrow = undefined;
    borrow.qrBorrowExpiresAt = undefined;
    await borrow.save();
    const bookDoc = borrow.bookId;
    if (bookDoc) {
        bookDoc.numberInStock -= 1;
        bookDoc.borrowedBy += 1;
        await bookDoc.save();
    }
    return (0, response_1.SuccessResponse)(res, { borrow });
};
exports.scanBorrowQR = scanBorrowQR;
// Scan return QR
const scanReturnQR = async (req, res) => {
    const { borrowId } = req.params;
    let borrow;
    if (mongoose_1.default.Types.ObjectId.isValid(borrowId)) {
        borrow = await Borrow_1.Borrow.findById(borrowId)
            .populate("bookId");
    }
    else {
        borrow = await Borrow_1.Borrow.findOne({ qrCodeReturn: borrowId })
            .populate("bookId");
    }
    if (!borrow)
        throw new Errors_1.NotFound("Borrow not found");
    // ✅ يقبل on_borrow أو late
    if (borrow.status !== "on_borrow" && borrow.status !== "late") {
        throw new BadRequest_1.BadRequest("This borrow is not currently active");
    }
    if (borrow.qrReturnExpiresAt && borrow.qrReturnExpiresAt < new Date()) {
        throw new BadRequest_1.BadRequest("Return QR expired");
    }
    const wasLate = borrow.status === "late";
    borrow.status = "returned";
    borrow.returnedAt = new Date();
    borrow.qrCodeReturn = undefined;
    borrow.qrReturnExpiresAt = undefined;
    await borrow.save();
    const bookDoc = borrow.bookId;
    if (bookDoc) {
        bookDoc.numberInStock += 1;
        bookDoc.borrowedBy -= 1;
        if (bookDoc.borrowedBy < 0)
            bookDoc.borrowedBy = 0;
        await bookDoc.save();
    }
    return (0, response_1.SuccessResponse)(res, {
        borrow,
        wasLate, // ✅ يخبر الأدمن إذا كان متأخر
        message: wasLate ? "Book returned (was late)" : "Book returned successfully"
    });
};
exports.scanReturnQR = scanReturnQR;
// عرض كل borrowات
const getAllBorrows = async (req, res) => {
    const borrows = await Borrow_1.Borrow.find({})
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
    return (0, response_1.SuccessResponse)(res, {
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
exports.getAllBorrows = getAllBorrows;
// Helper function
const formatBorrowResponse = (b) => ({
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
