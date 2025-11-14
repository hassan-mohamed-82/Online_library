"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catchAsync_1 = require("../../utils/catchAsync");
const Borrow_1 = require("../../controller/users/Borrow");
const router = (0, express_1.Router)();
// استعارة كتاب مباشر
router.post("/:bookId", (0, catchAsync_1.catchAsync)(Borrow_1.borrowBook));
// طلب إرجاع كتاب (توليد QR للإرجاع)
router.post("/return/:borrowId", (0, catchAsync_1.catchAsync)(Borrow_1.returnBook));
// عرض كل borrowات المستخدم
router.get("/", (0, catchAsync_1.catchAsync)(Borrow_1.getUserBorrows));
exports.default = router;
