import { z } from "zod";

// Comprehensive list of common disposable/temporary email providers
const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "temp-mail.org",
  "yopmail.com",
  "throwawaymail.com",
  "getnada.com",
  "fakemail.net",
  "tempmail.com",
  "tempmail.ninja",
  "dispostable.com",
  "trashmail.com",
  "maildrop.cc",
  "sharklasers.com",
  "mohmal.com",
];

export const createContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z
      .string()
      .email("Valid email is required")
      .max(254)
      .refine((email) => {
        const domain = email.split("@")[1].toLowerCase();
        return !DISPOSABLE_DOMAINS.includes(domain);
      }, "Disposable email addresses are not allowed"),
    subject: z.string().min(1, "Subject is required").max(200),
    message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  }),
});

export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
