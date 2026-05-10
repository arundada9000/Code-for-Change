/**
 * WebAuthn / Passkey Service
 *
 * Handles biometric credential registration and authentication using the
 * Web Authentication API (WebAuthn) via @simplewebauthn/server.
 *
 * Security model:
 * - Challenges are stored in-memory with a 60-second TTL and auto-cleanup.
 * - Discoverable credentials (passkeys) are used so the browser can find
 *   matching credentials without knowing the user's email upfront.
 * - On successful authentication, the exact same JWT + cookie flow is used
 *   as the password-based login, so all downstream middleware works unchanged.
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import { ENV } from "../../shared/configs/env.js";
import { UserTable } from "../user/user.model.js";
import { generateToken } from "../../shared/utils/jwt.js";

// ─── Base64URL helpers (avoids TS 5.9 ArrayBuffer strictness issues) ─
function toBase64URL(buf: Uint8Array): string {
  return Buffer.from(buf).toString("base64url");
}
function fromBase64URL(str: string): Uint8Array<ArrayBuffer> {
  const buf = Buffer.from(str, "base64url");
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

// ─── Relying Party Config ────────────────────────────────────────────
function getRpId(): string {
  if (ENV.WEBAUTHN_RP_ID) return ENV.WEBAUTHN_RP_ID;
  // Derive from FRONTEND_URL
  try {
    return new URL(ENV.FRONTEND_URL || "http://localhost:5173").hostname;
  } catch {
    return "localhost";
  }
}

function getExpectedOrigins(): string[] {
  const origins = [
    ENV.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://codeforchange.sajilodigital.com.np",
    "https://codeforchangenepal.com",
    "https://codeforchangenepal.vercel.app",
  ].filter(Boolean) as string[];
  return [...new Set(origins)];
}

// ─── Challenge Store (in-memory with TTL) ────────────────────────────
// Key: opaque challengeId, Value: { challenge, userId?, expiresAt }
const challengeStore = new Map<
  string,
  { challenge: string; userId?: string; expiresAt: number }
>();

const CHALLENGE_TTL_MS = 60_000; // 60 seconds

// Auto-cleanup stale challenges every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of challengeStore) {
    if (val.expiresAt < now) challengeStore.delete(key);
  }
}, 5 * 60_000);

function storeChallenge(
  challengeId: string,
  challenge: string,
  userId?: string
) {
  challengeStore.set(challengeId, {
    challenge,
    userId,
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  });
}

function consumeChallenge(challengeId: string) {
  const entry = challengeStore.get(challengeId);
  challengeStore.delete(challengeId);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry;
}

// Simple random ID for challenge tracking
function randomId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Registration ────────────────────────────────────────────────────

export async function getRegistrationOptions(userId: string) {
  const user = await UserTable.findById(userId);
  if (!user) throw new Error("User not found");

  const rpId = getRpId();

  const excludeCredentials = (user.webauthnCredentials || []).map((cred) => ({
    id: cred.credentialId,  // Already a base64url string
    transports: cred.transports as AuthenticatorTransport[] | undefined,
  }));

  const options = await generateRegistrationOptions({
    rpName: ENV.WEBAUTHN_RP_NAME,
    rpID: rpId,
    userID: isoUint8Array.fromUTF8String(user._id.toString()),
    userName: user.email,
    userDisplayName: user.name,
    attestationType: "none", // We don't need attestation for this use-case
    authenticatorSelection: {
      residentKey: "required", // Discoverable credential (passkey)
      userVerification: "preferred",
    },
    excludeCredentials,
  });

  // Store the challenge keyed by a random ID
  const challengeId = randomId();
  storeChallenge(challengeId, options.challenge, userId);

  return { options, challengeId };
}

export async function verifyRegistration(
  userId: string,
  challengeId: string,
  response: any,
  deviceName: string
) {
  const stored = consumeChallenge(challengeId);
  if (!stored || stored.userId !== userId) {
    throw new Error("Challenge expired or invalid");
  }

  const rpId = getRpId();

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: stored.challenge,
    expectedOrigin: getExpectedOrigins(),
    expectedRPID: rpId,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("Registration verification failed");
  }

  const { credential } = verification.registrationInfo;

  // Save the credential to the user document
  const user = await UserTable.findById(userId);
  if (!user) throw new Error("User not found");

  if (!user.webauthnCredentials) user.webauthnCredentials = [];

  user.webauthnCredentials.push({
    credentialId: credential.id,  // Already base64url string in v13
    publicKey: toBase64URL(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports || [],
    deviceName: deviceName || "Unknown Device",
    createdAt: new Date(),
  });

  await user.save();

  return {
    credentialId: credential.id,
    deviceName,
  };
}

// ─── Authentication ──────────────────────────────────────────────────

export async function getAuthenticationOptions() {
  const rpId = getRpId();

  const options = await generateAuthenticationOptions({
    rpID: rpId,
    userVerification: "preferred",
    // Empty allowCredentials = discoverable credential mode (passkeys)
    // The browser will show all passkeys registered for this RP
    allowCredentials: [],
  });

  const challengeId = randomId();
  storeChallenge(challengeId, options.challenge);

  return { options, challengeId };
}

export async function verifyAuthentication(
  challengeId: string,
  response: any,
  requestMeta?: { ip?: string; device?: string }
) {
  const stored = consumeChallenge(challengeId);
  if (!stored) throw new Error("Challenge expired or invalid");

  const rpId = getRpId();
  const credentialId = response.id;

  // Find the user who owns this credential
  const user = await UserTable.findOne({
    "webauthnCredentials.credentialId": credentialId,
  });

  if (!user) throw new Error("No account found for this credential");

  // ── Same security checks as password login ──
  if (!user.isActive) throw new Error("Account is deactivated. Contact support.");
  if (!user.isVerified) throw new Error("Account not verified. Please check your email.");
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error("Account is temporarily locked. Try again later.");
  }

  // Find the matching credential
  const credential = user.webauthnCredentials?.find(
    (c) => c.credentialId === credentialId
  );
  if (!credential) throw new Error("Credential not found");

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: stored.challenge,
    expectedOrigin: getExpectedOrigins(),
    expectedRPID: rpId,
    credential: {
      id: credentialId,  // base64url string
      publicKey: fromBase64URL(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports as AuthenticatorTransport[] | undefined,
    },
  });

  if (!verification.verified) throw new Error("Authentication verification failed");

  // Update counter (replay protection)
  credential.counter = verification.authenticationInfo.newCounter;

  // Update login metadata (same as password login)
  user.lastLogin = new Date();
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;

  user.loginHistory = user.loginHistory || [];
  user.loginHistory.push({
    ip: requestMeta?.ip || "unknown",
    device: requestMeta?.device || "webauthn",
    date: new Date(),
  });
  if (user.loginHistory.length > 10) user.loginHistory.shift();

  await user.save();

  // Issue the exact same JWT as password login
  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

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

  return { token, user: safeUser };
}

// ─── Credential Management ───────────────────────────────────────────

export async function listCredentials(userId: string) {
  const user = await UserTable.findById(userId);
  if (!user) throw new Error("User not found");

  return (user.webauthnCredentials || []).map((c) => ({
    id: c.credentialId,
    deviceName: c.deviceName,
    createdAt: c.createdAt,
  }));
}

export async function removeCredential(userId: string, credentialId: string) {
  const user = await UserTable.findById(userId);
  if (!user) throw new Error("User not found");

  const before = user.webauthnCredentials?.length || 0;
  user.webauthnCredentials = (user.webauthnCredentials || []).filter(
    (c) => c.credentialId !== credentialId
  );

  if (user.webauthnCredentials.length === before) {
    throw new Error("Credential not found");
  }

  await user.save();
}
