import { model, Schema } from "mongoose";

export interface IBookReview extends Document {
  bookId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const BookReviewSchema = new Schema<IBookReview>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

// كل يوزر يقيّم كتاب مرة واحدة
BookReviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export const BookReview = model<IBookReview>('BookReview', BookReviewSchema);