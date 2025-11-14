import { Request , Response } from "express";
import { User } from "../../models/schema/auth/User";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { saveBase64Image } from "../../utils/handleImages";

export const getprofile = async (req: Request, res: Response) => {

   let userId= req.user?.id;
    if (!userId) throw new BadRequest("User not authenticated");
    const user = await User.findById(userId).select("-password");
    if (!user) throw new NotFound("User not found");
    SuccessResponse(res, { message: "User profile fetched", user });

}

export const updateprofile = async (req: Request, res: Response) => {

    let userId= req.user?.id;
    if (!userId) throw new BadRequest("User not authenticated");

    const user = await User.findById(userId).select("-password");
    if (!user) throw new NotFound("User not found");

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.image) {
        const { image } = req.body;
        try {
            const photo = await saveBase64Image(image, "users", req, "uploads");
            user.photo = photo;
        } catch {
            throw new BadRequest("Invalid Base64 image format");
        }
    }

    await user.save();

    SuccessResponse(res, { message: "User profile updated", user });
}

export const deleteprofile = async (req: Request, res: Response) => {

    let userId= req.user?.id;
    if (!userId) throw new BadRequest("User not authenticated");

    const user = await User.findById(userId).select("-password");
    if (!user) throw new NotFound("User not found");

    user.deleteOne();
    SuccessResponse(res, { message: "User profile deleted", user });
}
