import { Schema, model } from "mongoose";
import { IGallery } from "./gallery.interface.js";

const gallerySchema = new Schema<IGallery>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    province: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Gallery = model<IGallery>("Gallery", gallerySchema);
