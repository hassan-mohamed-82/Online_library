// models/User.ts
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // ✅ علامة الاستفهام مهمة في الـ Interface
  phone?: string;    // ✅ علامة الاستفهام مهمة
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
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

UserSchema.index({ fcmtoken: 1 });
UserSchema.index({ role: 1 });

export const User = model<IUser>('User', UserSchema);