import { Document } from "mongoose";

export interface IPeriodical extends Document {
  title: string;
  description: string;
  province?: string;
  category?: string;
  tags: string[];
  files: string[];
  isPublished: boolean;
  publishedAt?: Date;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
