"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewSchema = exports.createReviewSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createReviewSchema = joi_1.default.object({
    bookId: joi_1.default.string().required(),
    rating: joi_1.default.number().min(1).max(5).required(),
    review: joi_1.default.string().max(2000).required(),
    Comment: joi_1.default.string().max(2000).optional(),
});
exports.updateReviewSchema = joi_1.default.object({
    rating: joi_1.default.number().min(1).max(5).optional(),
    review: joi_1.default.string().max(2000).optional(),
    Comment: joi_1.default.string().max(2000).optional(),
});
