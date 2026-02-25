import { Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  province?: string;
  category: string;
  image: string;
  tags: string[];
  readTime?: string;
  isPublished: boolean;
  publishedAt?: Date;
  slug?: string;
  highlights: string[];
  authorDetails: {
    name: string;
    role: string;
    image?: string;
    linkedin?: string;
    facebook?: string;
    tiktok?: string;
    instagram?: string;
    youtube?: string;
  };
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt: Date;
  updatedAt: Date;
}
