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

const app: Application = express();

// Trust the first proxy (Render, Nginx, etc.) so that req.ip contains
// the real client IP, which is critical for accurate rate limiting.
app.set("trust proxy", 1);

// Custom NoSQL Injection Protection for Express 5 (handles query getter)
const customSanitize = (req: any, res: any, next: any) => {
  const sanitize = (obj: any) => {
    if (obj instanceof Object) {
      for (const key in obj) {
        if (/^\$/.test(key)) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.query) {
    // In Express 5, req.query is a getter.
    // We sanitize the object returned by the getter if it's mutable,
    // or we skip if it's already safe.
    try {
      sanitize(req.query);
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
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts, please try again after 15 minutes",
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);

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

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;
