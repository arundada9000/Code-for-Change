import { Request, Response } from "express";
import { InternshipService } from "./internship.service.js";
import { asyncHandler } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_FOLDERS, extractPublicId } from "../../shared/utils/cloudinary.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const adminService = new AdminService();
const internshipService = new InternshipService();

export class InternshipController {
  /**
   * Get all internships
   */
  getAllInternships = asyncHandler(async (req: Request, res: Response) => {
    const internships = await internshipService.getAllInternships(req.query);
    sendSuccess(res, internships, "Internships fetched successfully");
  });

  /**
   * Get internship by ID
   */
  getInternshipById = asyncHandler(async (req: Request, res: Response) => {
    const internship = await internshipService.getInternshipById(req.params.id);
    sendSuccess(res, internship, "Internship fetched successfully");
  });

  /**
   * Create internship with logo upload
   */
  createInternship = asyncHandler(async (req: Request, res: Response) => {
    let logoUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.INTERNSHIPS);
      logoUrl = result.secure_url;
    }

    if (logoUrl) {
      req.body.companyLogo = logoUrl;
    }

    const internship = await internshipService.createInternship(req.body);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "INTERNSHIP",
        resourceId: internship._id.toString(),
        details: `Created internship: ${internship.title} at ${internship.companyName}`,
      });
    }

    sendSuccess(res, internship, "Internship created successfully", 201);
  });

  /**
   * Update internship
   */
  updateInternship = asyncHandler(async (req: Request, res: Response) => {
    let updateData = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.INTERNSHIPS);
      updateData.companyLogo = result.secure_url;

      // Delete old logo if exists
      const oldInternship = await internshipService.getInternshipById(req.params.id);
      if (oldInternship.companyLogo) {
        const publicId = extractPublicId(oldInternship.companyLogo);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    }

    const internship = await internshipService.updateInternship(req.params.id, updateData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "INTERNSHIP",
        resourceId: internship._id.toString(),
        details: `Updated internship: ${internship.title} at ${internship.companyName}`,
      });
    }

    sendSuccess(res, internship, "Internship updated successfully");
  });

  /**
   * Delete internship
   */
  deleteInternship = asyncHandler(async (req: Request, res: Response) => {
    const internship = await internshipService.getInternshipById(req.params.id);
    
    if (internship.companyLogo) {
      const publicId = extractPublicId(internship.companyLogo);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    await internshipService.deleteInternship(req.params.id);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "INTERNSHIP",
        resourceId: req.params.id,
        details: `Deleted internship: ${internship.title} at ${internship.companyName}`,
      });
    }

    sendSuccess(res, null, "Internship deleted successfully");
  });
}
