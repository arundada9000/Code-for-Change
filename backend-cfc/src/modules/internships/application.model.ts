import mongoose, { Schema } from "mongoose";
import { IInternshipApplication } from "./application.interface.js";

const ApplicationSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    contactNumber: { type: String, required: true },
    skills: { type: String, required: true },
    resumeUrl: { type: String, required: true },
    fileType: { 
      type: String, 
      enum: ["pdf", "docx"], 
      required: true 
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    college: { type: String, trim: true },
    track: { type: String, required: true, trim: true },
    province: { type: String, trim: true },
    coverLetter: { type: String, trim: true },
    internshipId: { type: Schema.Types.ObjectId, ref: "Internship" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for searching
ApplicationSchema.index({ fullName: "text", email: "text", college: "text" });
ApplicationSchema.index({ track: 1, status: 1 });

export const InternshipApplication = mongoose.model<IInternshipApplication>(
  "InternshipApplication",
  ApplicationSchema
);
