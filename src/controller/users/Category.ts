import { Request , Response } from "express";
import { Category } from "../../models/schema/category";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { saveBase64Image } from "../../utils/handleImages";

export const getCategories = async (req: Request, res: Response) => {
    const categories = await Category.find().populate('parentId', 'name');
    SuccessResponse(res, { categories }, 200);
}
export const getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new BadRequest("Category ID is required");
    }
    const category = await Category.findById(id).populate('parentId', 'name');
    if (!category) {
        throw new NotFound("Category not found");
    }   
    SuccessResponse(res, { category }, 200);
}