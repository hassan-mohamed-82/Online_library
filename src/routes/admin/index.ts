import { Router } from "express";
import authRouter from "./auth";
import CategoryRouter from "./category";
import BookRouter from "./books";
import BookReviewRouter from "./BookReview";
import BorrowRouter from "./Borrow";
import NotificationRouter from "./notification";
import { authenticated } from "../../middlewares/authenticated";
import {  authorizeRoles } from "../../middlewares/authorized";

export const route = Router();

route.use("/auth", authRouter);
route.use(authenticated,authorizeRoles("admin"));
route.use("/categories", CategoryRouter);
route.use("/books", BookRouter);
route.use("/book-reviews", BookReviewRouter);
route.use("/notification", NotificationRouter);
route.use("/borrows", BorrowRouter);
export default route;