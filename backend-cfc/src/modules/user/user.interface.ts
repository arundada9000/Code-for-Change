// src/models/user/user.model.ts (or a separate types file)

// Import from your roles config
import { PermissionValue, RoleValue } from "../../shared/configs/permissions.js";
import { Document, Types } from "mongoose";

// WebAuthn credential stored per registered device
export interface WebAuthnCredential {
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
  deviceName: string;
  createdAt: Date;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPreferences {
  events: boolean;
  eventsAllProvinces: boolean;
  internships: boolean;
  applications: boolean;
  certificates: boolean;
  account: boolean;
  resources: boolean;
  content: boolean;
}

// 1. User interface (full DB document shape)
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  secondaryEmail?: string;
  password: string;
  phone?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  address?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  tenure?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  province?: string;

  role: RoleValue;
  roles?: RoleValue[];
  permissions: PermissionValue[];

  isVerified: boolean;
  isActive: boolean;
  accountStatus: "pending" | "active" | "suspended" | "deactivated";

  membership?: {
    membershipId?: string;
    joinedAt?: Date;
    membershipStatus?: "active" | "expired" | "revoked";
    chapter?: Types.ObjectId;
  };

  education?: {
    collegeName?: string;
    university?: string;
    faculty?: string;
    semester?: string;
    graduationYear?: number;
  };

  crDetails?: {
    assignedCollege?: string;
    province?: string;
    approvalStatus?: "pending" | "approved" | "rejected";
  };

  executiveDetails?: {
    position?: string;
    department?: string;
    termStart?: Date;
    termEnd?: Date;
  };

  mentorDetails?: {
    expertiseAreas?: string[];
    experienceYears?: number;
    availability?: boolean;
  };

  supporterDetails?: {
    organizationName?: string;
    contributionType?: string;
  };

  lastLogin?: Date;
  loginHistory?: Array<{
    ip: string;
    device: string;
    date: Date;
  }>;
  lastActive?: Date;

  failedLoginAttempts: number;
  lockUntil?: Date;

  otp?: string;
  otpExpiry?: Date;
  otpAttempts?: number;
  otpLastSentAt?: Date;
  otpVerified: boolean;

  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;

  webauthnCredentials?: WebAuthnCredential[];
  pushSubscriptions?: PushSubscription[];
  notificationPreferences?: NotificationPreferences;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
  };
}

export interface ICreateUserInput {
  _id?: string;
  name: string;
  email: string;
  secondaryEmail?: string;
  password: string;
  role: RoleValue; 
  phone?: string;
  province?: string;
  profileImage?: string;
  address?: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  linkedin?: string;
  github?: string;
  facebook?: string;
  website?: string;
  membership?: {
    membershipId?: string;
    membershipStatus?: "active" | "expired" | "revoked";
  };
  education?: {
    collegeName?: string;
    university?: string;
    faculty?: string;
    semester?: string;
    graduationYear?: number;
  };
  executiveDetails?: {
    position?: string;
  };
}

// Safe returned user type (Promise<CreatedUser>)
export interface CreatedUser {
  _id: string;
  name: string;
  email: string;
  role: RoleValue;
  permissions: PermissionValue[]; // Now correctly typed as permission literals
  isVerified: boolean;
  isActive: boolean;
}

// 4. Input for updating user (partial)
export interface IUpdateUserInput {
  name?: string;
  email?: string;
  secondaryEmail?: string;
  password?: string;
  role?: RoleValue;
  permissions?: PermissionValue[];
  phone?: string;
  tenure?: string;
  isActive?: boolean;
  isVerified?: boolean;
  province?: string;
  profileImage?: string;
  address?: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  linkedin?: string;
  github?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
  // Flat field sent by Member.jsx for EB position shortcut
  ebBody?: string;
  membership?: {
    membershipId?: string;
    membershipStatus?: "active" | "expired" | "revoked";
  };
  education?: {
    collegeName?: string;
    university?: string;
    faculty?: string;
    semester?: string;
    graduationYear?: number;
  };
  executiveDetails?: {
    position?: string;
    department?: string;
    termStart?: Date;
    termEnd?: Date;
  };
}

// 5. Login input (minimal)
export interface ILoginUserInput {
  email: string;
  password: string;
}

// Get all users (admin only)
export interface GetUsersOptions {
  excludeUserId?: string; 
}

export interface CurrentUser {
  id: string;
  _id?: string; // Add this to allow _id from Mongoose
  role: string;
}

export interface PermissionOperationResult {
  user: Record<string, any>; // better to define proper type later
  message: string;
  action: "added" | "no-op";
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categoryId?: string;
  isAvailable?: string; 
}

export interface IUserPayload {
  id: string;
  role: RoleValue;
}