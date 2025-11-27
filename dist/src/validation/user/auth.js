"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.checkResetCodeSchema = exports.sendResetCodeSchema = exports.verifyEmailSchema = exports.googleAuthSchema = exports.loginSchema = exports.signupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// 1. Signup العادي (Email + Password)
// هنا رقم التليفون والباسوورد مطلوبين إجباري
exports.signupSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    // شلنا BaseImage64 وخليناها photo بس عشان تبقى موحدة مع Mongoose
    // أو ممكن تسيب الاتنين لو الفرونت بيبعت ده أو ده
    photo: joi_1.default.string().optional(),
    BaseImage64: joi_1.default.string().optional(),
    // ✅ ضفنا "other" عشان تطابق Mongoose
    gender: joi_1.default.string().valid("male", "female", "other").optional(),
    phone: joi_1.default.string().min(10).max(15).required(), // إجباري في التسجيل العادي فقط
});
// 2. Login العادي
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
// 🆕 3. Google Login (مهم جداً تضيف ده)
exports.googleAuthSchema = joi_1.default.object({
    token: joi_1.default.string().required(), // الـ ID Token اللي جاي من الفرونت
});
exports.verifyEmailSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    code: joi_1.default.string().required(),
});
exports.sendResetCodeSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
});
exports.checkResetCodeSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(), // ✅ ضفنا .email()
    code: joi_1.default.string().required(),
});
exports.resetPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(), // ✅ ضفنا .email()
    code: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(6).max(30).required(),
});
