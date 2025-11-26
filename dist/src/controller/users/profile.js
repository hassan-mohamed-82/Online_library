"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteprofile = exports.updateprofile = exports.getprofile = void 0;
const User_1 = require("../../models/schema/auth/User");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const NotFound_1 = require("../../Errors/NotFound");
const cloudinary_1 = require("../../utils/cloudinary");
const getprofile = async (req, res) => {
    let userId = req.user?.id;
    if (!userId)
        throw new BadRequest_1.BadRequest("User not authenticated");
    const user = await User_1.User.findById(userId).select("-password");
    if (!user)
        throw new NotFound_1.NotFound("User not found");
    (0, response_1.SuccessResponse)(res, { message: "User profile fetched", user });
};
exports.getprofile = getprofile;
// دالة مساعدة لرفع Base64 على Cloudinary
const updateprofile = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new BadRequest_1.BadRequest("User not authenticated");
    const user = await User_1.User.findById(userId).select("-password");
    if (!user)
        throw new NotFound_1.NotFound("User not found");
    if (req.body.name)
        user.name = req.body.name;
    if (req.body.email)
        user.email = req.body.email;
    if (req.body.phone)
        user.phone = req.body.phone;
    if (req.body.image) {
        const { image } = req.body;
        try {
            // رفع الصورة على Cloudinary بدل السيرفر المحلي
            const photoUrl = await (0, cloudinary_1.uploadBase64ToCloudinary)(image, "users");
            user.photo = photoUrl;
        }
        catch (err) {
            throw new BadRequest_1.BadRequest("Invalid Base64 image format");
        }
    }
    await user.save();
    (0, response_1.SuccessResponse)(res, { message: "User profile updated", user });
};
exports.updateprofile = updateprofile;
const deleteprofile = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new BadRequest_1.BadRequest("User not authenticated");
    const user = await User_1.User.findById(userId).select("-password");
    if (!user)
        throw new NotFound_1.NotFound("User not found");
    await user.deleteOne();
    (0, response_1.SuccessResponse)(res, { message: "User profile deleted" });
};
exports.deleteprofile = deleteprofile;
