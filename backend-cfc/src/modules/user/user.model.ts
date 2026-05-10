import { Schema, model } from "mongoose";
import { IUser } from "./user.interface.js";
import { ROLES, PERMISSIONS, PermissionValue, EB_POSITIONS } from "../../shared/configs/permissions.js";

export const PROVINCES = [
  "Kathmandu",
  "Pokhara",
  "Rupandehi",
  "Dang",
  "Birgunj",
  "Farwest",
  "Koshi",
  "Chitwan",
  "LB Karnali",
] as const;

const userSchema = new Schema(
  {
    // ────────────────────────────────────────────────
    // BASIC INFORMATION
    // ────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    secondaryEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"],
      sparse: true,
    },

    profileImage: { type: String },
    coverImage: { type: String },
    bio: { type: String, maxlength: 1000 },
    website: { type: String },
    linkedin: { type: String },
    github: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    tiktok: { type: String },
    youtube: { type: String },
    tenure: { type: String },

    dateOfBirth: { type: Date },
    gender: {
      type: String,
      lowercase: true,
    },
    province: { type: String, trim: true },
    address: { type: String, trim: true },

    // ────────────────────────────────────────────────
    // ROLE & PERMISSIONS
    // ────────────────────────────────────────────────
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, "User role is required"],
      lowercase: true,
      default: "gm",
      index: true,
    },

    roles: [
      {
        type: String,
        enum: Object.values(ROLES),
        lowercase: true,
      },
    ],

    permissions: {
      type: [String],
      default: [],

      set: (val: unknown) => {
        if (!Array.isArray(val)) return [];
        return [
          ...new Set(
            val
              .filter(
                (v): v is string =>
                  typeof v === "string" && v.trim().length > 0,
              )
              .map((v) => v.trim().toLowerCase()),
          ),
        ];
      },

      validate: {
        validator: function (this: any, val: unknown): boolean {
          if (!Array.isArray(val)) return false;

          const knownPermissions = Object.values(
            PERMISSIONS,
          ) as readonly PermissionValue[];

          return val.every(
            (p): p is PermissionValue =>
              typeof p === "string" &&
              p.trim().length > 0 &&
              knownPermissions.includes(
                p.trim().toLowerCase() as PermissionValue,
              ),
          );
        },
        message: function (props: any) {
          const allowed = Object.values(PERMISSIONS).join(", ");
          return `Invalid permission value(s): ${props.value}. Allowed: ${allowed}`;
        },
      },

      index: true,
    },

    // ────────────────────────────────────────────────
    // ACCOUNT STATUS
    // ────────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    accountStatus: {
      type: String,
      enum: ["pending", "active", "suspended", "deactivated"],
      default: "pending",
      lowercase: true,
    },

    // ────────────────────────────────────────────────
    // MEMBERSHIP DATA (Merged from Member schema)
    // ────────────────────────────────────────────────
    membership: {
      membershipId: { type: String, unique: true, sparse: true },
      joinedAt: { type: Date },
      membershipStatus: {
        type: String,
        enum: ["active", "expired", "revoked"],
        lowercase: true,
      },
      chapter: { type: Schema.Types.ObjectId, ref: "Chapter" },
    },

    education: {
      collegeName: { type: String },
      university: { type: String },
      faculty: { type: String },
      semester: { type: String },
      graduationYear: { type: Number },
    },

    // ────────────────────────────────────────────────
    // ROLE-SPECIFIC EXTENSIONS
    // ────────────────────────────────────────────────
    crDetails: {
      assignedCollege: String,
      province: String,
      approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        lowercase: true,
      },
    },

    executiveDetails: {
      position: {
        type: String,
        enum: [...EB_POSITIONS],
      },
      department: String,
      termStart: Date,
      termEnd: Date,
    },

    mentorDetails: {
      expertiseAreas: [String],
      experienceYears: Number,
      availability: Boolean,
    },

    supporterDetails: {
      organizationName: String,
      contributionType: String,
    },

    // ────────────────────────────────────────────────
    // SECURITY & LOGIN CONTROL
    // ────────────────────────────────────────────────
    lastLogin: { type: Date },
    loginHistory: [
      {
        ip: String,
        device: String,
        date: Date,
      },
    ],
    lastActive: { type: Date },

    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    otp: { type: String },
    otpExpiry: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    otpLastSentAt: { type: Date },
    otpVerified: { type: Boolean, default: false },

    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },

    // WebAuthn / Passkey credentials (one per registered device)
    webauthnCredentials: [{
      credentialId: { type: String, required: true },
      publicKey:    { type: String, required: true },
      counter:      { type: Number, required: true, default: 0 },
      transports:   [{ type: String }],
      deviceName:   { type: String, default: 'Unknown Device' },
      createdAt:    { type: Date, default: Date.now },
    }],

    // Soft Delete
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  },
);

// ────────────────────────────────────────────────
// INDEXES
// ────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ "membership.membershipId": 1 }, { sparse: true });
userSchema.index({ "webauthnCredentials.credentialId": 1 }, { sparse: true });

export const UserTable = model<IUser>("users", userSchema);
