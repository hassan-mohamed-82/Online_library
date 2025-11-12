 import { Router } from "express";
import authRouter from "../user/auth/index";
import CategoryRouter from "./category";
import { authenticated } from "../../middlewares/authenticated";
 const route = Router();
route.use("/auth", authRouter);
route.use(authenticated);
route.use("/categories", CategoryRouter);
 export default route;