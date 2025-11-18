"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooksByCategory = exports.getCategoryById = exports.getCategories = void 0;
const category_1 = require("../../models/schema/category");
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
const books_1 = require("../../models/schema/books");
const getCategories = async (req, res) => {
    // جميع الكاتيجوريز
    const categories = await category_1.Category
        .find()
        .populate("parentId", "name");
    // استخراج IDs للـ Parents
    const parentIds = categories
        .filter(cat => cat.parentId !== null)
        .map(cat => cat.parentId._id.toString());
    const uniqueParentIds = [...new Set(parentIds)];
    // جلب جميع الـ parents
    const parents = await category_1.Category.find({
        _id: { $in: uniqueParentIds }
    });
    (0, response_1.SuccessResponse)(res, {
        message: "Categories fetched successfully.",
        categories, // array
        parents // array
    }, 200);
};
exports.getCategories = getCategories;
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    const category = await category_1.Category
        .findById(id)
        .populate("parentId", "name");
    if (!category) {
        throw new NotFound_1.NotFound("Category not found");
    }
    // Get children categories
    const children = await category_1.Category.find({ parentId: id }).select("name");
    (0, response_1.SuccessResponse)(res, {
        message: "Category fetched successfully.",
        category,
        children // Add children here
    }, 200);
};
exports.getCategoryById = getCategoryById;
const getBooksByCategory = async (req, res) => {
    const { id } = req.params;
    const category = await category_1.Category.findById(id);
    if (!category) {
        throw new NotFound_1.NotFound("Category not found");
    }
    const books = await books_1.BookModel.find({ categoryId: id });
    (0, response_1.SuccessResponse)(res, {
        message: "Books loaded successfully.",
        category,
        books
    }, 200);
};
exports.getBooksByCategory = getBooksByCategory;
