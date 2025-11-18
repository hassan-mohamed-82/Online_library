import { Request , Response } from "express";
import { Category } from "../../models/schema/category";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { saveBase64Image } from "../../utils/handleImages";
import { BookModel } from "../../models/schema/books";

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
    
}
export const getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await Category
        .findById(id)
        .populate("parentId", "name");

    if (!category) {
        throw new NotFound("Category not found");
    }

    // Get children categories
    const children = await Category.find({ parentId: id }).select("name");

    SuccessResponse(res, {
        message: "Category fetched successfully.",
        category,
        children // Add children here
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