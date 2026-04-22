import { Request, Response } from "express";
import { ApplicationService } from "./application.service.js";
import { asyncHandler } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_FOLDERS, extractPublicId } from "../../shared/utils/cloudinary.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const adminService = new AdminService();
const applicationService = new ApplicationService();

export class ApplicationController {
  /**
   * Public: Submit internship application
   */
  submitApplication = asyncHandler(async (req: Request, res: Response) => {
    let resumeUrl = "";
    let fileType: "pdf" | "docx" | "doc" = "pdf";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.INTERNSHIPS); // Using same folder for now or can create APPLICANTS
      resumeUrl = result.secure_url;
      
      const mimetype = req.file.mimetype;
      if (mimetype === "application/pdf") {
        fileType = "pdf";
      } else if (mimetype === "application/msword") {
        fileType = "doc";
      } else if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        fileType = "docx";
      }
    }

    const applicationData = {
      ...req.body,
      resumeUrl,
      fileType,
    };

    const application = await applicationService.submitApplication(applicationData);
    sendSuccess(res, application, "Application submitted successfully", 201);
  });

  /**
   * Admin: Get all applications
   */
  getAllApplications = asyncHandler(async (req: Request, res: Response) => {
    const applications = await applicationService.getAllApplications(req.query);
    sendSuccess(res, applications, "Applications fetched successfully");
  });

  /**
   * Admin: Update application status
   */
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const application = await applicationService.updateStatus((req.params.id as string), status);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "INTERNSHIP_APPLICATION",
        resourceId: application._id.toString(),
        details: `Updated application status for ${application.fullName} to ${status}`,
      });
    }

    sendSuccess(res, application, `Application ${status.toLowerCase()} successfully`);
  });

  /**
   * Admin: Delete application
   */
  deleteApplication = asyncHandler(async (req: Request, res: Response) => {
    const application = await applicationService.getApplicationById((req.params.id as string));
    
    // Delete resume from cloudinary
    if (application.resumeUrl) {
      const publicId = extractPublicId(application.resumeUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    await applicationService.deleteApplication((req.params.id as string));

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "INTERNSHIP_APPLICATION",
        resourceId: (req.params.id as string),
        details: `Deleted application of ${application.fullName}`,
      });
    }

    sendSuccess(res, null, "Application deleted successfully");
  });
}
