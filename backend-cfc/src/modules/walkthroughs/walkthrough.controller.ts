import { Request, Response } from "express";
import { WalkthroughService } from "./walkthrough.service.js";
import { asyncHandler, AppError } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_FOLDERS } from "../../shared/utils/cloudinary.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const walkthroughService = new WalkthroughService();
const adminService = new AdminService();

export class WalkthroughController {
  getAllWalkthroughs = asyncHandler(async (req: Request, res: Response) => {
    const result = await walkthroughService.getAllWalkthroughs(req.query);
    sendSuccess(res, result, "Walkthroughs fetched successfully");
  });

  getWalkthroughById = asyncHandler(async (req: Request, res: Response) => {
    const walkthrough = await walkthroughService.getWalkthroughById(req.params.id as string);
    sendSuccess(res, walkthrough, "Walkthrough fetched successfully");
  });

  getWalkthroughBySlug = asyncHandler(async (req: Request, res: Response) => {
    const walkthrough = await walkthroughService.getWalkthroughBySlug(req.params.slug as string);
    sendSuccess(res, walkthrough, "Walkthrough fetched successfully");
  });

  createWalkthrough = asyncHandler(async (req: Request, res: Response) => {
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
    let imageUrl = "";
    const fileUrls: string[] = [];

    // Handle cover image upload
    if (uploadedFiles?.image?.[0]) {
      const result = await uploadToCloudinary(uploadedFiles.image[0].buffer, CLOUDINARY_FOLDERS.WALKTHROUGHS);
      imageUrl = result.secure_url;
    } else {
      throw new AppError("Walkthrough cover image is required", 400);
    }

    // Handle attachment files upload
    if (uploadedFiles?.files) {
      for (const file of uploadedFiles.files) {
        const result = await uploadToCloudinary(file.buffer, CLOUDINARY_FOLDERS.WALKTHROUGHS);
        fileUrls.push(result.secure_url);
      }
    }

    // Calculate read time from content
    const wordCount = req.body.content ? req.body.content.replace(/<[^>]*>/g, "").split(/\s+/).length : 0;
    const readTimeCalc = `${Math.ceil(wordCount / 200)} min`;

    const walkthroughData = {
      ...req.body,
      image: imageUrl,
      files: fileUrls,
      readTime: readTimeCalc,
      tags:
        typeof req.body.tags === "string"
          ? req.body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : req.body.tags,
    };

    const walkthrough = await walkthroughService.createWalkthrough(walkthroughData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "WALKTHROUGH",
        resourceId: walkthrough._id.toString(),
        details: `Created walkthrough: ${walkthrough.title}`,
      });
    }

    sendSuccess(res, walkthrough, "Walkthrough created successfully", 201);
  });

  updateWalkthrough = asyncHandler(async (req: Request, res: Response) => {
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };

    const updateData: any = {
      ...req.body,
      ...(req.body.tags && {
        tags:
          typeof req.body.tags === "string"
            ? req.body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : req.body.tags,
      }),
    };

    // Recalculate read time if content is updated
    if (req.body.content) {
      const wordCount = req.body.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      updateData.readTime = `${Math.ceil(wordCount / 200)} min`;
    }

    // Handle new cover image
    if (uploadedFiles?.image?.[0]) {
      const result = await uploadToCloudinary(uploadedFiles.image[0].buffer, CLOUDINARY_FOLDERS.WALKTHROUGHS);
      updateData.image = result.secure_url;

      // Delete old image from Cloudinary
      const oldWalkthrough = await walkthroughService.getWalkthroughById(req.params.id as string);
      if (oldWalkthrough.image) {
        const publicId = oldWalkthrough.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          await deleteFromCloudinary(`${CLOUDINARY_FOLDERS.WALKTHROUGHS}/${publicId}`).catch((err) =>
            console.warn("Failed to delete old image:", err)
          );
        }
      }
    }

    // Handle new attachment files — append to existing
    if (uploadedFiles?.files && uploadedFiles.files.length > 0) {
      const existingWalkthrough = await walkthroughService.getWalkthroughById(req.params.id as string);
      const newFileUrls: string[] = [];

      for (const file of uploadedFiles.files) {
        const result = await uploadToCloudinary(file.buffer, CLOUDINARY_FOLDERS.WALKTHROUGHS);
        newFileUrls.push(result.secure_url);
      }

      updateData.files = [...(existingWalkthrough.files || []), ...newFileUrls];
    }

    const walkthrough = await walkthroughService.updateWalkthrough(req.params.id as string, updateData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "WALKTHROUGH",
        resourceId: walkthrough._id.toString(),
        details: `Updated walkthrough: ${walkthrough.title}`,
      });
    }

    sendSuccess(res, walkthrough, "Walkthrough updated successfully");
  });

  deleteWalkthrough = asyncHandler(async (req: Request, res: Response) => {
    const walkthrough = await walkthroughService.getWalkthroughById(req.params.id as string);

    // Clean up Cloudinary assets
    if (walkthrough.image) {
      const publicId = walkthrough.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        await deleteFromCloudinary(`${CLOUDINARY_FOLDERS.WALKTHROUGHS}/${publicId}`).catch((err) =>
          console.warn("Failed to delete image:", err)
        );
      }
    }

    if (walkthrough.files && walkthrough.files.length > 0) {
      for (const fileUrl of walkthrough.files) {
        const publicId = fileUrl.split("/").pop()?.split(".")[0];
        if (publicId) {
          await deleteFromCloudinary(`${CLOUDINARY_FOLDERS.WALKTHROUGHS}/${publicId}`).catch((err) =>
            console.warn("Failed to delete file:", err)
          );
        }
      }
    }

    await walkthroughService.deleteWalkthrough(req.params.id as string);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "WALKTHROUGH",
        resourceId: req.params.id as string,
        details: `Deleted walkthrough: ${walkthrough.title}`,
      });
    }

    sendSuccess(res, null, "Walkthrough deleted successfully");
  });

  /**
   * Remove a specific file from a walkthrough's files array
   */
  removeFile = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { fileUrl } = req.body;

    if (!fileUrl) {
      throw new AppError("fileUrl is required", 400);
    }

    const walkthrough = await walkthroughService.getWalkthroughById(id);
    const updatedFiles = walkthrough.files.filter((f) => f !== fileUrl);

    // Delete from Cloudinary
    const publicId = fileUrl.split("/").pop()?.split(".")[0];
    if (publicId) {
      await deleteFromCloudinary(`${CLOUDINARY_FOLDERS.WALKTHROUGHS}/${publicId}`).catch((err) =>
        console.warn("Failed to delete file from Cloudinary:", err)
      );
    }

    const updated = await walkthroughService.updateWalkthrough(id, { files: updatedFiles });
    sendSuccess(res, updated, "File removed successfully");
  });
}
