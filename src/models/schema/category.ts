// models/schema/library/Category.ts
import { Schema, model, Document, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  icon?: string;
  parentId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, 
    },
    icon: {
      type: String, 
      trim: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CategorySchema.index({ parentId: 1 });



export const Category = model<ICategory>("Category", CategorySchema);
