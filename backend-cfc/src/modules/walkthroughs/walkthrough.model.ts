import { Schema, model } from "mongoose";
import { IWalkthrough } from "./walkthrough.interface.js";

const walkthroughSchema = new Schema<IWalkthrough>(
  {
    title: {
      type: String,
      required: [true, "Walkthrough title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    province: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      required: [true, "Walkthrough cover image is required"],
    },
    files: {
      type: [String],
      default: [],
    },
    readTime: {
      type: String,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-set publishedAt when isPublished changes to true and generate slug
walkthroughSchema.pre("save", async function () {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (!this.isModified("title") && !this.isNew) {
    return;
  }

  if (!this.slug) {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingDoc = await model<IWalkthrough>("Walkthrough").findOne({ slug });
    if (existingDoc) {
      slug = `${slug}-${Date.now()}`;
    }

    this.slug = slug;
  }
});

export const Walkthrough = model<IWalkthrough>("Walkthrough", walkthroughSchema);
