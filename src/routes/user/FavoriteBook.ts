import { Router } from "express";
import {addToFavorites,getFavorites,removeFromFavorites,isBookInFavorites} from "../../controller/users/FavoriteBook";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();
router.post("/", catchAsync(addToFavorites));
router.get("/", catchAsync(getFavorites));
router.delete("/:bookId", catchAsync(removeFromFavorites));
router.get("/:bookId", catchAsync(isBookInFavorites));
export default router;