import { Schema, model } from "mongoose";
import { IBlog } from "./blog.interface.js";

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    excerpt: {
      type: String,
      required: [true, "Blog excerpt is required"],
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    province: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Blog image is required"],
    },
    tags: {
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
    metaTitle: {
      type: String,
      maxlength: [100, "Meta title cannot exceed 100 characters"],
    },
    metaDescription: {
      type: String,
      maxlength: [200, "Meta description cannot exceed 200 characters"],
    },
    metaKeywords: {
      type: String,
    },
    highlights: {
      type: [String],
      default: [],
    },
    authorDetails: {
        name: { type: String, required: true },
        role: { type: String, required: true },
        image: { type: String },
        linkedin: { type: String },
        facebook: { type: String },
        tiktok: { type: String },
        instagram: { type: String },
        youtube: { type: String },
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

// Auto-set publishedAt when isPublished changes to true and generate slug
blogSchema.pre("save", async function () {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (!this.isModified("title") && !this.isNew) {
    return;
  }

  if (!this.slug) {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // Check for uniqueness
    const existingBlog = await model<IBlog>("Blog").findOne({ slug });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`; // Append timestamp for uniqueness
    }
    
    this.slug = slug;
  }
});

export const Blog = model<IBlog>("Blog", blogSchema);
