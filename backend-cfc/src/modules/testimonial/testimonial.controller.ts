import { Request, Response } from "express";
import { TestimonialService } from "./testimonial.service.js";
import { asyncHandler, AppError } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_FOLDERS } from "../../shared/utils/cloudinary.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const testimonialService = new TestimonialService();
const adminService = new AdminService();

export class TestimonialController {
  // Public: Get only active testimonials
  getActiveTestimonials = asyncHandler(async (req: Request, res: Response) => {
    const testimonials = await testimonialService.getActiveTestimonials();
    sendSuccess(res, testimonials, "Testimonials fetched successfully");
  });

  // Admin: Get all testimonials (including inactive)
  getAllTestimonials = asyncHandler(async (req: Request, res: Response) => {
    const testimonials = await testimonialService.getAllTestimonials();
    sendSuccess(res, testimonials, "All testimonials fetched successfully");
  });

  getTestimonialById = asyncHandler(async (req: Request, res: Response) => {
    const testimonial = await testimonialService.getTestimonialById((req.params.id as string));
    sendSuccess(res, testimonial, "Testimonial fetched successfully");
  });

  createTestimonial = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("Author image is required", 400);
    }

    const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.TESTIMONIALS);
    const imageUrl = result.secure_url;

    const testimonial = await testimonialService.createTestimonial({
      ...req.body,
      image: imageUrl,
      isActive: req.body.isActive === "false" ? false : true,
      order: req.body.order ? Number(req.body.order) : 0,
    });

    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "TESTIMONIAL",
        resourceId: testimonial._id.toString(),
        details: `Created testimonial by: ${testimonial.author}`,
      });
    }

    sendSuccess(res, testimonial, "Testimonial created successfully", 201);
  });

  updateTestimonial = asyncHandler(async (req: Request, res: Response) => {
    let updateData: any = {
      ...req.body,
      ...(req.body.isActive !== undefined && {
        isActive: req.body.isActive === "false" || req.body.isActive === false ? false : true,
      }),
      ...(req.body.order !== undefined && { order: Number(req.body.order) }),
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.TESTIMONIALS);
      updateData.image = result.secure_url;

      // Delete old image from Cloudinary
      const old = await testimonialService.getTestimonialById((req.params.id as string));
      if (old.image) {
        const publicId = old.image.split("/").pop()?.split(".")[0];
        if (publicId) await deleteFromCloudinary(`testimonials/${publicId}`);
      }
    }

    const testimonial = await testimonialService.updateTestimonial((req.params.id as string), updateData);

    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "TESTIMONIAL",
        resourceId: testimonial._id.toString(),
        details: `Updated testimonial by: ${testimonial.author}`,
      });
    }

    sendSuccess(res, testimonial, "Testimonial updated successfully");
  });

  deleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
    const testimonial = await testimonialService.getTestimonialById((req.params.id as string));

    if (testimonial.image) {
      const publicId = testimonial.image.split("/").pop()?.split(".")[0];
      if (publicId) await deleteFromCloudinary(`testimonials/${publicId}`);
    }

    await testimonialService.deleteTestimonial((req.params.id as string));

    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "TESTIMONIAL",
        resourceId: (req.params.id as string),
        details: `Deleted testimonial by: ${testimonial.author}`,
      });
    }

    sendSuccess(res, null, "Testimonial deleted successfully");
  });
}
