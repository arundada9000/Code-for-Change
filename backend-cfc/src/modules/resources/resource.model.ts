import { Schema, model } from "mongoose";
import { IResource } from "./resource.interface.js";

const resourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      enum: ['academic', 'branding', 'background', 'internal', 'other'],
      required: [true, "Category is required"],
      default: 'other',
    },
    visibility: {
      type: String,
      // Level 0: public | Level 1: gm | Level 2: cr | Level 3: eb | Level 4: admin
      enum: ['public', 'gm', 'cr', 'eb', 'admin'],
      required: [true, "Visibility level is required"],
      default: 'public',
    },
    type: {
      type: String,
      enum: ['file', 'image', 'link', 'color-code', 'notes', 'assignment', 'lab', 'project'],
      required: [true, "Resource type is required"],
      default: 'file',
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    colorHex: {
      type: String,
      trim: true,
    },
    externalLink: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: String,
      default: "Admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Resource = model<IResource>("Resource", resourceSchema);
