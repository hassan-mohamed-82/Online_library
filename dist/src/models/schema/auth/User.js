"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
// models/User.ts
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // ✅ ممتاز: false عشان جوجل ملوش باسوورد
    password: { type: String, required: false, minlength: 6, select: false },
    // ✅ ممتاز: false عشان جوجل مش بيبعت رقم تليفون
    phone: { type: String, required: false, trim: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    photo: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    fcmtoken: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    emailVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
UserSchema.index({ fcmtoken: 1 });
UserSchema.index({ role: 1 });
exports.User = (0, mongoose_1.model)('User', UserSchema);
