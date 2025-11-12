import { Router } from "express";
import { createCategory, getCategories, updateCategory, deleteCategory, getCategoryById } from "../../controller/admin/Category";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { createCategorySchema, updateCategorySchema } from "../../validation/admin/category";

const router = Router();
router.post("/", validate(createCategorySchema), catchAsync(createCategory));
router.get("/", catchAsync(getCategories));
router.get("/:id", catchAsync(getCategoryById));
router.put("/:id", validate(updateCategorySchema), catchAsync(updateCategory));
router.delete("/:id", catchAsync(deleteCategory));
export default router;
