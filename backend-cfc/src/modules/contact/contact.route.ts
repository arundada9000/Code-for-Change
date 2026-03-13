import { Router } from "express";
import { ContactController } from "./contact.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { createContactSchema } from "./contact.validation.js";

const router = Router();
const contactController = new ContactController();

router.get("/contacts", authenticate, requireAnyPermission(PERMISSIONS.CONTACT_VIEW), contactController.getAllContacts);
router.get("/contacts/:id", authenticate, requireAnyPermission(PERMISSIONS.CONTACT_VIEW), contactController.getContactById);
router.post("/contacts", validate(createContactSchema), contactController.createContact);
router.patch("/contacts/:id/read", authenticate, requireAnyPermission(PERMISSIONS.CONTACT_VIEW), contactController.markAsRead);
router.delete("/contacts/:id", authenticate, requireAnyPermission(PERMISSIONS.CONTACT_DELETE), contactController.deleteContact);

export default router;
