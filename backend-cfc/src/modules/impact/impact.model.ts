import { Schema, model } from "mongoose";
import { IImpact } from "./impact.interface.js";

const impactSchema = new Schema<IImpact>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    tenure: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    province: {
      type: String,
      trim: true,
    },
    dates: {
      type: String,
      required: [true, "Dates are required"],
      trim: true,
    },
    platform: {
      type: String,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    isLarge: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    metrics: {
      participants: Number,
      projects: Number,
      impact: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Impact = model<IImpact>("Impact", impactSchema);
