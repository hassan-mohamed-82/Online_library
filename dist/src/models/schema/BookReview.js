"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookReview = void 0;
const mongoose_1 = require("mongoose");
const BookReviewSchema = new mongoose_1.Schema({
    bookId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });
// كل يوزر يقيّم كتاب مرة واحدة
BookReviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });
exports.BookReview = (0, mongoose_1.model)('BookReview', BookReviewSchema);
