import Joi from "joi";

// 1. Signup العادي (Email + Password)
// هنا رقم التليفون والباسوورد مطلوبين إجباري
export const signupSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  
  // شلنا BaseImage64 وخليناها photo بس عشان تبقى موحدة مع Mongoose
  // أو ممكن تسيب الاتنين لو الفرونت بيبعت ده أو ده
  photo: Joi.string().optional(), 
  BaseImage64: Joi.string().optional(),

  // ✅ ضفنا "other" عشان تطابق Mongoose
  gender: Joi.string().valid("male", "female", "other").optional(),
  
  phone: Joi.string().min(10).max(15).required(), // إجباري في التسجيل العادي فقط
});

// 2. Login العادي
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// 🆕 3. Google Login (مهم جداً تضيف ده)
export const googleAuthSchema = Joi.object({
  token: Joi.string().required(), // الـ ID Token اللي جاي من الفرونت
});

export const verifyEmailSchema = Joi.object({
  userId: Joi.string().required(),
  code: Joi.string().required(),
});

export const sendResetCodeSchema = Joi.object({
  email: Joi.string().email().required(),
}); 

export const checkResetCodeSchema = Joi.object({
  email: Joi.string().email().required(), // ✅ ضفنا .email()
  code: Joi.string().required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(), // ✅ ضفنا .email()
  code: Joi.string().required(),
  newPassword: Joi.string().min(6).max(30).required(),
});