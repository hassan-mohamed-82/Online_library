import { model, Schema } from "mongoose";

export interface IBook extends Document {
  name: string;
  categoryId: Schema.Types.ObjectId;
  mainImage?: string;
  gallery: string[];
  numberOfCopies: number;
  numberInStock: number;
  borrowedBy: number;
  publisher?: string;
  writer?: string;
  language?: string;
  publishYear?: number;
  edition?: string;
  numPages?: number;
  condition?: 'new' | 'good' | 'fair' | 'poor';
  weight?: number;
  Synopsis?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    name: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    mainImage: { type: String },
    gallery: [{ type: String }],
    numberOfCopies: { type: Number, required: true, min: 0 },
    numberInStock: { type: Number, required: true, min: 0 },
    borrowedBy: { type: Number, default: 0 },
    publisher: { type: String },
    writer: { type: String },
    language: { type: String },
    publishYear: { type: Number },
    edition: { type: String },
    Synopsis: { type: String },
    numPages: { type: Number, min: 1 },
    condition: { type: String, enum: ['new', 'good', 'fair', 'poor'], default: 'good' },
    weight: { type: Number }, // جرام
  },
  { timestamps: true }
);

BookSchema.index({ categoryId: 1 });
BookSchema.index({ name: 'text' }); // للبحث

export const BookModel = model<IBook>('Book', BookSchema);