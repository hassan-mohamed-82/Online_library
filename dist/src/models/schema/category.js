"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    icon: { type: String },
    parentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true });
CategorySchema.index({ parentId: 1 });
exports.Category = (0, mongoose_1.model)('Category', CategorySchema);
