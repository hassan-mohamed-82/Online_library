"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooksByCategory = exports.getCategoryById = exports.deleteCategory = exports.updateCategory = exports.getCategories = exports.createCategory = void 0;
const category_1 = require("../../models/schema/category");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const NotFound_1 = require("../../Errors/NotFound");
const books_1 = require("../../models/schema/books");
// ==============================
// Create Category
// ==============================
const createCategory = async (req, res) => {
    const { name, parentId } = req.body;
    // التحقق من وجود الـ parent إذا تم إرساله
    if (parentId) {
        const parentExists = await category_1.Category.findById(parentId);
        if (!parentExists) {
            throw new BadRequest_1.BadRequest("Parent category not found");
        }
    }
    const category = new category_1.Category({
        name,
        parentId: parentId || null
    });
    await category.save();
    (0, response_1.SuccessResponse)(res, {
        message: "Category created successfully.",
        category
    }, 200);
};
exports.createCategory = createCategory;
// ==============================
// Get All Categories + Parents Array
// ==============================
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
// ==============================
// Update Category
// ==============================
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, parentId } = req.body;
    const category = await category_1.Category.findById(id);
    if (!category) {
        throw new NotFound_1.NotFound("Category not found");
    }
    // التحقق من parent
    if (parentId) {
        const parentExists = await category_1.Category.findById(parentId);
        if (!parentExists) {
            throw new BadRequest_1.BadRequest("Parent category not found");
        }
        // منع جعل الكاتيجوري parent لنفسه
        if (parentId === id) {
            throw new BadRequest_1.BadRequest("A category cannot be its own parent");
        }
    }
    if (name)
        category.name = name;
    category.parentId = parentId || null;
    await category.save();
    (0, response_1.SuccessResponse)(res, {
        message: "Category updated successfully.",
        category
    }, 200);
};
exports.updateCategory = updateCategory;
// ==============================
// Delete Category
// ==============================
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Category ID is required");
    const category = await category_1.Category.findByIdAndDelete(id);
    if (!category)
        throw new NotFound_1.NotFound("Category not found");
    (0, response_1.SuccessResponse)(res, {
        message: "Category deleted successfully."
    }, 200);
};
exports.deleteCategory = deleteCategory;
// ==============================
// Get Category by ID
// ==============================
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    const category = await category_1.Category
        .findById(id)
        .populate("parentId", "name");
    if (!category) {
        throw new NotFound_1.NotFound("Category not found");
    }
    (0, response_1.SuccessResponse)(res, {
        message: "Category fetched successfully.",
        category
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
