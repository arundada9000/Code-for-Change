import { z } from "zod";

export const issueCertificateSchema = z.object({
  body: z.object({
    recipientName: z.string().trim().min(1, "Recipient name is required").max(100),
    recipientEmail: z.string().trim().email("Invalid recipient email"),
    courseName: z.string().trim().min(1, "Course name is required").max(200),
    certificateType: z.enum(["Training", "Bootcamp", "Hackathon", "Event", "Internship", "Workshop"]).optional(),
    certificateId: z.string().trim().optional(), // Allow custom serials
    issueDate: z.string().or(z.date()).nullable().optional(),
    startDate: z.string().or(z.date()).nullable().optional(),
    endDate: z.string().or(z.date()).nullable().optional(),
    expiryDate: z.string().or(z.date()).nullable().optional(),
    duration: z.string().trim().nullable().optional(),
    hours: z.string().trim().nullable().optional(),
    regdNo: z.string().trim().nullable().optional(),
    grade: z.string().trim().nullable().optional(),
    programId: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const updateCertificateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["Valid", "Revoked", "Expired"]),
  }),
  params: z.object({
    id: z.string().min(1, "Certificate ID is required"),
  }),
});

export const verifyCertificateSchema = z.object({
  params: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});
