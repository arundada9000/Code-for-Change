import { validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { Router } from "express";
import { GalleryController } from "./gallery.controller.js";
import { upload, validateFileMagicBytes } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { createGallerySchema, updateGallerySchema } from "./gallery.validation.js";

const router = Router();
const galleryController = new GalleryController();

router.get("/gallery", galleryController.getAllGalleryItems);
router.get("/gallery/:id", validateMongoId(), galleryController.getGalleryItemById);
router.post("/gallery", authenticate, requireAnyPermission(PERMISSIONS.GALLERY_CREATE), upload.single("image"), validateFileMagicBytes, validate(createGallerySchema), galleryController.createGalleryItem);
router.put("/gallery/:id", validateMongoId(), authenticate, requireAnyPermission(PERMISSIONS.GALLERY_UPDATE), upload.single("image"), validateFileMagicBytes, validate(updateGallerySchema), galleryController.updateGalleryItem);
router.delete("/gallery/:id", validateMongoId(), authenticate, requireAnyPermission(PERMISSIONS.GALLERY_DELETE), galleryController.deleteGalleryItem);

export default router;
