import { model, Schema } from "mongoose";

export interface IFavoriteBook extends Document {
  userId: Schema.Types.ObjectId;
  bookId: Schema.Types.ObjectId;
  createdAt: Date;
}

const FavoriteBookSchema = new Schema<IFavoriteBook>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  },
  { timestamps: true }
);

FavoriteBookSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const FavoriteBook = model<IFavoriteBook>('FavoriteBook', FavoriteBookSchema);