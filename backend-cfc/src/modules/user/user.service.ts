import {
  PERMISSIONS,
  PermissionValue,
  ROLE_PERMISSIONS,
  RoleValue,
} from "../../shared/configs/permissions.js";
import {
  CreatedUser,
  CurrentUser,
  GetUsersOptions,
  ICreateUserInput,
  IUpdateUserInput,
  IUser,
  PermissionOperationResult,
} from "../../modules/user/user.interface.js";
import { hashPassword } from "../../shared/utils/hash.js";
import { ROLES } from "../../shared/configs/permissions.js";
import { UserTable } from "./user.model.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import { Types } from "mongoose";

// Create user function with proper Promise return type
export const createUser = async (
  input: ICreateUserInput,
): Promise<CreatedUser> => {
  try {
    // 1. Normalize role (safe, since RoleValue is string)
    const normalizedRole = input.role.trim().toLowerCase() as RoleValue;

    // 2. Validate role exists
    if (!Object.values(ROLES).includes(normalizedRole)) {
      throw new Error(
        `Invalid role: "${input.role}". Allowed: ${Object.values(ROLES).join(
          ", ",
        )}`,
      );
    }

    // 3. Get permissions for this role (type-safe indexing)
    const permissions: PermissionValue[] =
      ROLE_PERMISSIONS[normalizedRole] || []; // No need for 'as keyof' - keys match RoleValue

    // Helper to parse potential JSON string
    const parseNested = (val: any) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    };

    // 4. Prepare final data
    const userData = {
      ...input,
      role: normalizedRole,
      permissions,
      isVerified: true,
      isActive: true,
      password: await hashPassword(input.password),
      membership: parseNested(input.membership),
      education: parseNested(input.education),
      executiveDetails: parseNested(input.executiveDetails),
    };

    // 5. Create and save
    const user = await new UserTable(userData).save();

    // 6. Return safe projection (Promise<CreatedUser>)
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions as PermissionValue[], // safe cast
      isVerified: user.isVerified,
      isActive: user.isActive,
    };
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("Email already exists");
    }
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

