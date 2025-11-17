
            import { Request, Response } from "express";
import { BookReview } from "../../models/schema/BookReview";
import { BookModel } from "../../models/schema/books";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";

// إضافة تقييم جديد
export const addReview = async (req: Request, res: Response) => {
  const { bookId, rating, comment } = req.body;
  const userId = req.user?.id;

  if (!bookId || !rating) throw new BadRequest("bookId and rating are required");

  const book = await BookModel.findById(bookId);
  if (!book) throw new NotFound("Book not found");

  const existing = await BookReview.findOne({ bookId, userId });
  if (existing) throw new BadRequest("You already reviewed this book");

  const review = new BookReview({ bookId, userId, rating, comment });
  await review.save();

  SuccessResponse(res, { message: "Review added", review });
};

// تحديث تقييم المستخدم لنفس الكتاب
export const updateReview = async (req: Request, res: Response) => {
  const { bookId, rating, comment } = req.body;
  const userId = req.user?.id;

  const review = await BookReview.findOne({ bookId, userId });
  if (!review) throw new NotFound("Review not found");

  if (rating) review.rating = rating;
  if (comment) review.comment = comment;

  await review.save();
  SuccessResponse(res, { message: "Review updated", review });
};

// حذف تقييم المستخدم
export const deleteReview = async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const userId = req.user?.id;

  const review = await BookReview.findOneAndDelete({ bookId, userId });
  if (!review) throw new NotFound("Review not found");

  SuccessResponse(res, { message: "Review deleted" });
};


export const getBookReviews = async (req: Request, res: Response) => {
  const { bookId } = req.params;

  // التأكد من وجود الكتاب
  const book = await BookModel.findById(bookId);
  if (!book) throw new NotFound("Book not found");

  // جلب كل التقييمات الخاصة بالكتاب
  const reviews = await BookReview.find({ bookId }).populate("userId", "name photo");

  SuccessResponse(res, { message: "Book reviews fetched", book, reviews });
};
