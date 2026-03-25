import { Schema, model } from "mongoose";
import { ITestimonial } from "./testimonial.interface.js";

const testimonialSchema = new Schema<ITestimonial>(
  {
    text: {
      type: String,
      required: [true, "Testimonial text is required"],
      trim: true,
      maxlength: [1000, "Text cannot exceed 1000 characters"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      required: [true, "Author role is required"],
      trim: true,
      maxlength: [100, "Role cannot exceed 100 characters"],
    },
    image: {
      type: String,
      required: [true, "Author image is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Testimonial = model<ITestimonial>("Testimonial", testimonialSchema);
