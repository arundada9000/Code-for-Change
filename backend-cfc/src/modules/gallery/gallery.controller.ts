import { Request, Response } from "express";
import { GalleryService } from "./gallery.service.js";
import { asyncHandler, AppError } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_FOLDERS, extractPublicId } from "../../shared/utils/cloudinary.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const galleryService = new GalleryService();
const adminService = new AdminService();

export class GalleryController {
  getAllGalleryItems = asyncHandler(async (req: Request, res: Response) => {
    const items = await galleryService.getAllGalleryItems(req.query);
    sendSuccess(res, items, "Gallery items fetched successfully");
  });

  getGalleryItemById = asyncHandler(async (req: Request, res: Response) => {
    const item = await galleryService.getGalleryItemById(req.params.id);
    sendSuccess(res, item, "Gallery item fetched successfully");
  });

  createGalleryItem = asyncHandler(async (req: Request, res: Response) => {
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.GALLERY);
      imageUrl = result.secure_url;
    } else {
      throw new AppError("Gallery image is required", 400);
    }

    const itemData = {
      ...req.body,
      imageUrl,
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true
    };

    const item = await galleryService.createGalleryItem(itemData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "GALLERY",
        resourceId: item._id.toString(),
        details: `Added gallery image: ${item.title}`,
      });
    }

    sendSuccess(res, item, "Gallery item created successfully", 201);
  });

  updateGalleryItem = asyncHandler(async (req: Request, res: Response) => {
    let updateData = { 
      ...req.body,
      ...(req.body.isFeatured !== undefined && {
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true
      })
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.GALLERY);
      updateData.imageUrl = result.secure_url;

      const oldItem = await galleryService.getGalleryItemById(req.params.id);
      if (oldItem.imageUrl) {
        const publicId = extractPublicId(oldItem.imageUrl);
        await deleteFromCloudinary(publicId);
      }
    }

    const item = await galleryService.updateGalleryItem(req.params.id, updateData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "GALLERY",
        resourceId: item._id.toString(),
        details: `Updated gallery image: ${item.title}`,
      });
    }

    sendSuccess(res, item, "Gallery item updated successfully");
  });

  deleteGalleryItem = asyncHandler(async (req: Request, res: Response) => {
    const item = await galleryService.getGalleryItemById(req.params.id);
    
    if (item.imageUrl) {
      const publicId = extractPublicId(item.imageUrl);
      await deleteFromCloudinary(publicId);
    }

    await galleryService.deleteGalleryItem(req.params.id);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "GALLERY",
        resourceId: req.params.id,
        details: `Deleted gallery image: ${item.title}`,
      });
    }

    sendSuccess(res, null, "Gallery item deleted successfully");
  });
}
