"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BookReview_1 = require("../../controller/admin/BookReview");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router.get("/:bookId", (0, catchAsync_1.catchAsync)(BookReview_1.getBookReviews));
router.delete("/:reviewId", (0, catchAsync_1.catchAsync)(BookReview_1.deleteReviewByAdmin));
exports.default = router;
