import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { Types } from "mongoose";

import { User } from "../../models/schema/auth/User";
import { EmailVerification } from "../../models/schema/auth/emailVerifications";
import { saveBase64Image } from "../../utils/handleImages";
import { sendEmail } from "../../utils/sendEmails";
import { generateToken } from "../../utils/auth";
import { SuccessResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../../types/custom";

import {
  ForbiddenError,
  NotFound,
  UnauthorizedError,
  UniqueConstrainError,
} from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";

// ======================
// 1. Signup
// ======================
export const signup = async (req: Request, res: Response) => {
  const { name, email, password, phone, gender, BaseImage64 } = req.body;

  // 🔹 Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (!existingUser.emailVerified) {
      throw new BadRequest(
        "Email already used but not verified. Please verify your email first."
      );
    }
    throw new UniqueConstrainError(
      "Email",
      "User already signed up with this email"
    );
  }

  // 🔹 Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 🔹 Handle user photo if provided
  let photo;
  if (BaseImage64) {
    try {
      photo = await saveBase64Image(BaseImage64, "users", req, "uploads");
    } catch {
      throw new BadRequest("Invalid Base64 image format");
    }
  }

  // 🔹 Create user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    gender,
    photo,
    emailVerified: false,
  });

  // 🔹 Generate verification code
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  await EmailVerification.create({
    userId: newUser._id,
    code,
    type: "signup",
    expiresAt,
  });

  // 🔹 Send verification email
  await sendEmail(
    email,
    "Verify Your Email",
    `Hello ${name},\n\nWe received a request to verify your Smart College account.\nYour verification code is: ${code}\n(This code is valid for 2 hours only)\n\nBest regards,\nSmart College Team`
  );

  SuccessResponse(
    res,
    { message: "Signup successful, check your email for the code.", userId: newUser._id },
    201
  );
};

// ======================
// 2. Verify Email
// ======================
export const verifyEmail = async (req: Request, res: Response) => {
  const { userId, code } = req.body;

  if (!userId || !code) throw new BadRequest("userId and code are required");

  const record = await EmailVerification.findOne({ userId, type: "signup" });
  if (!record) throw new BadRequest("No verification record found");
  if (record.code !== code) throw new BadRequest("Invalid verification code");
  if (record.expiresAt < new Date()) throw new BadRequest("Verification code expired");

  // ✅ تحديث المستخدم كموثّق البريد الإلكتروني
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { emailVerified: true } },
    { new: true }
  );
  if (!user) throw new NotFound("User not found");

  // ✅ حذف سجل التحقق بعد النجاح
  await EmailVerification.deleteOne({ _id: record._id });

  // ✅ إنشاء توكن JWT
  const token = generateToken({
    id: (user._id as Types.ObjectId).toString(),
    name: user.name,
    role: user.role,
  });

  // ✅ الرد الناجح مع البيانات
  SuccessResponse(
    res,
    {
      message: "Email verified successfully.",
      token,
      user: user.name,
      role: user.role,
      email: user.email,
      _id: user._id,
    },
    200
  );
};


// ======================
// 3. Login
// ======================
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) throw new BadRequest("Email and password are required");

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password)
    throw new UnauthorizedError("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new UnauthorizedError("Invalid email or password");

  if (!user.emailVerified)
    throw new ForbiddenError("Please verify your email first.");

  // 🔹 Generate JWT (valid 7 days)
  const token = generateToken(
    {
      id: (user._id as Types.ObjectId).toString(),
      name: user.name,
      role: user.role,
    },
  );

  SuccessResponse(res, { message: "Login successful.", token , user: user.name , role: user.role, email: user.email,_id: user._id }, 200);
};

// ======================
// 4. Save FCM Token
// ======================
export const getFcmToken = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");
  if (!req.body.token) throw new BadRequest("FCM token is required");

  const userId = new Types.ObjectId(req.user.id);
  const user = await User.findById(userId);
  if (!user) throw new NotFound("User not found");

  user.fcmtoken = req.body.token;
  await user.save();

  SuccessResponse(res, { message: "FCM token updated successfully." }, 200);
};

// ======================
// 5. Send Reset Password Code
// ======================
export const sendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new NotFound("User not found");
  if (!user.emailVerified) throw new BadRequest("User is not verified");

  // Remove old codes
  await EmailVerification.deleteMany({ userId: user._id, type: "reset_password" });

  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  await EmailVerification.create({
    userId: user._id,
    code,
    type: "reset_password",
    expiresAt,
  });

  await sendEmail(
    email,
    "Reset Password Code",
    `Hello ${user.name},\n\nYour password reset code is: ${code}\n(This code is valid for 2 hours)\n\nBest regards,\nSmart College Team`
  );

  SuccessResponse(res, { message: "Reset code sent to your email." }, 200);
};

// ======================
// 6. Verify Reset Code
// ======================
export const verifyResetCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new NotFound("User not found");

  const record = await EmailVerification.findOne({
    userId: user._id,
    type: "reset_password",
  });

  if (!record) throw new BadRequest("No reset code found");
  if (record.code !== code) throw new BadRequest("Invalid code");
  if (record.expiresAt < new Date()) throw new BadRequest("Code expired");

  SuccessResponse(res, { message: "Reset code verified successfully." }, 200);
};

// ======================
// 7. Reset Password
// ======================
export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new NotFound("User not found");

  const record = await EmailVerification.findOne({
    userId: user._id,
    type: "reset_password",
  });

  if (!record) throw new BadRequest("No reset code found");
  if (record.code !== code) throw new BadRequest("Invalid code");
  if (record.expiresAt < new Date()) throw new BadRequest("Code expired");

  // 🔹 Update password securely
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // 🔹 Delete old codes
  await EmailVerification.deleteMany({ userId: user._id, type: "reset_password" });

  SuccessResponse(res, { message: "Password reset successful." }, 200);
};
