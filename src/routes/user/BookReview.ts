import { Router } from "express";
import {addReview,updateReview,deleteReview,getBookReviews } from "../../controller/users/BookReview";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { createReviewSchema, updateReviewSchema } from "../../validation/user/BookReview";
const router = Router();
router.post("/", validate(createReviewSchema), catchAsync(addReview));
router.put("/:id", validate(updateReviewSchema), catchAsync(updateReview));
router.delete("/:id", catchAsync(deleteReview));
router.get("/book/:bookId", catchAsync(getBookReviews));

export default router;