import { generateOTP, sendOTP } from "../../shared/utils/otp.js";
import { hashPassword, comparePassword } from "../../shared/utils/hash.js";
import { generateToken } from "../../shared/utils/jwt.js";
import { ENV } from "../../shared/configs/env.js";
import { UserTable } from "../user/user.model.js";
import { ILoginUserInput, LoginResponse } from "../user/user.interface.js";

export const register = async (data: any) => {
  const existingUser = await UserTable.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const user = new UserTable({
    ...data,
    password: await hashPassword(data.password),
    role: data.role || "gm",
    isVerified: false,
    isActive: true,
    accountStatus: "pending",
    education: {
      collegeName: data.collegeName,
      faculty: data.faculty,
      semester: data.semester,
    },
    membership: {
      membershipId: data.code,
      joinedAt: new Date(),
      membershipStatus: "active",
    },
    executiveDetails: {
      position: data.ebBody,
    },
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
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
    permissions: user.permissions,
    lastLogin: user.lastLogin,
    createdAt: (user as any).createdAt,
    updatedAt: (user as any).updatedAt,
    education: user.education,
    membership: user.membership,
    executiveDetails: user.executiveDetails,
  };
};

// Login service function
export const loginUser = async (
  loginData: ILoginUserInput
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
    ip: "unknown", // To be updated via controller if needed
    device: "unknown",
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
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
    education: user.education,
    membership: user.membership,
    executiveDetails: user.executiveDetails,
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
  if (!user) throw new Error("If an account exists with this email, an OTP has been sent.");

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
  if (!user) throw new Error("User not found");

  // Basic info updates
  if (data.name) user.name = data.name;
  if (data.phone) user.phone = data.phone;
  if (data.profileImage) user.profileImage = data.profileImage;
  if (data.coverImage) user.coverImage = data.coverImage;
  if (data.bio) user.bio = data.bio;
  if (data.website) user.website = data.website;
  if (data.linkedin) user.linkedin = data.linkedin;
  if (data.github) user.github = data.github;
  if (data.facebook) user.facebook = data.facebook;
  if (data.address) user.address = data.address;
  if (data.dateOfBirth) user.dateOfBirth = data.dateOfBirth;
  if (data.gender) user.gender = data.gender;

  // Education updates
  if (data.collegeName || data.university || data.faculty || data.semester || data.graduationYear) {
    user.education = {
      ...user.education,
      collegeName: data.collegeName || user.education?.collegeName,
      university: data.university || user.education?.university,
      faculty: data.faculty || user.education?.faculty,
      semester: data.semester || user.education?.semester,
      graduationYear: data.graduationYear || user.education?.graduationYear,
    };
  }

  // Role-specific extensions
  if (data.position || data.department) {
    user.executiveDetails = {
      ...user.executiveDetails,
      position: data.position || user.executiveDetails?.position,
      department: data.department || user.executiveDetails?.department,
    };
  }

  await user.save();
  return user;
};
