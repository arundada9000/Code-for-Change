import { Document } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  status: "active" | "unsubscribed";
  subscribedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
