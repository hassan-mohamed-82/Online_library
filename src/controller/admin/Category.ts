import { Request , Response } from "express";
import { Category } from "../../models/schema/category";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { saveBase64Image } from "../../utils/handleImages";
export const createCategory = async (req: Request, res: Response) => {
    const { name , parentId} = req.body;  
    const category = new Category({ name, parentId: parentId || null });
    await category.save();
    SuccessResponse(res, { message: "Category created successfully.", category }, 200);
};
export const getCategories = async (req: Request, res: Response) => {
    const categories = await Category.find().populate('parentId', 'name');
    SuccessResponse(res, {message:"Categories fetched successfully.", categories }, 200);
}
export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, parentId } = req.body;
    const category = await Category.findById(id);
    if (!category) {
        throw new NotFound("Category not found");
    }
    if (name) category.name = name;
    if (parentId) category.parentId = parentId;
   
    await category.save();
    SuccessResponse(res, { message: "Category updated successfully." }, 200);
};
export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new BadRequest("Category ID is required");
    }
    const category = await Category.findByIdAndDelete(id);   
    if (!category) {
        throw new NotFound("Category not found");
    };
    SuccessResponse(res, { message: "Category deleted successfully." }, 200);
};
export const getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await Category.findById(id).populate('parentId', 'name');
    if (!category) {
        throw new NotFound("Category not found");
    }
    SuccessResponse(res, {message:"Category fetched successfully.", category }, 200);
}