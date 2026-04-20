import { Document } from "mongoose";

export interface IWalkthrough extends Document {
  title: string;
  description: string;
  content: string;
  province?: string;
  category?: string;
  tags: string[];
  image: string;
  files: string[];
  readTime?: string;
  isPublished: boolean;
  publishedAt?: Date;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
