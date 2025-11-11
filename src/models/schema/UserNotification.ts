// models/UserNotification.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserNotification extends Document {
  user: mongoose.Types.ObjectId;
  notification: mongoose.Types.ObjectId;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserNotificationSchema = new Schema<IUserNotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notification: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
    },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// منع التكرار: مستخدم واحد + إشعار واحد
UserNotificationSchema.index({ user: 1, notification: 1 }, { unique: true });

// فهرسة لجلب الإشعارات غير المقروءة بسرعة
UserNotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const UserNotification = mongoose.model<IUserNotification>('UserNotification', UserNotificationSchema);