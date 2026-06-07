import { Router } from "express";
import { EventController } from "./event.controller.js";
import { upload, validateFileMagicBytes } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate, validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { createEventSchema, updateEventSchema } from "./event.validation.js";

const router = Router();
const eventController = new EventController();

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Public
 */
router.get("/events", eventController.getAllEvents);
router.get("/events/slug/:slug", eventController.getEventBySlug);
router.get("/events/:id", validateMongoId(), eventController.getEventById);
router.post("/events", authenticate, requireAnyPermission(PERMISSIONS.EVENT_CREATE), upload.single("image"), validateFileMagicBytes, validate(createEventSchema), eventController.createEvent);
router.put("/events/:id", authenticate, requireAnyPermission(PERMISSIONS.EVENT_UPDATE), validateMongoId(), upload.single("image"), validateFileMagicBytes, validate(updateEventSchema), eventController.updateEvent);
router.delete("/events/:id", authenticate, requireAnyPermission(PERMISSIONS.EVENT_DELETE), validateMongoId(), eventController.deleteEvent);

export default router;
