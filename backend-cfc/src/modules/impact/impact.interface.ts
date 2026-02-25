import { Document } from "mongoose";

export interface IImpact extends Document {
  title: string;
  description: string;
  category: string;
  tenure?: string;
  location?: string;
  province?: string;
  dates: string;
  platform?: string;
  image: string;
  details?: string;
  isLarge?: boolean;
  metrics?: {
    participants?: number;
    projects?: number;
    impact?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
