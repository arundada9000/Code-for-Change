import { Document } from "mongoose";

export interface IResource extends Document {
  title: string;
  description: string;
  semester: string;
  subject: string;
  type: "notes" | "assignment" | "lab" | "project" | "other";
  fileUrl?: string;
  file?: string;
  uploadedBy?: string;
  isApproved?: boolean;
  downloads?: number;
}