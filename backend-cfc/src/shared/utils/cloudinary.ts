import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import { ENV } from "../configs/env.js";

// Configure Cloudinary directly here to avoid module loading issues
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary folder structure for organized asset management
 */
export const CLOUDINARY_FOLDERS = {
  EVENTS: 'cfc/events',
  PROFILES: 'cfc/profiles',
  BLOGS: 'cfc/blogs',
  TEAM: 'cfc/team',
  IMPACT: 'cfc/impact',
  RESOURCES: 'cfc/resources',
  CERTIFICATES: 'cfc/certificates',
  GALLERY: 'cfc/gallery',
  INTERNSHIPS: 'cfc/internships',
  TESTIMONIALS: 'cfc/testimonials',
  SUPPORTERS: 'cfc/supporters',
} as const;

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - File buffer from multer memory storage
 * @param folder - Cloudinary folder name
 * @returns Cloudinary upload response
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = "codeforchange"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    // Set a timeout for the upload
    const uploadTimeout = setTimeout(() => {
      reject(new Error("Cloudinary upload timed out after 120 seconds"));
    }, 120000); // 120 seconds

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        timeout: 120000,
      },
      (error, result) => {
        clearTimeout(uploadTimeout);
        if (error) {
          console.error("Cloudinary Upload Error Details:", error);
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          console.log("Cloudinary Upload Success:", result?.public_id);
          resolve(result as UploadApiResponse);
        }
      }
    );

    // enhance stream error handling
    uploadStream.on('error', (err) => {
      clearTimeout(uploadTimeout);
      console.error("Stream Error:", err);
      reject(new Error(`Stream upload failed: ${err.message}`));
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @returns Deletion result
 */
export const deleteFromCloudinary = async (
  publicId: string
): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error}`);
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID
 */
export const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  const folderAndFile = parts.slice(-2);
  return folderAndFile.join("/").split(".")[0];
};
