import { Schema, model } from "mongoose";
import { IPeriodical } from "./periodical.interface.js";

const periodicalSchema = new Schema<IPeriodical>(
  {
    title: {
      type: String,
      required: [true, "Periodical title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
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
    files: {
      type: [String],
      default: [],
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
periodicalSchema.pre("save", async function () {
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

    const existingDoc = await model<IPeriodical>("Periodical").findOne({ slug });
    if (existingDoc) {
      slug = `${slug}-${Date.now()}`;
    }

    this.slug = slug;
  }
});

export const Periodical = model<IPeriodical>("Periodical", periodicalSchema);
