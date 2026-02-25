import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().email("Invalid email format").min(1, "Email is required"),
    contactNumber: z.string().trim().min(1, "Contact number is required"),
    skills: z.string().trim().min(1, "Skills are required"),
    track: z.string().trim().min(1, "Track is required"),
    college: z.string().trim().optional(),
    coverLetter: z.string().trim().optional(),
    internshipId: z.string().trim().optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.string().trim().min(1, "Status is required"),
  }),
});
