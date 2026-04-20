import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { ENV } from "./shared/configs/env.js";
import "./shared/configs/cloudinary.js"; // Initialize Cloudinary config early
import { errorHandler } from "./shared/utils/errorHandler.js";

// Import routes
import eventRoutes from "./modules/events/event.route.js";
import blogRoutes from "./modules/blogs/blog.route.js";
import impactRoutes from "./modules/impact/impact.route.js";
import contactRoutes from "./modules/contact/contact.route.js";
import adminRoutes from "./modules/admin/admin.route.js";
import donationRoutes from "./modules/donations/donation.route.js";
import internshipRoutes from "./modules/internships/internship.route.js";
import applicationRoutes from "./modules/internships/application.route.js";
import { authRoutes } from "./modules/auth/auth.route.js";
import { userRoutes } from "./modules/user/user.route.js";
import certificateRoutes from "./modules/certificates/certificate.route.js";
import galleryRoutes from "./modules/gallery/gallery.route.js";
import resourceRoutes from "./modules/resources/resource.route.js";
import seoRoutes from "./modules/seo/seo.route.js";
import testimonialRoutes from "./modules/testimonial/testimonial.route.js";
import supporterRoutes from "./modules/supporter/supporter.route.js";
import newsletterRoutes from "./modules/newsletter/newsletter.route.js";
import teamRoutes from "./modules/team/team.route.js";
import periodicalRoutes from "./modules/periodicals/periodical.route.js";
import walkthroughRoutes from "./modules/walkthroughs/walkthrough.route.js";

const app: Application = express();

// Trust the first proxy (Render, Nginx, etc.) so that req.ip contains
// the real client IP, which is critical for accurate rate limiting.
app.set("trust proxy", 1);

// Custom NoSQL Injection Protection + XSS sanitizer for Express 5
const customSanitize = (req: any, res: any, next: any) => {
  // Strip MongoDB operator keys ($where, $gt, etc.) recursively
  const stripOperators = (obj: any): void => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const key of Object.keys(obj)) {
        if (/^\$/.test(key)) {
          delete obj[key];
        } else {
          stripOperators(obj[key]);
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(stripOperators);
    }
  };

  // Strip HTML tags from string values to prevent XSS persistence
  const stripHtml = (obj: any): any => {
    if (typeof obj === "string") {
      return obj
        .replace(/<script[\s\S]*?<\/script>/gi, "") // remove script blocks
        .replace(/<[^>]+>/g, "") // remove all HTML tags
        .replace(/javascript:/gi, "") // remove js: protocol
        .replace(/on\w+\s*=/gi, ""); // remove event handlers
    }
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      const clean: any = {};
      for (const key of Object.keys(obj)) {
        clean[key] = stripHtml(obj[key]);
      }
      return clean;
    }
    if (Array.isArray(obj)) {
      return obj.map(stripHtml);
    }
    return obj;
  };

  if (req.body) {
    stripOperators(req.body);
    req.body = stripHtml(req.body);
  }
  if (req.params) stripOperators(req.params);
  if (req.query) {
    try {
      stripOperators(req.query);
    } catch (e) {
      console.error("Sanitization error on query:", e);
    }
  }
  next();
};

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [
      ENV.FRONTEND_URL,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "https://code-for-change-nepal.onrender.com",
      "https://codeforchangenepal.vercel.app",
      "https://codeforchange.sajilodigital.com.np",
    ].filter(Boolean) as string[],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(customSanitize);
app.use(cookieParser());
app.use(hpp());
app.use(compression());

// Logging
if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate Limiting
// Global limiter — broad protection across all API endpoints
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Auth limiter — strict: 5 login attempts per 15 minutes (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message:
    "Too many login attempts. Please wait 15 minutes before trying again.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);

// Registration limiter — 3 registrations per hour per IP
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message:
    "Too many registration attempts from this IP. Please try again in an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/register", registrationLimiter);

// Password reset / OTP limiter — 5 requests per hour per IP
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many password reset requests. Please try again in an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/forget-password", passwordResetLimiter);
app.use("/api/auth/resend-otp", passwordResetLimiter);

// SEO Routes (Sitemap and Robots.txt)
app.use("/", seoRoutes);

// Base Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Code for Change Nepal Backend API",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api", eventRoutes);
app.use("/api", blogRoutes);
app.use("/api", impactRoutes);
app.use("/api", contactRoutes);
app.use("/api", adminRoutes);
app.use("/api", donationRoutes);
app.use("/api/internships", applicationRoutes);
app.use("/api", internshipRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api", galleryRoutes);
app.use("/api", resourceRoutes);
app.use("/api", testimonialRoutes);
app.use("/api", supporterRoutes);
app.use("/api", newsletterRoutes);
app.use("/api/team", teamRoutes);
app.use("/api", periodicalRoutes);
app.use("/api", walkthroughRoutes);

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;
