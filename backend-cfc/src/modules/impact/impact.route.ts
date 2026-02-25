import { Router } from "express";
import { ImpactController } from "./impact.controller.js";
import { upload } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";

const router = Router();
const impactController = new ImpactController();

router.get("/impacts", impactController.getAllImpacts);
router.get("/impacts/:id", impactController.getImpactById);
router.post("/impacts", authenticate, requireAnyPermission(PERMISSIONS.IMPACT_CREATE), upload.single("image"), impactController.createImpact);
router.put("/impacts/:id", authenticate, requireAnyPermission(PERMISSIONS.IMPACT_UPDATE), upload.single("image"), impactController.updateImpact);
router.delete("/impacts/:id", authenticate, requireAnyPermission(PERMISSIONS.IMPACT_DELETE), impactController.deleteImpact);

export default router;
