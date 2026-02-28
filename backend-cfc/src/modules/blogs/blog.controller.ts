import { Request, Response } from "express";
import { BlogService } from "./blog.service.js";
import { asyncHandler, AppError } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_FOLDERS } from "../../shared/utils/cloudinary.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const blogService = new BlogService();
const adminService = new AdminService();

export class BlogController {
  getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
    const blogs = await blogService.getAllBlogs(req.query);
    sendSuccess(res, blogs, "Blogs fetched successfully");
  });

  getBlogById = asyncHandler(async (req: Request, res: Response) => {
    const blog = await blogService.getBlogById(req.params.id);
    sendSuccess(res, blog, "Blog fetched successfully");
  });

  getBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
    const blog = await blogService.getBlogBySlug(req.params.slug);
    sendSuccess(res, blog, "Blog fetched successfully");
  });

  createBlog = asyncHandler(async (req: Request, res: Response) => {
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.BLOGS);
      imageUrl = result.secure_url;
    } else {
      // Validation for enterprise requirement: image is required
      throw new AppError("Blog featured image is required", 400);
    }

    const blogData = {
      ...req.body,
      image: imageUrl,
      // Ensure tags are handled as array even if sent as comma string
      tags: typeof req.body.tags === 'string'
        ? req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : req.body.tags,
      // Handle highlights
      highlights: typeof req.body.highlights === 'string'
        ? req.body.highlights.split(',').map((h: string) => h.trim()).filter(Boolean)
        : req.body.highlights,
      // Handle nested authorDetails if sent as stringified JSON from FormData (already handled by Zod transform)
      authorDetails: typeof req.body.authorDetails === 'string'
        ? JSON.parse(req.body.authorDetails)
        : req.body.authorDetails,
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true
    };

    const blog = await blogService.createBlog(blogData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "BLOG",
        resourceId: blog._id.toString(),
        details: `Created blog: ${blog.title}`,
      });
    }

    sendSuccess(res, blog, "Blog created successfully", 201);
  });

  updateBlog = asyncHandler(async (req: Request, res: Response) => {
    let updateData = {
      ...req.body,
      // Handle tags if present
      ...(req.body.tags && {
        tags: typeof req.body.tags === 'string'
          ? req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : req.body.tags
      }),
      // Handle highlights if present
      ...(req.body.highlights && {
        highlights: typeof req.body.highlights === 'string'
          ? req.body.highlights.split(',').map((h: string) => h.trim()).filter(Boolean)
          : req.body.highlights
      }),
      // Handle authorDetails if present
      ...(req.body.authorDetails && {
        authorDetails: typeof req.body.authorDetails === 'string'
          ? JSON.parse(req.body.authorDetails)
          : req.body.authorDetails
      }),
      ...(req.body.isFeatured !== undefined && {
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true
      })
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.BLOGS);
      updateData.image = result.secure_url;

      const oldBlog = await blogService.getBlogById(req.params.id);
      if (oldBlog.image) {
        const publicId = oldBlog.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          await deleteFromCloudinary(`blogs/${publicId}`);
        }
      }
    }

    const blog = await blogService.updateBlog(req.params.id, updateData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "BLOG",
        resourceId: blog._id.toString(),
        details: `Updated blog: ${blog.title}`,
      });
    }

    sendSuccess(res, blog, "Blog updated successfully");
  });

  deleteBlog = asyncHandler(async (req: Request, res: Response) => {
    const blog = await blogService.getBlogById(req.params.id);

    if (blog.image) {
      const publicId = blog.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        await deleteFromCloudinary(`blogs/${publicId}`);
      }
    }

    await blogService.deleteBlog(req.params.id);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "BLOG",
        resourceId: req.params.id,
        details: `Deleted blog: ${blog.title}`,
      });
    }

    sendSuccess(res, null, "Blog deleted successfully");
  });
}
