import { z } from "zod";

// Regex to catch common disposable/fake email domains
const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "tempmail.com",
  "throwaway.email",
  "guerrillamail.com",
  "yopmail.com",
  "sharklasers.com",
  "trashmail.com",
  "maildrop.cc",
  "10minutemail.com",
  "dispostable.com",
  "spam4.me",
  "fakeinbox.com",
  "getairmail.com",
  "mailnull.com",
  "spamgourmet.com",
];

const emailValidator = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("A valid email address is required")
  .max(254, "Email is too long")
  .transform((val) => val.toLowerCase())
  .refine(
    (email) => {
      const domain = email.split("@")[1];
      return !DISPOSABLE_DOMAINS.includes(domain);
    },
    { message: "Disposable email addresses are not allowed" }
  );

export const subscribeSchema = z.object({
  body: z.object({
    email: emailValidator,
  }),
});

export const updateSubscriberSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Subscriber ID is required"),
  }),
  body: z.object({
    status: z.enum(["active", "unsubscribed"]),
  }),
});
