"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const mongoose_1 = require("mongoose");
const BookSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    mainImage: { type: String },
    gallery: [{ type: String }],
    numberOfCopies: { type: Number, required: true, min: 0 },
    numberInStock: { type: Number, required: true, min: 0 },
    borrowedBy: { type: Number, default: 0 },
    publisher: { type: String },
    writer: { type: String },
    language: { type: String },
    publishYear: { type: Number },
    edition: { type: String },
    numPages: { type: Number, min: 1 },
    condition: { type: String, enum: ['new', 'good', 'fair', 'poor'], default: 'good' },
    weight: { type: Number }, // جرام
}, { timestamps: true });
BookSchema.index({ categoryId: 1 });
BookSchema.index({ name: 'text' }); // للبحث
exports.Book = (0, mongoose_1.model)('Book', BookSchema);
