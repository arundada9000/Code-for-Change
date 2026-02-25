import { Document, Types } from "mongoose";

export enum CertificateStatus {
  Valid = "Valid",
  Revoked = "Revoked",
  Expired = "Expired",
}

export enum CertificateType {
  Training = "Training",
  Bootcamp = "Bootcamp",
  Hackathon = "Hackathon",
  Event = "Event",
  Internship = "Internship",
  Workshop = "Workshop",
}

export interface ICertificate extends Document {
  recipientName: string;
  recipientEmail: string;
  courseName: string;
  province?: string;
  certificateType: CertificateType;
  certificateId: string; // e.g. CFC-2026-001 or B57981000
  tokenHash: string; // UUID for verification URL
  qrCode?: string;   // Base64 QR code data
  issueDate: Date;
  startDate?: Date; // For training range
  endDate?: Date;   // For training range
  expiryDate?: Date;
  duration?: string; // e.g. 3 Months
  hours?: string;    // e.g. 135 Hours
  regdNo?: string;   // e.g. 64498-066-067
  grade?: string;    // e.g. Grade A
  status: CertificateStatus;
  programId?: Types.ObjectId; // Link to Event or Internship
  issuedBy: Types.ObjectId; // Admin/User who issued it
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
