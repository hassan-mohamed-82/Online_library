import { Request, Response } from "express";
import { Category } from "../../models/schema/category";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { BookModel } from "../../models/schema/books";

// ==============================
// Create Category
// ==============================
export const createCategory = async (req: Request, res: Response) => {
    const { name, parentId } = req.body;

    // التحقق من وجود الـ parent إذا تم إرساله
    if (parentId) {
        const parentExists = await Category.findById(parentId);
        if (!parentExists) {
            throw new BadRequest("Parent category not found");
        }
    }

    const category = new Category({
        name,
        parentId: parentId || null
    });

    await category.save();

    SuccessResponse(res, {
        message: "Category created successfully.",
        category
    }, 200);
};

// ==============================
// Get All Categories + Parents Array
// ==============================
export const getCategories = async (req: Request, res: Response) => {

    // جميع الكاتيجوريز
    const categories = await Category
        .find()
        .populate("parentId", "name");

    // استخراج IDs للـ Parents
    const parentIds = categories
        .filter(cat => cat.parentId !== null)
        .map(cat => (cat.parentId as any)._id.toString());

    const uniqueParentIds = [...new Set(parentIds)];

    // جلب جميع الـ parents
    const parents = await Category.find({
        _id: { $in: uniqueParentIds }
    });

    SuccessResponse(res, {
        message: "Categories fetched successfully.",
        categories,   // array
        parents       // array
    }, 200);
};

// ==============================
// Update Category
// ==============================
export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const category = await Category.findById(id);
    if (!category) {
        throw new NotFound("Category not found");
    }

    // التحقق من parent
    if (parentId) {
        const parentExists = await Category.findById(parentId);
        if (!parentExists) {
            throw new BadRequest("Parent category not found");
        }

        // منع جعل الكاتيجوري parent لنفسه
        if (parentId === id) {
            throw new BadRequest("A category cannot be its own parent");
        }
    }

    if (name) category.name = name;
    category.parentId = parentId || null;

    await category.save();

    SuccessResponse(res, {
        message: "Category updated successfully.",
        category
    }, 200);
};

// ==============================
// Delete Category
// ==============================
export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) throw new BadRequest("Category ID is required");

    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new NotFound("Category not found");

    SuccessResponse(res, { 
        message: "Category deleted successfully." 
    }, 200);
};

// ==============================
// Get Category by ID
// ==============================
export const getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await Category
        .findById(id)
        .populate("parentId", "name");

    if (!category) {
        throw new NotFound("Category not found");
    }

    SuccessResponse(res, {
        message: "Category fetched successfully.",
        category
    }, 200);
};


export const getBooksByCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
        throw new NotFound("Category not found");
    }

    const books = await BookModel.find({ categoryId: id });

    SuccessResponse(res, {
        message: "Books loaded successfully.",
        category,
        books
    }, 200);
};