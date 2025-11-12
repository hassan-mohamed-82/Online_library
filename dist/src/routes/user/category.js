"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Category_1 = require("../../controller/users/Category");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router.get("/", (0, catchAsync_1.catchAsync)(Category_1.getCategories));
router.get("/:id", (0, catchAsync_1.catchAsync)(Category_1.getCategoryById));
exports.default = router;
