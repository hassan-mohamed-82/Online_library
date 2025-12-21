"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookModel = void 0;
const mongoose_1 = require("mongoose");
const BookSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    mainImage: { type: String },
    gallery: [{ type: String }],
    numberOfCopies: { type: Number, required: true, min: 0 },
    numberInStock: { type: Number, required: true, min: 0 },
    borrowedBy: { type: Number, default: 0 },
    publisher: { type: String },
    writer: { type: String },
    language: { type: String }, // ✅ يقبل أي لغة
    publishYear: { type: Number },
    edition: { type: String },
    dayesofreturn: { type: Number },
    Synopsis: { type: String },
    numPages: { type: Number, min: 1 },
    condition: { type: String }, // ✅ شيلنا الـ enum - يقبل أي قيمة
    weight: { type: Number },
}, { timestamps: true });
BookSchema.index({ categoryId: 1 });
BookSchema.index({ name: "text" });
exports.BookModel = (0, mongoose_1.model)("Book", BookSchema);
