import { Router } from "express";
import  {getAllReviews,deleteReviewByAdmin} from "../../controller/admin/BookReview"

const router = Router();
router.get("/", getAllReviews);
router.delete("/:id", deleteReviewByAdmin);
export default router;