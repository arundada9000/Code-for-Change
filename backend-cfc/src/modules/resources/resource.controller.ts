import { Request, Response } from "express";
import { ResourceService } from "./resource.service.js";
import { asyncHandler, AppError } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  CLOUDINARY_FOLDERS,
  extractPublicId,
} from "../../shared/utils/cloudinary.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const resourceService = new ResourceService();
const adminService = new AdminService();

export class ResourceController {
  // Public (role-filtered) list of resources
  getAllResources = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const role = authReq.user?.role ?? "guest";
    const resources = await resourceService.getAllResources(role, req.query as Record<string, any>);
    sendSuccess(res, resources, "Resources fetched successfully");
  });

  // Get single resource (re-verifies role)
  getResourceById = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const role = authReq.user?.role ?? "guest";
    const resource = await resourceService.getResourceById(req.params.id, role);
    sendSuccess(res, resource, "Resource fetched successfully");
  });

  // Increment download count
  trackDownload = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const role = authReq.user?.role ?? "guest";
    // verify access before tracking
    await resourceService.getResourceById(req.params.id, role);
    const resource = await resourceService.incrementDownloads(req.params.id);
    sendSuccess(res, resource, "Download tracked");
  });

  // Admin: Create resource (with optional file upload)
  createResource = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    let fileUrl: string | undefined = undefined;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.RESOURCES);
      fileUrl = result.secure_url;
    }

    const resourceData = {
      ...req.body,
      ...(fileUrl && { fileUrl }),
      uploadedBy: authReq.user?.name ?? authReq.user?.email ?? "Admin",
      isActive: true,
    };

    const resource = await resourceService.createResource(resourceData);

    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "RESOURCE",
        resourceId: resource._id.toString(),
        details: `Shared resource: ${resource.title} [${resource.visibility}]`,
      });
    }

    sendSuccess(res, resource, "Resource created successfully", 201);
  });

  // Admin: Update resource
  updateResource = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    let updateData = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.RESOURCES);
      updateData.fileUrl = result.secure_url;

      // Delete old file from Cloudinary if replacing
      const old = await resourceService.getResourceById(req.params.id, "admin");
      if (old.fileUrl && !old.fileUrl.startsWith("http://") && old.fileUrl.includes("cloudinary")) {
        const publicId = extractPublicId(old.fileUrl);
        await deleteFromCloudinary(publicId).catch(() => {});
      }
    }

    const resource = await resourceService.updateResource(req.params.id, updateData);

    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "RESOURCE",
        resourceId: resource._id.toString(),
        details: `Updated resource: ${resource.title}`,
      });
    }

    sendSuccess(res, resource, "Resource updated successfully");
  });

  // Admin: Delete resource
  deleteResource = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const resource = await resourceService.getResourceById(req.params.id, "admin");

    // Delete file from Cloudinary if stored there
    if (resource.fileUrl && resource.fileUrl.includes("cloudinary")) {
      const publicId = extractPublicId(resource.fileUrl);
      await deleteFromCloudinary(publicId).catch(() => {});
    }

    await resourceService.deleteResource(req.params.id);

    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "RESOURCE",
        resourceId: req.params.id,
        details: `Deleted resource: ${resource.title}`,
      });
    }

    sendSuccess(res, null, "Resource deleted successfully");
  });
}
