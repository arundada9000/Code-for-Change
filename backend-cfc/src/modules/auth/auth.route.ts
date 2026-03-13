import { Router } from "express";
import { forgetPasswordController, getMe, loginController, logoutController, registerController, resendOTPController, resetPasswordController, updateProfile, verifyOTPController } from "./auth.controller.js";
import { validateReqBody } from "../../shared/middlewares/validate.middleware.js";
import { loginSchema, otpSchema, registerSchema, resetPasswordSchema, updateProfileSchema } from "./auth.validation";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { upload } from "../../shared/middlewares/multer.js";

const router = Router();

router.post("/register", upload.single("profileImage"), validateReqBody(registerSchema), registerController);
router.post("/login", validateReqBody(loginSchema), loginController);
router.post("/logout", logoutController);
router.get("/me", authenticate, getMe);
router.patch("/profile", authenticate, validateReqBody(updateProfileSchema), updateProfile);

router.post("/forget-password", forgetPasswordController);
router.post("/verify-otp", validateReqBody(otpSchema), verifyOTPController);
router.post("/resend-otp", resendOTPController);
router.post(
  "/reset-password",
  validateReqBody(resetPasswordSchema),
  resetPasswordController 
);


export { router as authRoutes };