export const getUsers = async (
  options: GetUsersOptions = {},
): Promise<any[]> => {
  const { excludeUserId } = options;

  const query: any = {
    // Exclude super admin email - strictly hidden from all lists
    email: { $ne: "sajhilodigital@gmail.com" },
    role: { $ne: ROLES.SUPER_ADMIN },
  };

  // If logged-in user ID is provided, exclude them too
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const users = await UserTable.find(query).select(
    "-password -otp -otpExpiry -failedLoginAttempts -lockUntil -resetPasswordToken -resetPasswordExpiry",
  );

  return users.map((user: any) => ({
    id: user._id.toString(),
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    secondaryEmail: user.secondaryEmail,
    role: user.role,
    permissions: user.permissions,
    isVerified: user.isVerified,
    isActive: user.isActive,
    accountStatus: user.accountStatus,
    profileImage: user.profileImage,
    province: user.province,
    address: user.address,
    bio: user.bio,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    phone: user.phone,
    website: user.website,
    linkedin: user.linkedin,
    github: user.github,
    facebook: user.facebook,
    twitter: user.twitter,
    instagram: user.instagram,
    tiktok: user.tiktok,
    youtube: user.youtube,
    executiveDetails: user.executiveDetails,
    membership: user.membership,
    education: user.education,
    tenure: user.tenure,
    createdAt: user.createdAt,
  }));
};
// Update user
export const updateUser = async (
  id: string,
  data: Partial<IUpdateUserInput>,
): Promise<CreatedUser> => {
  try {
    const updatePayload: Partial<IUpdateUserInput> = {};

    // 0️⃣ Superadmin protection
    const userToUpdate = await UserTable.findById(id);
    if (userToUpdate && userToUpdate.email === "sajhilodigital@gmail.com") {
      throw new Error(
        "Superadmin account cannot be modified via secondary admin channels.",
      );
    }

    // 1️⃣ Password update
    if (typeof data.password === "string" && data.password.trim()) {
      updatePayload.password = await hashPassword(data.password);
    }

    // 2️⃣ Role update → normalize + assign permissions
    if (typeof data.role === "string") {
      const normalizedRole = data.role.trim().toLowerCase() as RoleValue;

      // CHECK ROLE VALUE (correct)
      if (!Object.values(ROLES).includes(normalizedRole)) {
        throw new Error(`Invalid role: "${data.role}"`);
      }

      updatePayload.role = normalizedRole;
      updatePayload.permissions = ROLE_PERMISSIONS[normalizedRole];
    }

    // 3️⃣ Other updatable fields (explicit allow-list)
    if (typeof data.name === "string") updatePayload.name = data.name;
    if (typeof data.secondaryEmail === "string")
      updatePayload.secondaryEmail = data.secondaryEmail;
    if (typeof data.isActive === "boolean")
      updatePayload.isActive = data.isActive;
    if (typeof data.province === "string")
      updatePayload.province = data.province;
    if (typeof data.profileImage === "string")
      updatePayload.profileImage = data.profileImage;
    if (typeof data.address === "string") updatePayload.address = data.address;
    if (typeof data.bio === "string") updatePayload.bio = data.bio;
    if (typeof data.gender === "string") updatePayload.gender = data.gender;
    if (data.dateOfBirth)
      updatePayload.dateOfBirth = new Date(data.dateOfBirth);
    // Social links
    if (typeof data.linkedin === "string")
      updatePayload.linkedin = data.linkedin;
    if (typeof data.github === "string") updatePayload.github = data.github;
    if (typeof data.facebook === "string")
      updatePayload.facebook = data.facebook;
    if (typeof data.website === "string") updatePayload.website = data.website;
    // Additional fields present in schema but previously unmapped
    if (typeof data.phone === "string") updatePayload.phone = data.phone;
    if (typeof data.tenure === "string") updatePayload.tenure = data.tenure;
    if (typeof data.twitter === "string") updatePayload.twitter = data.twitter;
    if (typeof data.instagram === "string") updatePayload.instagram = data.instagram;
    if (typeof data.tiktok === "string") updatePayload.tiktok = data.tiktok;
    if (typeof data.youtube === "string") updatePayload.youtube = data.youtube;
    if (typeof data.isVerified === "boolean") updatePayload.isVerified = data.isVerified;

    // Helper to parse potential JSON string
    const parseNested = (val: any) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    };

    // 4️⃣ Handle nested objects
    if (data.membership) {
      const membership = parseNested(data.membership);
      updatePayload.membership = {
        ...(userToUpdate?.membership
          ? (userToUpdate.membership as any).toObject()
          : {}),
        ...membership,
      };
    }
    if (data.education) {
      const education = parseNested(data.education);
      updatePayload.education = {
        ...(userToUpdate?.education
          ? (userToUpdate.education as any).toObject()
          : {}),
        ...education,
      };
    }
    if (data.executiveDetails) {
      const exec = parseNested(data.executiveDetails);
      updatePayload.executiveDetails = {
        ...(userToUpdate?.executiveDetails
          ? (userToUpdate.executiveDetails as any).toObject()
          : {}),
        ...exec,
      };
    }
    // ebBody is the flat field sent by Member.jsx for EB position
    if (data.ebBody) {
      updatePayload.executiveDetails = {
        ...(updatePayload.executiveDetails || {}),
        ...(userToUpdate?.executiveDetails
          ? (userToUpdate.executiveDetails as any).toObject()
          : {}),
        position: data.ebBody,
      };
    }

    // 5️⃣ Update DB
    const updatedUser = await UserTable.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password -otp -otpExpiry -failedLoginAttempts -lockUntil");

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // 5️⃣ Return safe response
    return {
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      permissions: updatedUser.permissions as PermissionValue[],
      isVerified: updatedUser.isVerified,
      isActive: updatedUser.isActive,
    };
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("Email already in use");
    }
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

