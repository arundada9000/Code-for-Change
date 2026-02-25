// src/middlewares/auth.middleware.ts

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../configs/env.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
    permissions?: string[];
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from cookie (standard name 'jwt')
    const token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - authentication required",
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      permissions?: string[];
    };

    // 3. Attach to request
    req.user = decoded;

    // 4. Update lastActive status (throttled)
    const updateLastActive = async () => {
      try {
        const { UserTable } = await import("../../modules/user/user.model.js");
        const user = await UserTable.findById(decoded.id);
        if (user) {
          const now = new Date();
          const lastActive = user.lastActive;
          
          // Only update if lastActive is more than 1 minute old or null
          if (!lastActive || (now.getTime() - lastActive.getTime()) > 60000) {
            user.lastActive = now;
            await user.save();
          }
        }
      } catch (err) {
        console.error("Failed to update lastActive:", err);
      }
    };
    
    // Run update in background
    updateLastActive();

    next();
  } catch (error: any) {
    console.error("JWT verification failed:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message || "Unauthorized - authentication required",
    });
  }
};
