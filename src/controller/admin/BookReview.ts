import { Request, Response } from "express";
import { BookReview } from "../../models/schema/BookReview";
import { BookModel } from "../../models/schema/books";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";

export const getAllReviews = async (_req: Request, res: Response) => {
  const reviews = await BookReview.find().populate("bookId").populate("userId");
  SuccessResponse(res, { message: "All reviews fetched", reviews });
};

// حذف تقييم أي مستخدم
export const deleteReviewByAdmin = async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  const review = await BookReview.findByIdAndDelete(reviewId);
  if (!review) throw new NotFound("Review not found");

  SuccessResponse(res, { message: "Review deleted by admin" });
};


