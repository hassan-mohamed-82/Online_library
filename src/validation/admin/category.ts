import Joi from "joi";
export const createCategorySchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    parentId: Joi.string().optional(),
});
export const updateCategorySchema = Joi.object({
    name: Joi.string().min(3).max(50).optional(),
  
    parentId: Joi.string().optional(),
});