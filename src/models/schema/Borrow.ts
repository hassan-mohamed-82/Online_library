import { model, Schema } from "mongoose";

export interface IBorrow extends Document {
  userId: Schema.Types.ObjectId;
  bookId: Schema.Types.ObjectId;
  borrowDate: Date;
  borrowTime: string; // HH:MM
  mustReturnDate: Date;
  status: 'pending' | 'on_borrow' | 'returned' ;
  qrCodeBorrow?: string;
  qrCodeReturn?: string;
  qrBorrowExpiresAt?: Date;
  qrReturnExpiresAt?: Date;
  scannedByAdminAt?: Date;
  returnedAt?: Date;
  createdAt: Date;
}

const BorrowSchema = new Schema<IBorrow>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowDate: { type: Date, required: true, default: Date.now },
    borrowTime: { type: String, required: true }, // "14:30"
    mustReturnDate: { type: Date, required: true }, // +7 أيام مثلاً
    status: {
      type: String,
      enum: ['pending', 'on_borrow', 'returned', 'expired'],
      default: 'pending',
    },
    qrCodeBorrow: { type: String },
    qrCodeReturn: { type: String },
    qrBorrowExpiresAt: { type: Date }, // +3 ساعات
    qrReturnExpiresAt: { type: Date },
    scannedByAdminAt: { type: Date },
    returnedAt: { type: Date },
  },
  { timestamps: true }
);

// TTL للـ QR: ينتهي تلقائياً بعد 3 ساعات
BorrowSchema.index({ qrBorrowExpiresAt: 1 }, { expireAfterSeconds: 0 });
BorrowSchema.index({ qrReturnExpiresAt: 1 }, { expireAfterSeconds: 0 });

// فهرسة للاستعلامات
BorrowSchema.index({ userId: 1, status: 1 });
BorrowSchema.index({ bookId: 1, status: 1 });

export const Borrow = model<IBorrow>('Borrow', BorrowSchema);