"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteBook = void 0;
const mongoose_1 = require("mongoose");
const FavoriteBookSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Book', required: true },
}, { timestamps: true });
FavoriteBookSchema.index({ userId: 1, bookId: 1 }, { unique: true });
exports.FavoriteBook = (0, mongoose_1.model)('FavoriteBook', FavoriteBookSchema);
