import { z } from "zod";

export const createContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(10, "Message must be at least 10 characters"),
  }),
});

export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
