import { Router } from "express";
import { GalleryController } from "./gallery.controller.js";
import { upload } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { createGallerySchema, updateGallerySchema } from "./gallery.validation.js";

const router = Router();
const galleryController = new GalleryController();

router.get("/gallery", galleryController.getAllGalleryItems);
router.get("/gallery/:id", galleryController.getGalleryItemById);
router.post("/gallery", authenticate, requireAnyPermission(PERMISSIONS.GALLERY_CREATE), upload.single("image"), validate(createGallerySchema), galleryController.createGalleryItem);
router.put("/gallery/:id", authenticate, requireAnyPermission(PERMISSIONS.GALLERY_UPDATE), upload.single("image"), validate(updateGallerySchema), galleryController.updateGalleryItem);
router.delete("/gallery/:id", authenticate, requireAnyPermission(PERMISSIONS.GALLERY_DELETE), galleryController.deleteGalleryItem);

export default router;
