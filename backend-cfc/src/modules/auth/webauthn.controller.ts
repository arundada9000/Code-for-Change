/**
 * WebAuthn Controller
 *
 * Thin controller layer that wraps the WebAuthn service.
 * Sets the JWT cookie identically to the existing loginController.
 */

import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { successResponse } from "../../shared/utils/response.js";
import { ENV } from "../../shared/configs/env.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";
import { AdminService } from "../admin/admin.service.js";
import * as webauthn from "./webauthn.service.js";

const adminService = new AdminService();

// ── Registration (requires authentication) ──────────────────────────

export const registerOptions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { options, challengeId } = await webauthn.getRegistrationOptions(
      req.user!.id
    );
    successResponse(res, { options, challengeId }, "Registration options generated");
  }
);

export const registerVerify = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { challengeId, response, deviceName } = req.body;

    const result = await webauthn.verifyRegistration(
      req.user!.id,
      challengeId,
      response,
      deviceName || "My Device"
    );

    successResponse(res, result, "Biometric credential registered successfully");
  }
);

// ── Authentication (public) ─────────────────────────────────────────

export const loginOptions = asyncHandler(
  async (_req: Request, res: Response) => {
    const { options, challengeId } = await webauthn.getAuthenticationOptions();
    successResponse(res, { options, challengeId }, "Authentication options generated");
  }
);

export const loginVerify = asyncHandler(
  async (req: Request, res: Response) => {
    const { challengeId, response } = req.body;

    const { token, user } = await webauthn.verifyAuthentication(
      challengeId,
      response,
      {
        ip: req.ip || "unknown",
        device: (Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : req.headers["user-agent"]) || "webauthn",
      }
    );

    // Set secure cookie — identical to the existing loginController
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: ENV.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Log the activity
    await adminService.logActivity({
      userId: user.id,
      userName: user.name,
      action: "LOGIN",
      resource: "USER",
      details: `${user.name} logged in via biometrics (WebAuthn).`,
    });

    successResponse(res, { token, user }, "Biometric login successful");
  }
);

// ── Credential Management (requires authentication) ─────────────────

export const listCredentials = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const credentials = await webauthn.listCredentials(req.user!.id);
    successResponse(res, credentials, "Credentials retrieved");
  }
);

export const removeCredential = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await webauthn.removeCredential(req.user!.id, req.params.id as string);
    successResponse(res, null, "Credential removed");
  }
);
