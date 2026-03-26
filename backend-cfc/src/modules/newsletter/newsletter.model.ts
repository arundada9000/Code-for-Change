import { Schema, model } from "mongoose";
import { INewsletterSubscriber } from "./newsletter.interface.js";

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
newsletterSubscriberSchema.index({ email: 1 });
newsletterSubscriberSchema.index({ status: 1 });
newsletterSubscriberSchema.index({ subscribedAt: -1 });

export const NewsletterSubscriber = model<INewsletterSubscriber>(
  "NewsletterSubscriber",
  newsletterSubscriberSchema
);