// Delete user
export const deleteUser = async (id: string, currentUserId: string) => {
  // Find user to delete
  const user = await UserTable.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent deletion of admin users
  if (user.role === ROLES.ADMIN) {
    throw new Error("Admin users cannot be deleted");
  }

  // Prevent deletion of superadmin
  if (
    user.email === "sajhilodigital@gmail.com" ||
    user.role === ROLES.SUPER_ADMIN
  ) {
    throw new Error("Superadmin account is immutable and cannot be deleted.");
  }

  // Prevent self-deletion
  if (user._id.toString() === currentUserId) {
    throw new Error("Logged-in user cannot delete themselves");
  }

  // Delete user
  await UserTable.findByIdAndDelete(id);
  return true;
};

// ────────────────────────────────────────────────
// Add single permission to user
// ────────────────────────────────────────────────

export const addUserPermissionService = async (
  userId: string,
  permission: PermissionValue,
  currentUser: CurrentUser,
): Promise<PermissionOperationResult> => {
  // Early validation
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID format", 400);
  }

  if (!Object.values(PERMISSIONS).includes(permission as any)) {
    throw new AppError(`Invalid permission value: "${permission}"`, 400);
  }

  try {
    // 1. Check if target user exists and get their role BEFORE any modification
    const targetUser = await UserTable.findById(userId)
      .select("permissions role email name")
      .lean();

    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    // 2. Admin protection check BEFORE the update
    if (targetUser.role === ROLES.ADMIN && currentUser.role !== ROLES.ADMIN) {
      throw new AppError("Cannot modify permissions of admin accounts", 403);
    }

    // 3. Check if permission already exists (idempotent)
    if (targetUser.permissions.includes(permission)) {
      return {
        user: targetUser,
        message: `Permission "${permission}" already exists`,
        action: "no-op",
      };
    }

    // 4. Atomic update - safe to proceed now
    const updatedUser = await UserTable.findByIdAndUpdate(
      userId,
      { $addToSet: { permissions: permission } },
      {
        new: true,
        select: "permissions role email name",
        lean: true,
      },
    );

    return {
      user: updatedUser!,
      message: `Permission "${permission}" successfully added`,
      action: "added",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error("addUserPermissionService unexpected error:", error);

    throw new AppError(
      `Failed to add permission: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500,
    );
  }
};
// ────────────────────────────────────────────────
// Remove single permission from user
// ────────────────────────────────────────────────
export const removeUserPermissionService = async (
  userId: string,
  permission: PermissionValue,
  currentUser: CurrentUser,
) => {
  try {
    const targetUser = await UserTable.findById(userId).select("+permissions");
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }
    if (targetUser.role === ROLES.ADMIN && currentUser.role !== ROLES.ADMIN) {
      throw new AppError("Cannot modify permissions of admin accounts", 403);
    }

    // Idempotent operation
    if (!targetUser.permissions.includes(permission)) {
      return {
        user: targetUser.toObject(),
        message: `Permission '${permission}' not found`,
        action: "no-op",
      };
    }

    // Remove & save
    targetUser.permissions = targetUser.permissions.filter(
      (p) => p !== permission,
    );
    targetUser.markModified("permissions");

    await targetUser.save({ validateModifiedOnly: true });

    return {
      user: targetUser.toObject(),
      message: `Permission '${permission}' successfully removed`,
      action: "removed",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      `Failed to remove permission: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500,
    );
  }
};

/**
 * Get public list of users (verified members/executives)
 */
export const getPublicUsers = async (filters: { province?: string } = {}) => {
  const query: any = {
    isDeleted: false,
    isActive: true, // Only show active/verified users
  };

  if (filters.province) {
    query.province = filters.province;
  }

  // Only return safe, non-sensitive fields
  return await UserTable.find(query)
    .select(
      "name role province profileImage education.collegeName executiveDetails bio facebook github website linkedin",
    )
    .sort({ createdAt: -1 });
};
