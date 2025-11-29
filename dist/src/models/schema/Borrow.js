"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Borrow = void 0;
const mongoose_1 = require("mongoose");
const BorrowSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowDate: { type: Date, required: true, default: Date.now },
    borrowTime: { type: String, required: true }, // "14:30"
    mustReturnDate: { type: Date, required: true }, // +7 أيام مثلاً
    status: {
        type: String,
        enum: ['pending', 'on_borrow', 'returned'],
        default: 'pending',
    },
    qrCodeBorrow: { type: String },
    qrCodeReturn: { type: String },
    qrBorrowExpiresAt: { type: Date }, // +3 ساعات
    qrReturnExpiresAt: { type: Date },
    scannedByAdminAt: { type: Date },
    returnedAt: { type: Date },
}, { timestamps: true });
// فهرسة للاستعلامات
BorrowSchema.index({ userId: 1, status: 1 });
BorrowSchema.index({ bookId: 1, status: 1 });
exports.Borrow = (0, mongoose_1.model)('Borrow', BorrowSchema);
