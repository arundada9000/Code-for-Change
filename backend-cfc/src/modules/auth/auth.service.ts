import { generateOTP, sendOTP } from "../../shared/utils/otp.js";
import { hashPassword, comparePassword } from "../../shared/utils/hash.js";
import { generateToken } from "../../shared/utils/jwt.js";
import { ENV } from "../../shared/configs/env.js";
import { UserTable } from "../user/user.model.js";
import { ILoginUserInput, LoginResponse } from "../user/user.interface.js";

const ALLOWED_ROLES = ["gm", "eb", "cr", "ippl", "advisor", "alumni", "guest"];

export const register = async (data: any) => {
  const existingUser = await UserTable.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const validRole = ALLOWED_ROLES.includes(data.role) ? data.role : "gm";
  const isEbUser = validRole === "eb";

  const user = new UserTable({
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: await hashPassword(data.password),
    role: validRole,
    tenure: data.tenure,
    bio: data.bio,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    address: data.address,
    linkedin: data.linkedin,
    github: data.github,
    facebook: data.facebook,
    website: data.website,
    isVerified: false,
    isActive: true,
    accountStatus: "pending",
    education: {
      collegeName: data.collegeName,
      faculty: data.faculty,
      semester: data.semester,
    },
    province: data.province,
    membership: {
      membershipId: data.code,
      joinedAt: new Date(),
      membershipStatus: "active",
    },
    executiveDetails: {
      position: isEbUser ? data.ebBody : undefined,
    },
    profileImage: data.profileImage,
  });

  await user.save();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const getMe = async (userId: string) => {
  const user = await UserTable.findById(userId);
  if (!user) throw new Error("User not found");

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    secondaryEmail: user.secondaryEmail,
    phone: user.phone,
    role: user.role,
    tenure: user.tenure,
    isVerified: user.isVerified,
    isActive: user.isActive,
    accountStatus: user.accountStatus,
    permissions: user.permissions,
    lastLogin: user.lastLogin,
    createdAt: (user as any).createdAt,
    updatedAt: (user as any).updatedAt,
    province: user.province,
    education: user.education,
    membership: user.membership,
    executiveDetails: user.executiveDetails,
    bio: user.bio,
    address: user.address,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    profileImage: user.profileImage,
    website: user.website,
    linkedin: user.linkedin,
    github: user.github,
    facebook: user.facebook,
    twitter: user.twitter,
    instagram: user.instagram,
    tiktok: user.tiktok,
    youtube: user.youtube,
  };
};

// Login service function
export const loginUser = async (
  loginData: ILoginUserInput,
  requestMeta?: { ip?: string; device?: string }
): Promise<LoginResponse> => {
  // 1. Validate input
  const { email, password } = loginData;

  // 2. Find user + include password (critical!)
  const user = await UserTable.findOne({ email }).select("+password");
  if (!user) {
    console.error(`Login failed: User not found with email ${email}`);
    throw new Error("Invalid email or password");
  }

  // 3. Account status checks
  if (!user.isActive) {
    throw new Error("Account is deactivated. Contact support.");
  }

  if (!user.isVerified) {
    throw new Error("Account not verified. Please check your email.");
  }

  // 4. Account lockout check
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error("Account is temporarily locked. Try again later.");
  }

  // 5. Compare password
  const isMatch = await comparePassword(password, user.password!);
  if (!isMatch) {
    console.error(`Login failed: Password mismatch for user ${email}`);
    // Increment failed attempts
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await user.save();
    throw new Error("Invalid email or password");
  }

  // 6. Reset failed attempts & lock on success
  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
  }

  // 7. Update lastLogin and loginHistory
  user.lastLogin = new Date();

  // We can't easily get IP/Device here without passing them from controller, 
  // but we can add a placeholder or update the type later. 
  // For now, let's just push the date.
  user.loginHistory = user.loginHistory || [];
  user.loginHistory.push({
    ip: requestMeta?.ip || "unknown",
    device: requestMeta?.device || "unknown",
    date: new Date(),
  });

  // Limit history to last 10 entries
  if (user.loginHistory.length > 10) {
    user.loginHistory.shift();
  }

  await user.save();

  // 7. Generate JWT
  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  // 8. Safe user data (never expose password or sensitive fields)
  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    secondaryEmail: user.secondaryEmail,
    phone: user.phone,
    role: user.role,
    tenure: user.tenure,
    isVerified: user.isVerified,
    isActive: user.isActive,
    accountStatus: user.accountStatus,
    permissions: user.permissions,
    education: user.education,
    membership: user.membership,
    executiveDetails: user.executiveDetails,
    bio: user.bio,
    address: user.address,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    profileImage: user.profileImage,
    province: user.province,
    website: user.website,
    linkedin: user.linkedin,
    github: user.github,
    facebook: user.facebook,
    twitter: user.twitter,
    instagram: user.instagram,
    tiktok: user.tiktok,
    youtube: user.youtube,
    lastLogin: user.lastLogin,
    createdAt: (user as any).createdAt,
  };

  return {
    token,
    user: safeUser,
  };
};

