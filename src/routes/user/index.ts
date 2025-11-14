 import { Router } from "express";
import authRouter from "../user/auth/index";
import CategoryRouter from "./category";
import BookRouter from "./books";
import FavouriteBookRouter from "./FavoriteBook";
import BookReviewRouter from "./BookReview";
import NotificationRouter from "./notification";
import profileRouter from "./profile";
import BorrowRouter from "./Borrow";


import { authenticated } from "../../middlewares/authenticated";
 const route = Router();
route.use("/auth", authRouter);
route.use(authenticated);
route.use("/categories", CategoryRouter);
route.use("/books", BookRouter);
route.use("/favorite-books", FavouriteBookRouter);
route.use("/book-reviews", BookReviewRouter);
route.use("/notification", NotificationRouter);
route.use("/borrows", BorrowRouter);
route.use("/profile", profileRouter);
export default route;