// models/Notification.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  body: string;
  type: 'borrow_request' | 'borrow_approved' | 'return_request' | 'return_approved' | 'qr_expired' | 'overdue' | 'system';
  relatedId?: mongoose.Types.ObjectId; // مثل borrowId أو bookId
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    
      relatedId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// فهرسة للبحث حسب النوع والتاريخ
NotificationSchema.index({ type: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);