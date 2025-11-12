import { Router } from "express";
import authRouter from "./auth";
import CategoryRouter from "./category";
import { authenticated } from "../../middlewares/authenticated";
import {  authorizeRoles } from "../../middlewares/authorized";

export const route = Router();

route.use("/auth", authRouter);
route.use(authenticated,authorizeRoles("admin"));
route.use("/categories", CategoryRouter);

export default route;