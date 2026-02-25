import { Schema, model } from "mongoose";
import { IInternship, InternshipType, InternshipStatus } from "./internship.interface.js";

const internshipSchema = new Schema<IInternship>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      index: true,
    },
    companyLogo: {
      type: String,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    province: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(InternshipType),
      default: InternshipType.INTERNSHIP,
      required: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    salaryRange: {
      type: String,
      trim: true,
    },
    applicationDeadline: {
      type: Date,
    },
    applyLink: {
      type: String,
      required: [true, "Apply link is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(InternshipStatus),
      default: InternshipStatus.DRAFT,
    },
    postedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Internship = model<IInternship>("Internship", internshipSchema);
