import { model, Schema, Document } from "mongoose";

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
  dayesofreturn?: number;
  condition?: string; // ✅ غيرناها من 'new' | 'old' لـ string
  weight?: number;
  Synopsis?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    name: { type: String, required: true, unique: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    mainImage: { type: String },
    gallery: [{ type: String }],
    numberOfCopies: { type: Number, required: true, min: 0 },
    numberInStock: { type: Number, required: true, min: 0 },
    borrowedBy: { type: Number, default: 0 },
    publisher: { type: String },
    writer: { type: String },
    language: { type: String }, // ✅ يقبل أي لغة
    publishYear: { type: Number },
    edition: { type: String },
    dayesofreturn: { type: Number },
    Synopsis: { type: String },
    numPages: { type: Number, min: 1 },
    condition: { type: String }, // ✅ شيلنا الـ enum - يقبل أي قيمة
    weight: { type: Number },
  },
  { timestamps: true }
);

BookSchema.index({ categoryId: 1 });
BookSchema.index({ name: "text" });

export const BookModel = model<IBook>("Book", BookSchema);
