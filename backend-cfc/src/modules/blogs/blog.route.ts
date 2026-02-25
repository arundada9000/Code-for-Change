import { Router } from "express";
import { BlogController } from "./blog.controller.js";
import { upload } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { createBlogSchema, updateBlogSchema } from "./blog.validation.js";

const router = Router();
const blogController = new BlogController();

router.get("/blogs", blogController.getAllBlogs);
router.get("/blogs/slug/:slug", blogController.getBlogBySlug);
router.get("/blogs/:id", blogController.getBlogById);
router.post("/blogs", authenticate, requireAnyPermission(PERMISSIONS.BLOG_CREATE), upload.single("image"), validate(createBlogSchema), blogController.createBlog);
router.put("/blogs/:id", authenticate, requireAnyPermission(PERMISSIONS.BLOG_UPDATE), upload.single("image"), validate(updateBlogSchema), blogController.updateBlog);
router.delete("/blogs/:id", authenticate, requireAnyPermission(PERMISSIONS.BLOG_DELETE), blogController.deleteBlog);

export default router;
