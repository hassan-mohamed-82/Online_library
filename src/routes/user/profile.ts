import { Router } from "express";
import { getprofile,updateprofile,deleteprofile} from "../../controller/users/profile";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();
router.get("/", catchAsync(getprofile));
router.put("/", catchAsync(updateprofile));
router.delete("/", catchAsync(deleteprofile));
export default router;