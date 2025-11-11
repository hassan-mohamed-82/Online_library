// models/User.ts
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'user';
  photo?: string;
  gender?: 'male' | 'female' | 'other';
  emailVerified: boolean;
  fcmtoken?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
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
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// === Indexes مهمة ===
UserSchema.index({ email: 1 });           // للبحث السريع
UserSchema.index({ googleId: 1 });        // لتسجيل الدخول بجوجل
UserSchema.index({ fcmtoken: 1 });        // لإرسال FCM
UserSchema.index({ role: 1 });            // للـ admin panel

export const User = model<IUser>('User', UserSchema);