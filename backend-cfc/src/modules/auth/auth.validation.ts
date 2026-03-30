import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .nonempty("Email cannot be empty")
    .email({ message: "Please enter a valid email address" })
    .max(255, "Email is too long"),

  password: z
    .string("Password is required")
    .nonempty("Password cannot be empty")
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password is too long"),
});

// OTP verification schema
export const otpSchema = z.object({
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .email("Invalid email format"),

  otp: z
    .string("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
    
  newPassword: z
    .string("New password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
    ),
});

// Register schema — explicit allowlist of fields
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  phone: z.string().optional(),
  province: z.string().optional(),
  collegeName: z.string().optional(),
  faculty: z.string().optional(),
  semester: z.string().optional(),
  code: z.string().optional(),
  ebBody: z.string().optional(),
  role: z.string().optional(),
  tenure: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional(),
  linkedin: z.string().url("LinkedIn must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("GitHub must be a valid URL").optional().or(z.literal("")),
  facebook: z.string().url("Facebook must be a valid URL").optional().or(z.literal("")),
  website: z.string().url("Website must be a valid URL").optional().or(z.literal("")),
});

// Profile update schema
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100, "Name is too long").optional(),
  phone: z.string().max(20, "Phone is too long").optional(),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional(),
  address: z.string().max(300, "Address is too long").optional(),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  dateOfBirth: z.string().optional(),
  // Social links — optional, must be valid URL or empty string (to allow clearing)
  website: z.string().url("Website must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("LinkedIn must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("GitHub must be a valid URL").optional().or(z.literal("")),
  facebook: z.string().url("Facebook must be a valid URL").optional().or(z.literal("")),
  twitter: z.string().url("Twitter must be a valid URL").optional().or(z.literal("")),
  instagram: z.string().url("Instagram must be a valid URL").optional().or(z.literal("")),
  tiktok: z.string().url("TikTok must be a valid URL").optional().or(z.literal("")),
  youtube: z.string().url("YouTube must be a valid URL").optional().or(z.literal("")),
  // Education fields
  collegeName: z.string().max(200).optional(),
  university: z.string().max(200).optional(),
  faculty: z.string().max(200).optional(),
  semester: z.string().max(50).optional(),
  graduationYear: z.string().max(4).optional(),
});
