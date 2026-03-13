import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { successResponse } from "../../shared/utils/response.js";
import * as service from "./auth.service.js";
import { ENV } from "../../shared/configs/env.js";
import { AdminService } from "../admin/admin.service.js";

const adminService = new AdminService();

import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

// Get Current User Profile
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await service.getMe(req.user?.id!);
  successResponse(res, user, "User profile retrieved");
});

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await service.updateProfile(req.user?.id!, req.body);
    successResponse(res, user, "Profile updated successfully");
  },
);

import {
  uploadToCloudinary,
  CLOUDINARY_FOLDERS,
} from "../../shared/utils/cloudinary.js";

// Get Current User Profile
// ... (rest of imports)

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    let registrationData = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        CLOUDINARY_FOLDERS.PROFILES,
      );
      registrationData.profileImage = result.secure_url;
    }

    const user = await service.register(registrationData);
    successResponse(res, user, "Registered successfully. You can now login.");
  },
);

export const verifyOTPController = asyncHandler(
  async (req: Request, res: Response) => {
    const resetToken = await service.verifyOTP(req.body.email, req.body.otp);
    successResponse(res, { resetToken }, "OTP verified");
  },
);

//User Login
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { token, user } = await service.loginUser(
      { email, password },
      {
        ip: req.ip || "unknown",
        device: req.headers["user-agent"] || "unknown",
      },
    );

    // Set secure cookie
    res.cookie("jwt", token, {
      httpOnly: true, // Prevents JS access (XSS protection)
      secure: ENV.NODE_ENV === "production", // false in local dev (HTTP)
      sameSite: ENV.NODE_ENV === "production" ? "none" : "strict", // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 1 day - match your JWT expiry
    });

    // Log the activity
    await adminService.logActivity({
      userId: user.id,
      userName: user.name,
      action: "LOGIN",
      resource: "USER",
      details: `Admin/User ${user.name} logged in.`,
    });

    successResponse(res, { token, user }, "Login successful");
  },
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    // Clear cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: ENV.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    successResponse(res, null, "Logged out successfully");
  },
);

export const forgetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    await service.forgetPassword(req.body.email);
    successResponse(res, null, "OTP sent for reset");
  },
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    await service.resetPassword(
      req.body.email,
      req.body.resetToken,
      req.body.newPassword,
    );
    successResponse(res, null, "Password reset");
  },
);

export const resendOTPController = asyncHandler(
  async (req: Request, res: Response) => {
    await service.resendOTP(req.body.email);
    successResponse(res, null, "OTP resent");
  },
);
