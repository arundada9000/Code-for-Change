// src/middlewares/permission.middleware.ts

import type { NextFunction, Response } from "express";
import {
  PermissionValue,
  ROLE_PERMISSIONS,
  RoleValue,
} from "../configs/permissions.js";
import { AuthRequest } from "./auth.middleware.js";
import { UserTable } from "modules/user/user.model.js";

export const requireAnyPermission = (
  ...requiredPermissions: PermissionValue[]
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - authentication required",
        });
      }

      const userRole = req.user.role.toLowerCase() as RoleValue;

      if (!(userRole in ROLE_PERMISSIONS)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized - authentication required",
        });
      }

      /* ---------------- ADMIN OVERRIDE ---------------- */
      if (userRole === "admin" || userRole === "superadmin") {
        return next();
      }

      // EB tech-lead gets admin-level access
      if (userRole === "eb") {
        const user = await UserTable.findById(req.user.id)
          .select("executiveDetails permissions")
          .lean();
        if (user?.executiveDetails?.position === "tech-lead") {
          return next();
        }
        // Continue to permission check for other EB positions
        const rolePermissions = ROLE_PERMISSIONS[userRole] ?? [];
        const dbPermissions = (user?.permissions ?? []) as PermissionValue[];
        const finalPermissions = new Set<PermissionValue>([...rolePermissions, ...dbPermissions]);
        const hasAny = requiredPermissions.some((perm) => finalPermissions.has(perm));
        if (!hasAny) {
          return res.status(403).json({ success: false, message: "Unauthorized - insufficient permissions" });
        }
        return next();
      }

      /* ---------------- ROLE PERMISSIONS ---------------- */
      const rolePermissions = ROLE_PERMISSIONS[userRole] ?? [];

      /* ---------------- DB PERMISSIONS ---------------- */
      const user = await UserTable.findById(req.user.id)
        .select("permissions")
        .lean();

      const dbPermissions = (user?.permissions ?? []) as PermissionValue[];

      /* ---------------- MERGE ---------------- */
      const finalPermissions = new Set<PermissionValue>([
        ...rolePermissions,
        ...dbPermissions,
      ]);

      /* ---------------- CHECK ---------------- */
      const hasAny = requiredPermissions.some((perm) =>
        finalPermissions.has(perm)
      );

      if (!hasAny) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized - authentication required",
          // requiredAnyOf: requiredPermissions,
          // userHas: Array.from(finalPermissions),
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
