import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { borrowBook,returnBook,getUserBorrows  } from "../../controller/users/Borrow";

const router = Router();


// استعارة كتاب مباشر
router.post("/:bookId", catchAsync(borrowBook));

// طلب إرجاع كتاب (توليد QR للإرجاع)
router.post("/return/:borrowId", catchAsync(returnBook));

// عرض كل borrowات المستخدم
router.get("/", catchAsync(getUserBorrows));

export default router;
