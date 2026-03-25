import { Schema, model } from "mongoose";
import { ISupporter } from "./supporter.interface.js";

const supporterSchema = new Schema<ISupporter>(
  {
    name: {
      type: String,
      required: [true, "Supporter name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    logo: {
      type: String,
      required: [true, "Supporter logo is required"],
    },
    url: {
      type: String,
      trim: true,
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

export const Supporter = model<ISupporter>("Supporter", supporterSchema);
