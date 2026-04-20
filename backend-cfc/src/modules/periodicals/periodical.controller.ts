import { Request, Response } from "express";
import { PeriodicalService } from "./periodical.service.js";
import { asyncHandler, AppError } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_FOLDERS } from "../../shared/utils/cloudinary.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const periodicalService = new PeriodicalService();
const adminService = new AdminService();

export class PeriodicalController {
  getAllPeriodicals = asyncHandler(async (req: Request, res: Response) => {
    const result = await periodicalService.getAllPeriodicals(req.query);
    sendSuccess(res, result, "Periodicals fetched successfully");
  });

  getPeriodicalById = asyncHandler(async (req: Request, res: Response) => {
    const periodical = await periodicalService.getPeriodicalById(req.params.id as string);
    sendSuccess(res, periodical, "Periodical fetched successfully");
  });

  getPeriodicalBySlug = asyncHandler(async (req: Request, res: Response) => {
    const periodical = await periodicalService.getPeriodicalBySlug(req.params.slug as string);
    sendSuccess(res, periodical, "Periodical fetched successfully");
  });

  createPeriodical = asyncHandler(async (req: Request, res: Response) => {
    const fileUrls: string[] = [];

    // Handle multiple file uploads
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, CLOUDINARY_FOLDERS.PERIODICALS);
        fileUrls.push(result.secure_url);
      }
    }

    const periodicalData = {
      ...req.body,
      files: fileUrls,
      tags:
        typeof req.body.tags === "string"
          ? req.body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : req.body.tags,
    };

    const periodical = await periodicalService.createPeriodical(periodicalData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "PERIODICAL",
        resourceId: periodical._id.toString(),
        details: `Created periodical: ${periodical.title}`,
      });
    }

    sendSuccess(res, periodical, "Periodical created successfully", 201);
  });

  updatePeriodical = asyncHandler(async (req: Request, res: Response) => {
    const updateData: any = {
      ...req.body,
      ...(req.body.tags && {
        tags:
          typeof req.body.tags === "string"
            ? req.body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : req.body.tags,
      }),
    };

    // Handle new file uploads — append to existing files
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const existingPeriodical = await periodicalService.getPeriodicalById(req.params.id as string);
      const newFileUrls: string[] = [];

      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, CLOUDINARY_FOLDERS.PERIODICALS);
        newFileUrls.push(result.secure_url);
      }

      // Merge existing files with new uploads
      updateData.files = [...(existingPeriodical.files || []), ...newFileUrls];
    }

    const periodical = await periodicalService.updatePeriodical(req.params.id as string, updateData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "PERIODICAL",
        resourceId: periodical._id.toString(),
        details: `Updated periodical: ${periodical.title}`,
      });
    }

    sendSuccess(res, periodical, "Periodical updated successfully");
  });

  deletePeriodical = asyncHandler(async (req: Request, res: Response) => {
    const periodical = await periodicalService.getPeriodicalById(req.params.id as string);

    // Clean up Cloudinary files
    if (periodical.files && periodical.files.length > 0) {
      for (const fileUrl of periodical.files) {
        const publicId = fileUrl.split("/").pop()?.split(".")[0];
        if (publicId) {
          await deleteFromCloudinary(`${CLOUDINARY_FOLDERS.PERIODICALS}/${publicId}`).catch((err) =>
            console.warn("Failed to delete file from Cloudinary:", err)
          );
        }
      }
    }

    await periodicalService.deletePeriodical(req.params.id as string);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "PERIODICAL",
        resourceId: req.params.id as string,
        details: `Deleted periodical: ${periodical.title}`,
      });
    }

    sendSuccess(res, null, "Periodical deleted successfully");
  });

  /**
   * Remove a specific file from a periodical's files array
   */
  removeFile = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { fileUrl } = req.body;

    if (!fileUrl) {
      throw new AppError("fileUrl is required", 400);
    }

    const periodical = await periodicalService.getPeriodicalById(id);
    const updatedFiles = periodical.files.filter((f) => f !== fileUrl);

    // Delete from Cloudinary
    const publicId = fileUrl.split("/").pop()?.split(".")[0];
    if (publicId) {
      await deleteFromCloudinary(`${CLOUDINARY_FOLDERS.PERIODICALS}/${publicId}`).catch((err) =>
        console.warn("Failed to delete file from Cloudinary:", err)
      );
    }

    const updated = await periodicalService.updatePeriodical(id, { files: updatedFiles });
    sendSuccess(res, updated, "File removed successfully");
  });
}
