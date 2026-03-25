import { Document } from "mongoose";

export interface ITestimonial extends Document {
  text: string;
  author: string;
  role: string;
  image: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
