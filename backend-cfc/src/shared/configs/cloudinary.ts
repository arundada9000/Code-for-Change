import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

// Debug logging
console.log("🔧 Cloudinary Configuration:");
console.log("  CLOUD_NAME:", ENV.CLOUDINARY_CLOUD_NAME || "MISSING");
console.log("  API_KEY:", ENV.CLOUDINARY_API_KEY ? "***" + ENV.CLOUDINARY_API_KEY.slice(-4) : "MISSING");
console.log("  API_SECRET:", ENV.CLOUDINARY_API_SECRET ? "***" : "MISSING");

if (!ENV.CLOUDINARY_CLOUD_NAME || !ENV.CLOUDINARY_API_KEY || !ENV.CLOUDINARY_API_SECRET) {
  console.error("❌ ERROR: Cloudinary credentials are missing!");
  console.error("Please check your .env file has:");
  console.error("  - CLOUDINARY_CLOUD_NAME");
  console.error("  - CLOUDINARY_API_KEY");
  console.error("  - CLOUDINARY_API_SECRET");
}

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

export default cloudinary;
