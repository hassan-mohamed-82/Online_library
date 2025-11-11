"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
// models/User.ts
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false }, // لا يُرجع في find()
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    photo: { type: String }, // رابط الصورة
    gender: { type: String, enum: ['male', 'female', 'other'] },
    fcmtoken: { type: String }, // للإشعارات
    googleId: { type: String, unique: true, sparse: true }, // لتسجيل الدخول بجوجل
    emailVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// === Indexes مهمة ===
UserSchema.index({ email: 1 }); // للبحث السريع
UserSchema.index({ googleId: 1 }); // لتسجيل الدخول بجوجل
UserSchema.index({ fcmtoken: 1 }); // لإرسال FCM
UserSchema.index({ role: 1 }); // للـ admin panel
exports.User = (0, mongoose_1.model)('User', UserSchema);
