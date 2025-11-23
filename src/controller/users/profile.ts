import { Request , Response } from "express";
import { User } from "../../models/schema/auth/User";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { saveBase64Image } from "../../utils/handleImages";
import { uploadBase64ToCloudinary } from "../../utils/cloudinary";


export const getprofile = async (req: Request, res: Response) => {
   let userId= req.user?.id;
    if (!userId) throw new BadRequest("User not authenticated");
    const user = await User.findById(userId).select("-password");
    if (!user) throw new NotFound("User not found");
    SuccessResponse(res, { message: "User profile fetched", user });

}


// دالة مساعدة لرفع Base64 على Cloudinary

export const updateprofile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new BadRequest("User not authenticated");

  const user = await User.findById(userId).select("-password");
  if (!user) throw new NotFound("User not found");

  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;
  if (req.body.phone) user.phone = req.body.phone;

  if (req.body.image) {
    const { image } = req.body;
    try {
      // رفع الصورة على Cloudinary بدل السيرفر المحلي
      const photoUrl = await uploadBase64ToCloudinary(image, "users");
      user.photo = photoUrl;
    } catch (err) {
      throw new BadRequest("Invalid Base64 image format");
    }
  }

  await user.save();

  SuccessResponse(res, { message: "User profile updated", user });
};
export const deleteprofile = async (req: Request, res: Response) => {

    let userId= req.user?.id;
    if (!userId) throw new BadRequest("User not authenticated");

    const user = await User.findById(userId).select("-password");
    if (!user) throw new NotFound("User not found");

    user.deleteOne();
    SuccessResponse(res, { message: "User profile deleted", user });
}
