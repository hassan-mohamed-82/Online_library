import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { scanBorrowQR, scanReturnQR, getAllBorrows } from "../../controller/admin/Borrow";

const router = Router();

router.post("/scan/:borrowId", catchAsync(scanBorrowQR));

router.post("/scan/return/:borrowId", catchAsync(scanReturnQR));

router.get("/", catchAsync(getAllBorrows));

export default router;
