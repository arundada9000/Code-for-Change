import { Document } from "mongoose";

export interface IGallery extends Document {
  title: string;
  imageUrl: string;
  category: string;
  province?: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
