import { Document, Types } from "mongoose";

export type ApplicationStatus = "Pending" | "Verified" | "Rejected";

export interface IInternshipApplication extends Document {
  fullName: string;
  email: string;
  contactNumber: string;
  skills: string;
  resumeUrl: string;
  fileType: "pdf" | "docx" | "doc";
  status: ApplicationStatus;
  college?: string;
  track: string;
  province?: string;
  coverLetter?: string;
  internshipId?: Types.ObjectId; // Optional: Link to a specific vacancy
  createdAt: Date;
  updatedAt: Date;
}
