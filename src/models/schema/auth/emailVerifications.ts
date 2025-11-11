// models/EmailVerification.ts
import { Schema, model, Document } from 'mongoose';

export interface IEmailVerification extends Document {
  userId: Schema.Types.ObjectId;
  code: string;
  expiresAt: Date;
  verifiedAt?: Date;
  type: 'signup' | 'reset_password'; // نوع الكود
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
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
  },
  { timestamps: true }
);

// === TTL Index: حذف تلقائي بعد انتهاء الصلاحية ===
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// === منع تكرار الكود لنفس المستخدم + نوع ===
EmailVerificationSchema.index({ userId: 1, type: 1 }, { unique: true });

export const EmailVerification = model<IEmailVerification>('EmailVerification', EmailVerificationSchema);