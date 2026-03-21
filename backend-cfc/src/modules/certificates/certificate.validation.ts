import { z } from "zod";

// ── Single Certificate ──────────────────────────────────────────────
export const issueCertificateSchema = z.object({
  body: z.object({
    recipientName: z.string().trim().min(1, "Recipient name is required").max(100),
    recipientEmail: z.string().trim().email("Invalid recipient email").optional().or(z.literal("")),
    courseName: z.string().trim().min(1, "Course name is required").max(200),
    certificateType: z.enum(["Training", "Bootcamp", "Hackathon", "Event", "Internship", "Workshop"]).optional(),
    certificateId: z.string().trim().optional(),
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

// ── Bulk Certificate ────────────────────────────────────────────────
const recipientSchema = z.object({
  recipientName: z.string().trim().min(1, "Recipient name is required").max(100),
  recipientEmail: z.string().trim().email().optional().or(z.literal("")),
  // Per-recipient optional text prefixes (used to build the certificate ID)
  prefix1: z.string().trim().max(4).optional(),  // e.g. "E", "C", "M"
  prefix2: z.string().trim().max(4).optional(),  // e.g. "LE", "NE", "TC"
});

export const bulkIssueCertificateSchema = z.object({
  body: z.object({
    sharedData: z.object({
      courseName: z.string().trim().min(1, "Course name is required").max(200),
      certificateType: z.enum(["Training", "Bootcamp", "Hackathon", "Event", "Internship", "Workshop"]).optional(),
      province: z.string().trim().min(1, "Province is required"),
      startDate: z.string().or(z.date()).nullable().optional(),
      endDate: z.string().or(z.date()).nullable().optional(),
      hours: z.string().trim().nullable().optional(),
      grade: z.string().trim().nullable().optional(),
      issueDate: z.string().or(z.date()).nullable().optional(),
      // Dynamic template text saved into metadata — allows custom certificate wording
      metadata: z.record(z.string(), z.any()).optional(),
    }),
    recipients: z.array(recipientSchema).min(1).max(500),
  }),
});

// ── Status / Verify / Delete ────────────────────────────────────────
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
