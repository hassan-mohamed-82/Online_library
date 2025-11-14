"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookSchema = exports.createBookSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const mongoose_1 = require("mongoose");
// Helper للتحقق من ObjectId
const objectIdValidator = joi_1.default.string().custom((value, helpers) => {
    if (!mongoose_1.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
    }
    return value;
}, "ObjectId validation");
// Schema لإنشاء Book
exports.createBookSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(200).required(),
    categoryId: objectIdValidator.required(),
    mainImage: joi_1.default.string().uri(),
    dayesofreturn: joi_1.default.number().min(1),
    gallery: joi_1.default.array().items(joi_1.default.string().uri()).max(10),
    numberOfCopies: joi_1.default.number().min(0).required(),
    numberInStock: joi_1.default.number().min(0).required(),
    borrowedBy: joi_1.default.number().min(0),
    publisher: joi_1.default.string().max(100),
    writer: joi_1.default.string().max(100),
    language: joi_1.default.string().max(50),
    publishYear: joi_1.default.number().min(1000).max(new Date().getFullYear()),
    edition: joi_1.default.string().max(50),
    numPages: joi_1.default.number().min(1),
    condition: joi_1.default.string(),
    weight: joi_1.default.number().min(0),
    Synopsis: joi_1.default.string().max(2000),
});
// Schema لتحديث Book (كل الحقول اختيارية)
exports.updateBookSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(200),
    categoryId: objectIdValidator,
    mainImage: joi_1.default.string().uri(),
    gallery: joi_1.default.array().items(joi_1.default.string().uri()).max(10),
    numberOfCopies: joi_1.default.number().min(0),
    numberInStock: joi_1.default.number().min(0),
    borrowedBy: joi_1.default.number().min(0),
    publisher: joi_1.default.string().max(100),
    writer: joi_1.default.string().max(100),
    language: joi_1.default.string().max(50),
    publishYear: joi_1.default.number().min(1000).max(new Date().getFullYear()),
    edition: joi_1.default.string().max(50),
    numPages: joi_1.default.number().min(1),
    dayesofreturn: joi_1.default.number().min(1),
    condition: joi_1.default.string(),
    weight: joi_1.default.number().min(0),
    Synopsis: joi_1.default.string().max(2000),
});
