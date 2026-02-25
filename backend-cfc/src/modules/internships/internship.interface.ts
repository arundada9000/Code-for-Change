import { Document } from "mongoose";

export enum InternshipType {
  FULL_TIME = "Full-time",
  INTERNSHIP = "Internship",
  CONTRACT = "Contract",
  PART_TIME = "Part-time",
  REMOTE = "Remote",
}

export enum InternshipStatus {
  OPEN = "Open",
  CLOSED = "Closed",
  DRAFT = "Draft",
}

export interface IInternship extends Document {
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  province?: string;
  type: InternshipType;
  category: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  salaryRange?: string;
  applicationDeadline?: Date;
  applyLink: string;
  status: InternshipStatus;
  postedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