import { generateResetToken, verifyResetToken } from "../../shared/utils/jwt.js";
import bcrypt from "bcryptjs";

export const forgetPassword = async (email: string) => {
  const user = await UserTable.findOne({ email });
  if (!user) {
    // Return silently to avoid leaking user existence
    return;
  }

  // 1. Rate Limiting (60s cooldown)
  const now = new Date();
  if (user.otpLastSentAt) {
    const diffSeconds = Math.floor((now.getTime() - user.otpLastSentAt.getTime()) / 1000);
    if (diffSeconds < 60) {
      throw new Error(`Please wait ${60 - diffSeconds} seconds before requesting another OTP.`);
    }
  }

  const otp = generateOTP();
  // 2. Secure Hashing
  const hashedOtp = await bcrypt.hash(otp, 10);

  user.otp = hashedOtp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  user.otpLastSentAt = now;
  user.otpAttempts = 0;
  user.otpVerified = false;

  await user.save();
  await sendOTP(email, otp);
};

export const verifyOTP = async (email: string, otp: string) => {
  const user = await UserTable.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
    throw new Error("OTP expired or invalid. Please request a new one.");
  }

  // Rate limit attempts
  user.otpAttempts = (user.otpAttempts || 0) + 1;
  if (user.otpAttempts > 5) {
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    throw new Error("Too many failed attempts. Please request a new OTP.");
  }

  // Compare hashed OTP
  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    await user.save();
    throw new Error("Invalid verification code");
  }

  // OTP is correct
  user.otpVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpAttempts = 0;

  // Return short-lived transition token
  const resetToken = generateResetToken(email);
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins matching JWT

  await user.save();
  return resetToken;
};

export const resendOTP = async (email: string) => {
  await forgetPassword(email); // Re-use the secure logic
};

export const resetPassword = async (email: string, resetToken: string, newPassword: string) => {
  const user = await UserTable.findOne({ email });
  if (!user) throw new Error("Authorization failed");

  // 1. Verify DB Token
  if (!user.resetPasswordToken || user.resetPasswordToken !== resetToken) {
    throw new Error("Invalid reset session");
  }

  // 2. Verify Expiry
  if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
    user.resetPasswordToken = undefined;
    await user.save();
    throw new Error("Reset session expired. Please start over.");
  }

  // 3. Verify JWT Integrity
  try {
    const decoded = verifyResetToken(resetToken);
    if (decoded.email !== email || decoded.purpose !== "password_reset") {
      throw new Error("Invalid token integrity");
    }
  } catch (err) {
    throw new Error("Session verification failed");
  }

  // 4. Update Password
  user.password = await hashPassword(newPassword);

  // 5. Revoke Token & Reset State
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  user.otpVerified = false;

  await user.save();
};

export const updateProfile = async (userId: string, data: any) => {
  const user = await UserTable.findById(userId);
  if (!user) throw new Error('User not found');

  // Use !== undefined so users can explicitly clear a field by sending empty string
  if (data.name !== undefined) user.name = data.name;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.address !== undefined) user.address = data.address;
  if (data.gender !== undefined) user.gender = data.gender;
  if (data.dateOfBirth !== undefined) user.dateOfBirth = data.dateOfBirth;

  // Social links — allow clearing
  if (data.website !== undefined) user.website = data.website;
  if (data.linkedin !== undefined) user.linkedin = data.linkedin;
  if (data.github !== undefined) user.github = data.github;
  if (data.facebook !== undefined) user.facebook = data.facebook;
  if (data.twitter !== undefined) user.twitter = data.twitter;
  if (data.instagram !== undefined) user.instagram = data.instagram;
  if (data.tiktok !== undefined) user.tiktok = data.tiktok;
  if (data.youtube !== undefined) user.youtube = data.youtube;

  // Profile images
  if (data.profileImage) user.profileImage = data.profileImage;
  if (data.coverImage) user.coverImage = data.coverImage;

  // Education — merge nested, allow field clearing
  if (
    data.collegeName !== undefined ||
    data.university !== undefined ||
    data.faculty !== undefined ||
    data.semester !== undefined ||
    data.graduationYear !== undefined
  ) {
    user.education = {
      ...user.education,
      ...(data.collegeName !== undefined && { collegeName: data.collegeName }),
      ...(data.university !== undefined && { university: data.university }),
      ...(data.faculty !== undefined && { faculty: data.faculty }),
      ...(data.semester !== undefined && { semester: data.semester }),
      ...(data.graduationYear !== undefined && { graduationYear: data.graduationYear }),
    };
  }

  // Note: role, permissions, tenure, province, executiveDetails are admin-only fields
  // Users cannot change these through the profile update endpoint

  await user.save();
  return user;
};
