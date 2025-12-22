import { model, Schema } from "mongoose";

export interface IBorrow extends Document {
  userId: Schema.Types.ObjectId;
  bookId: Schema.Types.ObjectId;
  borrowDate: Date;
  borrowTime: string;
  mustReturnDate: Date;
  status: 'pending' | 'on_borrow' | 'returned' | 'late'; // ✅ أضفنا late
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
    borrowTime: { type: String, required: true },
    mustReturnDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'on_borrow', 'returned', 'late'], // ✅ صححنا الـ syntax
      default: 'pending',
    },
    qrCodeBorrow: { type: String },
    qrCodeReturn: { type: String },
    qrBorrowExpiresAt: { type: Date },
    qrReturnExpiresAt: { type: Date },
    scannedByAdminAt: { type: Date },
    returnedAt: { type: Date },
  },
  { timestamps: true }
);

BorrowSchema.index({ userId: 1, status: 1 });
BorrowSchema.index({ bookId: 1, status: 1 });

export const Borrow = model<IBorrow>('Borrow', BorrowSchema);
