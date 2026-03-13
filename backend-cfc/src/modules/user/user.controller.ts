import type { Request, Response } from "express";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";
import { AppError, asyncHandler } from "../../shared/utils/errorHandler.js";
import { successResponse } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_FOLDERS, extractPublicId } from "../../shared/utils/cloudinary.js";
import {
  addPermissionSchema,
  permissionParamsSchema
} from "./user.validation.js";
import { addUserPermissionService, createUser, deleteUser, getPublicUsers, getUsers, removeUserPermissionService, updateUser } from "./user.service.js";
import { UserTable } from "./user.model.js";

// Create User
export const createUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await createUser(req.body);
    successResponse(res, user, "User created", 201);
  }
);

// Get User
export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const users = await getUsers();
    successResponse(res, users);
  }
);

// Update User
export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    let updateData = { ...req.body };

    // Handle profile image upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.PROFILES);
      updateData.profileImage = result.secure_url;

      // Delete old profile image if exists
      try {
        const oldUser = await UserTable.findById(req.params.id);
        if (oldUser?.profileImage) {
          const publicId = extractPublicId(oldUser.profileImage);
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error("Failed to delete old profile image:", error);
        // Continue with update even if deletion fails
      }
    }

    const user = await updateUser(req.params.id, updateData);
    successResponse(res, user, "User updated");
  }
);
// User Delete
export const deleteUserController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userIdToDelete = req.params.id;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await deleteUser(userIdToDelete, currentUserId);
    successResponse(res, null, "User deleted successfully");
  }
);

export const addUserPermission = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { userId } = permissionParamsSchema.parse(req.params);
    const { permission } = addPermissionSchema.parse(req.body);

    const result = await addUserPermissionService(
      userId,
      permission,
      currentUser
    );

    return res.status(200).json({
      success: true,
      message: result.message, // ← use message from service (more flexible)
      action: result.action,
      data: result.user,
    });
  } catch (error) {
    // Known application errors
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        // code: error.code, // optional - if you add error codes
      });
    }

    // Unexpected errors - should be logged in production (sentry, winston, etc.)
    console.error("[addUserPermission] Unexpected error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add permission - please try again later",
    });
  }
};

export const removeUserPermission = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { userId } = req.params;
    const { permission } = req.body;



    const updatedUser = await removeUserPermissionService(
      userId,
      permission,
      currentUser
    );

    res.status(200).json({
      success: true,
      message: `Permission "${permission}" removed successfully`,
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Public Users
export const getPublicUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const filters = { province: req.query.province as string };
      const users = await getPublicUsers(filters);
      successResponse(res, users, "Public users fetched successfully");
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch public users",
      });
    }
  }
);
