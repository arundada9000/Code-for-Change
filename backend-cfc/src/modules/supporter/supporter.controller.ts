import { Request, Response } from "express";
import { SupporterService } from "./supporter.service.js";
import { asyncHandler, AppError } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_FOLDERS } from "../../shared/utils/cloudinary.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const supporterService = new SupporterService();
const adminService = new AdminService();

export class SupporterController {
  // Public: Get only active supporters
  getActiveSupporters = asyncHandler(async (req: Request, res: Response) => {
    const supporters = await supporterService.getActiveSupporters();
    sendSuccess(res, supporters, "Supporters fetched successfully");
  });

  // Admin: Get all supporters (including inactive)
  getAllSupporters = asyncHandler(async (req: Request, res: Response) => {
    const supporters = await supporterService.getAllSupporters();
    sendSuccess(res, supporters, "All supporters fetched successfully");
  });

  getSupporterById = asyncHandler(async (req: Request, res: Response) => {
    const supporter = await supporterService.getSupporterById((req.params.id as string));
    sendSuccess(res, supporter, "Supporter fetched successfully");
  });

  createSupporter = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("Supporter logo is required", 400);
    }

    const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.SUPPORTERS);
    const logoUrl = result.secure_url;

    const supporter = await supporterService.createSupporter({
      ...req.body,
      logo: logoUrl,
      isActive: req.body.isActive === "false" ? false : true,
      order: req.body.order ? Number(req.body.order) : 0,
    });

    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "SUPPORTER",
        resourceId: supporter._id.toString(),
        details: `Created supporter: ${supporter.name}`,
      });
    }

    sendSuccess(res, supporter, "Supporter created successfully", 201);
  });

  updateSupporter = asyncHandler(async (req: Request, res: Response) => {
    let updateData: any = {
      ...req.body,
      ...(req.body.isActive !== undefined && {
        isActive: req.body.isActive === "false" || req.body.isActive === false ? false : true,
      }),
      ...(req.body.order !== undefined && { order: Number(req.body.order) }),
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.SUPPORTERS);
      updateData.logo = result.secure_url;

      // Delete old logo from Cloudinary
      const old = await supporterService.getSupporterById((req.params.id as string));
      if (old.logo) {
        const publicId = old.logo.split("/").pop()?.split(".")[0];
        if (publicId) await deleteFromCloudinary(`supporters/${publicId}`);
      }
    }

    const supporter = await supporterService.updateSupporter((req.params.id as string), updateData);

    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "SUPPORTER",
        resourceId: supporter._id.toString(),
        details: `Updated supporter: ${supporter.name}`,
      });
    }

    sendSuccess(res, supporter, "Supporter updated successfully");
  });

  deleteSupporter = asyncHandler(async (req: Request, res: Response) => {
    const supporter = await supporterService.getSupporterById((req.params.id as string));

    if (supporter.logo) {
      const publicId = supporter.logo.split("/").pop()?.split(".")[0];
      if (publicId) await deleteFromCloudinary(`supporters/${publicId}`);
    }

    await supporterService.deleteSupporter((req.params.id as string));

    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "SUPPORTER",
        resourceId: (req.params.id as string),
        details: `Deleted supporter: ${supporter.name}`,
      });
    }

    sendSuccess(res, null, "Supporter deleted successfully");
  });
}
