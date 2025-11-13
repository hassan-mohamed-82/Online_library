"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookReviews = exports.getUserReviews = exports.deleteReview = exports.updateReview = exports.addReview = void 0;
const BookReview_1 = require("../../models/schema/BookReview");
const books_1 = require("../../models/schema/books");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const NotFound_1 = require("../../Errors/NotFound");
// إضافة تقييم جديد
const addReview = async (req, res) => {
    const { bookId, rating, comment } = req.body;
    const userId = req.user?.id;
    if (!bookId || !rating)
        throw new BadRequest_1.BadRequest("bookId and rating are required");
    const book = await books_1.BookModel.findById(bookId);
    if (!book)
        throw new NotFound_1.NotFound("Book not found");
    const existing = await BookReview_1.BookReview.findOne({ bookId, userId });
    if (existing)
        throw new BadRequest_1.BadRequest("You already reviewed this book");
    const review = new BookReview_1.BookReview({ bookId, userId, rating, comment });
    await review.save();
    (0, response_1.SuccessResponse)(res, { message: "Review added", review });
};
exports.addReview = addReview;
// تحديث تقييم المستخدم لنفس الكتاب
const updateReview = async (req, res) => {
    const { bookId, rating, comment } = req.body;
    const userId = req.user?.id;
    const review = await BookReview_1.BookReview.findOne({ bookId, userId });
    if (!review)
        throw new NotFound_1.NotFound("Review not found");
    if (rating)
        review.rating = rating;
    if (comment)
        review.comment = comment;
    await review.save();
    (0, response_1.SuccessResponse)(res, { message: "Review updated", review });
};
exports.updateReview = updateReview;
// حذف تقييم المستخدم
const deleteReview = async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user?.id;
    const review = await BookReview_1.BookReview.findOneAndDelete({ bookId, userId });
    if (!review)
        throw new NotFound_1.NotFound("Review not found");
    (0, response_1.SuccessResponse)(res, { message: "Review deleted" });
};
exports.deleteReview = deleteReview;
// جلب كل تقييمات المستخدم
const getUserReviews = async (req, res) => {
    const userId = req.user?.id;
    const reviews = await BookReview_1.BookReview.find({ userId }).populate("bookId");
    (0, response_1.SuccessResponse)(res, { message: "User reviews fetched", reviews });
};
exports.getUserReviews = getUserReviews;
// جلب كل التقييمات الخاصة بكتاب معين
const getBookReviews = async (req, res) => {
    const { bookId } = req.params;
    // التأكد من وجود الكتاب
    const book = await books_1.BookModel.findById(bookId);
    if (!book)
        throw new NotFound_1.NotFound("Book not found");
    // جلب كل التقييمات الخاصة بالكتاب
    const reviews = await BookReview_1.BookReview.find({ bookId }).populate("userId", "name email");
    (0, response_1.SuccessResponse)(res, { message: "Book reviews fetched", book, reviews });
};
exports.getBookReviews = getBookReviews;
