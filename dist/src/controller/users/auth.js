"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyResetCode = exports.sendResetCode = exports.getFcmToken = exports.login = exports.verifyEmail = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const mongoose_1 = require("mongoose");
const User_1 = require("../../models/schema/auth/User");
const emailVerifications_1 = require("../../models/schema/auth/emailVerifications");
const handleImages_1 = require("../../utils/handleImages");
const sendEmails_1 = require("../../utils/sendEmails");
const auth_1 = require("../../utils/auth");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
// ======================
// 1. Signup
// ======================
const signup = async (req, res) => {
    const { name, email, password, phone, gender, BaseImage64 } = req.body;
    // 🔹 Check if user already exists
    const existingUser = await User_1.User.findOne({ email });
    if (existingUser) {
        if (!existingUser.emailVerified) {
            throw new BadRequest_1.BadRequest("Email already used but not verified. Please verify your email first.");
        }
        throw new Errors_1.UniqueConstrainError("Email", "User already signed up with this email");
    }
    // 🔹 Hash password
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // 🔹 Handle user photo if provided
    let photo;
    if (BaseImage64) {
        try {
            photo = await (0, handleImages_1.saveBase64Image)(BaseImage64, "users", req, "uploads");
        }
        catch {
            throw new BadRequest_1.BadRequest("Invalid Base64 image format");
        }
    }
    // 🔹 Create user
    const newUser = await User_1.User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        gender,
        photo,
        emailVerified: false,
    });
    // 🔹 Generate verification code
    const code = (0, crypto_1.randomInt)(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    await emailVerifications_1.EmailVerification.create({
        userId: newUser._id,
        code,
        type: "signup",
        expiresAt,
    });
    // 🔹 Send verification email
    await (0, sendEmails_1.sendEmail)(email, "Verify Your Email", `Hello ${name},\n\nWe received a request to verify your Online library account.\nYour verification code is: ${code}\n(This code is valid for 2 hours only)\n\nBest regards,\nOnline library Team`);
    (0, response_1.SuccessResponse)(res, { message: "Signup successful, check your email for the code.", userId: newUser._id }, 201);
};
exports.signup = signup;
// ======================
// 2. Verify Email
// ======================
const verifyEmail = async (req, res) => {
    const { userId, code } = req.body;
    if (!userId || !code)
        throw new BadRequest_1.BadRequest("userId and code are required");
    const record = await emailVerifications_1.EmailVerification.findOne({ userId, type: "signup" });
    if (!record)
        throw new BadRequest_1.BadRequest("No verification record found");
    if (record.code !== code)
        throw new BadRequest_1.BadRequest("Invalid verification code");
    if (record.expiresAt < new Date())
        throw new BadRequest_1.BadRequest("Verification code expired");
    // ✅ تحديث المستخدم كموثّق البريد الإلكتروني
    const user = await User_1.User.findByIdAndUpdate(userId, { $set: { emailVerified: true } }, { new: true });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    // ✅ حذف سجل التحقق بعد النجاح
    await emailVerifications_1.EmailVerification.deleteOne({ _id: record._id });
    // ✅ إنشاء توكن JWT
    const token = (0, auth_1.generateToken)({
        id: user._id.toString(),
        name: user.name,
        role: user.role,
    });
    // ✅ الرد الناجح مع البيانات
    (0, response_1.SuccessResponse)(res, {
        message: "Email verified successfully.",
        token,
        user: user.name,
        role: user.role,
        email: user.email,
        _id: user._id,
    }, 200);
};
exports.verifyEmail = verifyEmail;
// ======================
// 3. Login
// ======================
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        throw new BadRequest_1.BadRequest("Email and password are required");
    const user = await User_1.User.findOne({ email }).select("+password");
    if (!user || !user.password)
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    if (!user.emailVerified)
        throw new Errors_1.ForbiddenError("Please verify your email first.");
    // 🔹 Generate JWT (valid 7 days)
    const token = (0, auth_1.generateToken)({
        id: user._id.toString(),
        name: user.name,
        role: user.role,
    });
    (0, response_1.SuccessResponse)(res, { message: "Login successful.", token, user: user.name, role: user.role, email: user.email, _id: user._id }, 200);
};
exports.login = login;
// ======================
// 4. Save FCM Token
// ======================
const getFcmToken = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    if (!req.body.token)
        throw new BadRequest_1.BadRequest("FCM token is required");
    const userId = new mongoose_1.Types.ObjectId(req.user.id);
    const user = await User_1.User.findById(userId);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    user.fcmtoken = req.body.token;
    await user.save();
    (0, response_1.SuccessResponse)(res, { message: "FCM token updated successfully." }, 200);
};
exports.getFcmToken = getFcmToken;
// ======================
// 5. Send Reset Password Code
// ======================
const sendResetCode = async (req, res) => {
    const { email } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (!user.emailVerified)
        throw new BadRequest_1.BadRequest("User is not verified");
    // Remove old codes
    await emailVerifications_1.EmailVerification.deleteMany({ userId: user._id, type: "reset_password" });
    const code = (0, crypto_1.randomInt)(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    await emailVerifications_1.EmailVerification.create({
        userId: user._id,
        code,
        type: "reset_password",
        expiresAt,
    });
    await (0, sendEmails_1.sendEmail)(email, "Reset Password Code", `Hello ${user.name},\n\nYour password reset code is: ${code}\n(This code is valid for 2 hours)\n\nBest regards,\nOnline library Team`);
    (0, response_1.SuccessResponse)(res, { message: "Reset code sent to your email." }, 200);
};
exports.sendResetCode = sendResetCode;
// ======================
// 6. Verify Reset Code
// ======================
const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const record = await emailVerifications_1.EmailVerification.findOne({
        userId: user._id,
        type: "reset_password",
    });
    if (!record)
        throw new BadRequest_1.BadRequest("No reset code found");
    if (record.code !== code)
        throw new BadRequest_1.BadRequest("Invalid code");
    if (record.expiresAt < new Date())
        throw new BadRequest_1.BadRequest("Code expired");
    (0, response_1.SuccessResponse)(res, { message: "Reset code verified successfully." }, 200);
};
exports.verifyResetCode = verifyResetCode;
// ======================
// 7. Reset Password
// ======================
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const record = await emailVerifications_1.EmailVerification.findOne({
        userId: user._id,
        type: "reset_password",
    });
    if (!record)
        throw new BadRequest_1.BadRequest("No reset code found");
    if (record.code !== code)
        throw new BadRequest_1.BadRequest("Invalid code");
    if (record.expiresAt < new Date())
        throw new BadRequest_1.BadRequest("Code expired");
    // 🔹 Update password securely
    user.password = await bcrypt_1.default.hash(newPassword, 10);
    await user.save();
    // 🔹 Delete old codes
    await emailVerifications_1.EmailVerification.deleteMany({ userId: user._id, type: "reset_password" });
    (0, response_1.SuccessResponse)(res, { message: "Password reset successful." }, 200);
};
exports.resetPassword = resetPassword;
