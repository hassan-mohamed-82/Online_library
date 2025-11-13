import { Router } from "express";
import { getAllBooks,getBookById} from "../../controller/users/Book"
import { catchAsync } from "../../utils/catchAsync";
const router = Router();
router.get("/", catchAsync( getAllBooks));
router.get("/:id", catchAsync( getBookById));
export default router;