"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerification = void 0;
// models/EmailVerification.ts
const mongoose_1 = require("mongoose");
const EmailVerificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        required: true,
        length: 6
    },
    type: {
        type: String,
        enum: ['signup', 'reset_password'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 ساعة
    },
    verifiedAt: { type: Date },
}, { timestamps: true });
// === TTL Index: حذف تلقائي بعد انتهاء الصلاحية ===
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// === منع تكرار الكود لنفس المستخدم + نوع ===
EmailVerificationSchema.index({ userId: 1, type: 1 }, { unique: true });
exports.EmailVerification = (0, mongoose_1.model)('EmailVerification', EmailVerificationSchema);
