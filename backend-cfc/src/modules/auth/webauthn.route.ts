import { validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import * as ctrl from "./webauthn.controller.js";

const router = Router();

// ── Registration (user must be logged in first) ─────────────────────
router.post("/register-options", authenticate, ctrl.registerOptions);
router.post("/register-verify", authenticate, ctrl.registerVerify);

// ── Authentication (public — this IS the login) ─────────────────────
router.post("/login-options", ctrl.loginOptions);
router.post("/login-verify", ctrl.loginVerify);

// ── Credential management (authenticated) ───────────────────────────
router.get("/credentials", authenticate, ctrl.listCredentials);
router.delete("/credentials/:id", validateMongoId(), authenticate, ctrl.removeCredential);

export { router as webauthnRoutes };
