"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BookReview_1 = require("../../controller/admin/BookReview");
const router = (0, express_1.Router)();
router.get("/", BookReview_1.getAllReviews);
router.delete("/:id", BookReview_1.deleteReviewByAdmin);
exports.default = router;
