import { Document } from "mongoose";

export interface ISupporter extends Document {
  name: string;
  logo: string;
  url?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
