"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBorrows = exports.returnBook = exports.borrowBook = void 0;
// استيراد الموديلات
const Borrow_1 = require("../../models/schema/Borrow");
const User_1 = require("../../models/schema/auth/User");
const books_1 = require("../../models/schema/books");
const qrcode_1 = __importDefault(require("qrcode"));
const deleteImage_1 = require("../../utils/deleteImage");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const cloudinary_1 = require("../../utils/cloudinary");
// استعار الكتاب مباشرة
// استعار الكتاب مباشرة مع QR يحتوي على جميع التفاصيل
// ===================== Borrow Book =====================
const borrowBook = async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user?.id;
    if (!bookId)
        throw new BadRequest_1.BadRequest("BookId is required");
    if (!userId)
        throw new BadRequest_1.BadRequest("User not found");
    const book = await books_1.BookModel.findById(bookId);
    if (!book)
        throw new Errors_1.NotFound("Book not found");
    if (book.numberInStock <= 0)
        throw new BadRequest_1.BadRequest("Book not in stock");
    const user = await User_1.User.findById(userId);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const existingBorrow = await Borrow_1.Borrow.findOne({ userId, bookId, status: "on_borrow" });
    if (existingBorrow)
        throw new BadRequest_1.BadRequest("You already have this book borrowed");
    const now = new Date();
    const borrowDate = now;
    const borrowTime = now.toTimeString().slice(0, 5);
    const dateOnly = now.toISOString().split("T")[0];
    const mustReturnDate = new Date();
    mustReturnDate.setDate(borrowDate.getDate() + (book.dayesofreturn || 7));
    const returnDateOnly = mustReturnDate.toISOString().split("T")[0];
    // توليد QR Base64
    const qrText = `Book: ${book.name}\nUser: ${user.name}\nBorrow Date: ${dateOnly}\nBorrow Time: ${borrowTime}\nReturn By: ${returnDateOnly}`;
    const qrCodeBase64 = await qrcode_1.default.toDataURL(qrText);
    const qrCodeUrl = await (0, cloudinary_1.uploadBase64ToCloudinary)(qrCodeBase64, "qrcodes");
    const borrow = await Borrow_1.Borrow.create({
        userId,
        bookId,
        borrowDate,
        borrowTime,
        mustReturnDate,
        status: "pending",
        qrCodeBorrow: qrCodeUrl,
        qrBorrowExpiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000), // صلاحية 3 ساعات
    });
    const borrowResponse = {
        _id: borrow._id,
        user: { _id: user._id, name: user.name },
        book: { _id: book._id, name: book.name, dayesofreturn: book.dayesofreturn, numberInStock: book.numberInStock,
            publisher: book.publisher, writer: book.writer, edition: book.edition, numPages: book.numPages, condition: book.condition, weight: book.weight, Synopsis: book.Synopsis, gallery: book.gallery, mainImage: book.mainImage
        },
        borrowDate: dateOnly,
        borrowTime,
        mustReturnDate: returnDateOnly,
        status: borrow.status,
        qrCodeBorrow: qrCodeUrl,
    };
    return (0, response_1.SuccessResponse)(res, { borrow: borrowResponse, qrCodeBorrow: qrCodeUrl });
};
exports.borrowBook = borrowBook;
// ===================== Return Book =====================
const returnBook = async (req, res) => {
    const { borrowId } = req.params;
    const userId = req.user?.id;
    if (!borrowId)
        throw new BadRequest_1.BadRequest("BorrowId is required");
    if (!userId)
        throw new BadRequest_1.BadRequest("User not found");
    const borrow = await Borrow_1.Borrow.findById(borrowId)
        .populate("bookId userId");
    if (!borrow)
        throw new Errors_1.NotFound("Borrow record not found");
    const bookDoc = borrow.bookId;
    const userDoc = borrow.userId;
    if (!userDoc._id || userDoc._id.toString() !== userId)
        throw new BadRequest_1.BadRequest("Unauthorized");
    if (borrow.status !== "on_borrow")
        throw new BadRequest_1.BadRequest("Book is not currently borrowed");
    const now = new Date();
    const returnDateOnly = now.toISOString().split("T")[0];
    const qrText = `Book: ${bookDoc.name}\nUser: ${userDoc.name}\nReturn Date: ${returnDateOnly}`;
    const qrCodeBase64 = await qrcode_1.default.toDataURL(qrText);
    const qrCodeUrl = await (0, cloudinary_1.uploadBase64ToCloudinary)(qrCodeBase64, "qrcodes");
    borrow.qrCodeReturn = qrCodeUrl;
    borrow.qrReturnExpiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    await borrow.save();
    const borrowResponse = {
        _id: borrow._id,
        user: { _id: userDoc._id, name: userDoc.name },
        book: { _id: bookDoc._id, name: bookDoc.name },
        borrowDate: borrow.borrowDate.toISOString().split("T")[0],
        borrowTime: borrow.borrowTime,
        mustReturnDate: borrow.mustReturnDate.toISOString().split("T")[0],
        qrCodeReturn: qrCodeUrl,
        status: borrow.status,
    };
    return (0, response_1.SuccessResponse)(res, { borrow: borrowResponse, qrCodeReturn: qrCodeUrl });
};
exports.returnBook = returnBook;
// استعراض كتب اليوزر
const getUserBorrows = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new BadRequest_1.BadRequest("User not found");
    const borrows = await Borrow_1.Borrow.find({ userId }).populate("bookId").sort({ createdAt: -1 });
    const now = new Date();
    const borrowed = [];
    const returned = [];
    for (const b of borrows) {
        // امسح أي QR منتهية
        if (b.qrBorrowExpiresAt && b.qrBorrowExpiresAt < now && b.qrCodeBorrow) {
            await (0, deleteImage_1.deletePhotoFromServer)(b.qrCodeBorrow.replace(`${req.protocol}://${req.get("host")}/`, ""));
            b.qrCodeBorrow = undefined;
            b.qrBorrowExpiresAt = undefined;
            await b.save();
        }
        if (b.qrReturnExpiresAt && b.qrReturnExpiresAt < now && b.qrCodeReturn) {
            await (0, deleteImage_1.deletePhotoFromServer)(b.qrCodeReturn.replace(`${req.protocol}://${req.get("host")}/`, ""));
            b.qrCodeReturn = undefined;
            b.qrReturnExpiresAt = undefined;
            await b.save();
        }
        if (b.status === "on_borrow")
            borrowed.push(b);
        if (b.status === "returned")
            returned.push(b);
    }
    return (0, response_1.SuccessResponse)(res, { borrowed, returned });
};
exports.getUserBorrows = getUserBorrows;
