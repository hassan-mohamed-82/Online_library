"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/schema/auth/User");
dotenv_1.default.config();
// 1️⃣ التعديل الأول: تركنا القوسين فارغين لجعل العميل مرناً
const client = new google_auth_library_1.OAuth2Client();
const verifyGoogleToken = async (req, res) => {
    let { token } = req.body;
    try {
        // 2️⃣ التعديل الثاني: تنظيف التوكن لو وصل ومعه كلمة Bearer
        if (token && token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trim();
        }
        const ticket = await client.verifyIdToken({
            idToken: token,
            // 3️⃣ قبول الـ ID الموجود في البيئة والـ ID الذي ظهر في الخطأ
            audience: [
                process.env.GOOGLE_CLIENT_ID,
                "813623514492-jibeig9a2l5a4gap63um33chv4navsq0.apps.googleusercontent.com"
            ],
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Google payload" });
        }
        const email = payload.email;
        const name = payload.name || "Unknown User";
        const googleId = payload.sub;
        // 🔍 check if user exists by googleId OR email
        let user = await User_1.User.findOne({ $or: [{ googleId }, { email }] });
        if (!user) {
            // ➕ Signup (new user)
            user = new User_1.User({
                googleId,
                email,
                name,
                isVerified: true,
            });
            await user.save();
        }
        else {
            // 👤 Login (existing user)
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        }
        // 🔑 Generate JWT
        const authToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return res.json({
            success: true,
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        // طباعة الخطأ كاملاً في الـ Terminal لمعرفة السبب الحقيقي
        console.error("Google login error details:", error.message);
        res.status(401).json({
            success: false,
            message: "Invalid token signature or ID mismatch",
            error: error.message // (اختياري) إرسال سبب الخطأ للفرونت إند للتسهيل
        });
    }
};
exports.verifyGoogleToken = verifyGoogleToken;
