import { Router } from "express";
import {} from "../../controller/users/Category";
import { getCategories, getCategoryById } from "../../controller/users/Category";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();
router.get("/", catchAsync(getCategories));
router.get("/:id", catchAsync(getCategoryById));
export default router;