import Joi from "joi";
import { Types } from "mongoose";

// Helper للتحقق من ObjectId
const objectIdValidator = Joi.string().custom((value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId validation");

// Schema لإنشاء Book
export const createBookSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  categoryId: objectIdValidator.required(),
  mainImage: Joi.string().uri(),
  gallery: Joi.array().items(Joi.string().uri()).max(10),
  numberOfCopies: Joi.number().min(0).required(),
  numberInStock: Joi.number().min(0).required(),
  borrowedBy: Joi.number().min(0),
  publisher: Joi.string().max(100),
  writer: Joi.string().max(100),
  language: Joi.string().max(50),
  publishYear: Joi.number().min(1000).max(new Date().getFullYear()),
  edition: Joi.string().max(50),
  numPages: Joi.number().min(1),
  condition: Joi.string(),
  weight: Joi.number().min(0),
  Synopsis: Joi.string().max(2000),
});

// Schema لتحديث Book (كل الحقول اختيارية)
export const updateBookSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  categoryId: objectIdValidator,
  mainImage: Joi.string().uri(),
  gallery: Joi.array().items(Joi.string().uri()).max(10),
  numberOfCopies: Joi.number().min(0),
  numberInStock: Joi.number().min(0),
  borrowedBy: Joi.number().min(0),
  publisher: Joi.string().max(100),
  writer: Joi.string().max(100),
  language: Joi.string().max(50),
  publishYear: Joi.number().min(1000).max(new Date().getFullYear()),
  edition: Joi.string().max(50),
  numPages: Joi.number().min(1),
  condition: Joi.string(),
  weight: Joi.number().min(0),
  Synopsis: Joi.string().max(2000),
});
