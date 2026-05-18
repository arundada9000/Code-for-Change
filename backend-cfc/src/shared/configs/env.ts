import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGO_URI: z.string().describe("MongoDB Connection URI"),
  REDIS_URL: z.string().optional().describe("Redis Connection URL"),
  ENABLE_REDIS: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(false),
  
  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default("1d"),
  
  // SMTP / Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().describe("Cloudinary Cloud Name"),
  CLOUDINARY_API_KEY: z.string().describe("Cloudinary API Key"),
  CLOUDINARY_API_SECRET: z.string().describe("Cloudinary API Secret"),
  
  // Frontend
  FRONTEND_URL: z.string().default("https://codeforchangenepal.com").optional(),
  
  // Security
  OTP_EXPIRY: z.coerce.number().default(300),

  // WebAuthn / Passkeys
  WEBAUTHN_RP_ID: z.string().optional(),   // e.g. "codeforchangenepal.com" — defaults to hostname from FRONTEND_URL
  WEBAUTHN_RP_NAME: z.string().default("Code for Change Nepal"),

  // Push Notifications
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),

  // Payment
  PAYMENT_GATEWAY_URL: z.string().optional(),
  ESEWA_PRODUCT_CODE: z.string().default("EPAYTEST"),
  ESEWA_SECRET_KEY: z.string().describe("eSewa Secret Key"),
  ESEWA_GATEWAY_URL: z.string().default("https://rc-epay.esewa.com.np/api/epay/main/v2/form"),
  ESEWA_VERIFICATION_URL: z.string().default("https://uat.esewa.com.np/api/epay/main/v2/verify"),
});

export const ENV = envSchema.parse(process.env);
