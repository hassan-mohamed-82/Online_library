import { Request , Response } from "express";
import { Category } from "../../models/schema/category";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { saveBase64Image } from "../../utils/handleImages";
export const createCategory = async (req: Request, res: Response) => {
    const { name ,icon, parentId} = req.body;
    let iconPath;
    if (icon) {
        try {
            iconPath = await saveBase64Image(icon, "categories", req, "uploads");
        } catch {
            throw new BadRequest("Invalid Base64 image format");
        }
    }
    const category = new Category({ name, icon: iconPath });
    await category.save();
    SuccessResponse(res, { message: "Category created successfully." }, 200);
};

export const getCategories = async (req: Request, res: Response) => {
    const categories = await Category.find();
    SuccessResponse(res, { categories }, 200);
}
export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, parentId , icon} = req.body;
    const category = await Category.findById(id);
    if (!category) {
        throw new NotFound("Category not found");
    }
    if (name) category.name = name;
    if (parentId) category.parentId = parentId;
    if (icon) {
        try {
            category.icon = await saveBase64Image(icon, "categories", req, "uploads");
        } catch {
            throw new BadRequest("Invalid Base64 image format");
        }
    }
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
    const category = await Category.findById(id);
    if (!category) {
        throw new NotFound("Category not found");
    }
    SuccessResponse(res, { category }, 200);
}