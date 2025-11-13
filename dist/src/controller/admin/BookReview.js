"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReviewByAdmin = exports.getAllReviews = void 0;
const BookReview_1 = require("../../models/schema/BookReview");
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
const getAllReviews = async (_req, res) => {
    const reviews = await BookReview_1.BookReview.find().populate("bookId").populate("userId");
    (0, response_1.SuccessResponse)(res, { message: "All reviews fetched", reviews });
};
exports.getAllReviews = getAllReviews;
// حذف تقييم أي مستخدم
const deleteReviewByAdmin = async (req, res) => {
    const { reviewId } = req.params;
    const review = await BookReview_1.BookReview.findByIdAndDelete(reviewId);
    if (!review)
        throw new NotFound_1.NotFound("Review not found");
    (0, response_1.SuccessResponse)(res, { message: "Review deleted by admin" });
};
exports.deleteReviewByAdmin = deleteReviewByAdmin;
