# Edge Cases & What to Keep in Mind — Code for Change Nepal

> This document captures non-obvious behaviors, design decisions, security considerations, and potential pitfalls. Read this before making changes to avoid breaking things.

---

## Table of Contents

1. [Authentication & Security](#1-authentication--security)
2. [Backend Architecture](#2-backend-architecture)
3. [Database & MongoDB](#3-database--mongodb)
4. [File Uploads & Media](#4-file-uploads--media)
5. [Frontend Specifics](#5-frontend-specifics)
6. [WebAuthn / Passkeys](#6-webauthn--passkeys)
7. [Push Notifications](#7-push-notifications)
8. [Deployment](#8-deployment)
9. [Payment Integration](#9-payment-integration)
10. [Admin & RBAC](#10-admin--rbac)

---

## 1. Authentication & Security

### Dual Token Strategy — Intentional but Dangerous

The backend supports **both** HttpOnly cookies AND Bearer tokens:

```typescript
const token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];
```

**Why this exists:** When frontend and backend are on different origins (e.g., Vercel frontend + Render backend), HttpOnly cookies with `SameSite=None` + `Secure` may be blocked by some browsers or privacy extensions. The Bearer token in localStorage acts as a fallback.

**The risk:** localStorage is accessible via JavaScript (XSS). If an attacker injects a script, they can steal the token. The HttpOnly cookie was meant to prevent exactly this.

**If you fix this:**
- **Option A (Pure Web):** Remove localStorage token. Use only HttpOnly cookies. Requires same-domain deployment (both frontend and backend on Vercel).
- **Option B (Hybrid with mobile):** Keep Bearer tokens but implement CSRF tokens and Content Security Policy headers.
- **Option C (Current):** Accept both, knowing that the localStorage fallback weakens the HttpOnly protection.

### Superadmin Protection — Hardcoded Email

The super admin account (`sajhilodigital@gmail.com`) is **protected at multiple levels**:

```typescript
// In admin service — cannot be modified by anyone except the owner
if (user.email === "sajhilodigital@gmail.com" || user.role === 'superadmin') {
  if (currentUser?.email !== "sajhilodigital@gmail.com")
    throw new Error("Superadmin accounts can only be modified by the primary system owner.");
}

// In user service — cannot be deleted
if (user.email === "sajhilodigital@gmail.com" || user.role === ROLES.SUPER_ADMIN)
  throw new Error("Superadmin account is immutable and cannot be deleted.");

// In user listing — hidden from regular user lists
const query = { email: { $ne: "sajhilodigital@gmail.com" }, role: { $ne: ROLES.SUPER_ADMIN } };
```

**What this means:**
- Deleting the superadmin account is intentionally impossible through the API
- Only the superadmin can modify their own account
- The superadmin is excluded from regular user listings
- If you need a different superadmin, modify the seed script or the database directly

### Login History — Capped at 10 Entries

```typescript
if (user.loginHistory.length > 10) {
  user.loginHistory.shift();
}
```

The last 10 logins are tracked. Old entries are dropped from the front of the array. This is a reasonable cap — login history is for audit, not analytics.

### Email Existence Leak — Intentionally Prevented

```typescript
// In forgetPassword — always returns success
const user = await UserTable.findOne({ email });
if (!user) {
  return; // Silently return — don't reveal whether email exists
}
```

This prevents attackers from enumerating registered email addresses via the password reset flow.

### OTP Rate Limiting — Multiple Layers

1. **Per-IP:** 5 forget-password requests per hour (app.ts rate limiter)
2. **Per-email:** 60-second cooldown between OTP sends (service layer)
3. **Per-email:** 5 failed OTP attempts invalidates the OTP (service layer)
4. **OTP expiry:** 10 minutes (service layer)
5. **OTP hashing:** OTP is bcrypt-hashed before storage (not plain text)

---

## 2. Backend Architecture

### .js Extensions in TypeScript Imports

Every local import in the backend uses `.js` extension:

```typescript
import { ENV } from "./shared/configs/env.js";  // NOT env.ts
```

This is **required** because:
1. TypeScript compiles to JavaScript
2. Node.js ESM requires explicit file extensions
3. The compiled JS files will have `.js` extensions
4. TypeScript resolves `env.js` → `env.ts` during compilation

**Never remove the `.js` extension** from imports. It will break at runtime.

### Duplicate Error Handler Classes

The codebase has **two** `AppError` classes:
- `src/shared/utils/appError.ts` (standalone file)
- `src/shared/utils/errorHandler.ts` (also defines AppError)

The `errorHandler.ts` version is used in some modules. Both are functionally identical but have different import paths. **Standardize new code on the standalone `appError.ts`.**

### Multiple Database Connection Files

There are **two** database connection files:
- `src/loaders/database.ts` — Used by `server.ts` (with process.exit on failure)
- `src/shared/configs/database.ts` — Used by seed/migration scripts (also with process.exit)

Both connect to MongoDB using `ENV.MONGO_URI`. The `loaders/database.ts` version is the primary one used by the application.

### Redis — Optional with Mock Fallback

Redis is **entirely optional**. When not configured, a **mock Redis client** is used:

```typescript
redis = {
  setex: async () => "OK",   // no-op
  get: async () => null,      // always returns null
  del: async () => 0,         // no-op
};
```

This means:
- Code that calls `redis.get()`, `redis.setex()`, or `redis.del()` will work without Redis
- Caching is effectively disabled when Redis is not configured
- No errors or crashes from missing Redis

### Rate Limiter — Trust Proxy Requirement

```typescript
app.set("trust proxy", 1);
```

This is **critical** for rate limiting to work behind proxies (Vercel, Render, Nginx). Without it, all requests appear to come from the proxy's IP (`127.0.0.1`), making rate limiting useless.

### Mongoose `family: 4`

```typescript
mongoose.connect(ENV.MONGO_URI, { family: 4 });
```

This forces IPv4 only. Without this, some systems may attempt IPv6 DNS resolution first, causing slow connections or failures if IPv6 isn't configured.

---

## 3. Database & MongoDB

### Schema Changes — No Migration Framework

Mongoose schemas are applied directly. There's **no migration system** (no Alembic, no Prisma Migrate, no Knex).

**When adding a field to a schema:**
1. Add the field to the interface (`.interface.ts`)
2. Add the field to the Mongoose schema (`.model.ts`)
3. Existing documents will have `undefined` for that field — handle this in your code
4. Add a sparse index if querying by this field

**When removing a field:**
1. Remove from interface and schema
2. Existing documents will still have the old field (Mongoose ignores it)
3. Consider a cleanup script if the field has significant data

### Indexes Are Defined in Schema

All MongoDB indexes are defined in the Mongoose schema files. They are automatically created when the application starts. No manual index management needed.

However, this means:
- Schema changes may trigger index rebuilds on large collections
- `unique: true` constraints will fail if existing data has duplicates
- `sparse: true` prevents unique constraint errors on documents without the field

### `_id` vs `id`

Both are available on Mongoose documents. The interface uses `_id: Types.ObjectId`. Through Mongoose's default `toJSON` transform, `_id` is serialized as a string. The frontend generally uses `_id`.

---

## 4. File Uploads & Media

### Multer → Cloudinary Pipeline

Files are **never stored on disk**. The pipeline is:
1. Multer `memoryStorage()` keeps file in memory as `Buffer`
2. Controller calls `uploadToCloudinary(buffer, folder)`
3. Buffer is streamed to Cloudinary via `streamifier`
4. Cloudinary returns `secure_url` and `public_id`
5. URL is saved to the document in MongoDB

### 120-Second Cloudinary Upload Timeout

```typescript
const uploadTimeout = setTimeout(() => {
  reject(new Error("Cloudinary upload timed out after 120 seconds"));
}, 120000);
```

**Why it exists:** Some file uploads (especially large images, PDFs) can take time to transfer to Cloudinary. The 2-minute timeout prevents the request from hanging indefinitely.

**Cold start impact on Vercel:** On serverless cold starts, the first upload may be slower due to connection initialization.

### File Size Limits

- **Multer (frontend uploads):** 5MB
- **Express JSON body:** 2MB
- **Express URL-encoded body:** 2MB

**What this means:**
- Uploaded images >5MB are rejected by Multer
- API requests with JSON body >2MB are rejected
- URL-encoded form submissions >2MB are rejected

**If you need larger uploads:**
- Increase the Multer limit in `multer.ts`
- Keep the Express JSON limit at 2MB (or adjust per-route)
- Consider chunked uploads for very large files

### Cloudinary Folder Organization

All uploads go to `cfc/{module}/`. The folder constant is defined in `cloudinary.ts`:

```typescript
CLOUDINARY_FOLDERS = {
  EVENTS: 'cfc/events',
  PROFILES: 'cfc/profiles',
  BLOGS: 'cfc/blogs',
  // ... etc
};
```

**Always use the constant** rather than hardcoding folder strings. This ensures consistency and makes folder restructuring possible in one place.

### Cloudinary Credential Validation

On startup, the backend validates Cloudinary credentials:

```typescript
if (!ENV.CLOUDINARY_CLOUD_NAME || !ENV.CLOUDINARY_API_KEY || !ENV.CLOUDINARY_API_SECRET) {
  console.error("❌ ERROR: Cloudinary credentials are missing!");
}
```

**This is a warning, not a hard failure.** The server will start without Cloudinary, but file uploads will fail. Upload routes will return errors to the client.

---

## 5. Frontend Specifics

### Lazy Loading — Admin Pages Only

Public pages (Home, Events, About, etc.) are **eagerly loaded** in the initial bundle. Admin pages (Dashboard, AdminEvents, etc.) are **lazy-loaded** via `React.lazy()`.

```jsx
// Eager (public — loaded with initial bundle)
import Events from "./Pages/Events";

// Lazy (admin — loaded on demand)
const Dashboard = lazy(() => import("./Pages/Admin/Dashboard"));
```

**If you add a new public page,** import it eagerly. If you add a new admin page, lazy-load it.

### PWA Service Worker — Push Only

The service worker (`public/sw.js`) only handles:
- `push` events (display notifications)
- `notificationclick` events (open URL on tap)

It does **not** implement:
- Cache-first or network-first strategies
- Offline page fallback
- Precaching of assets

This means the PWA is installable but **does not work offline**. If you add offline support, the service worker needs significant updates.

### Auth Context — Permission Helper Logic

```javascript
const hasPermission = (permission) => {
  if (!user) return false;
  if (userRole === "admin" || userRole === "superadmin") return true;
  if (userRole === "eb" && user.executiveDetails?.position === "tech-lead") return true;
  if (user.permissions?.includes(permission)) return true;
  return false;
};
```

This mirrors the backend's permission logic. **Keep it in sync** when backend permissions change.

### Env Variable — VITE Prefix Required

Frontend env variables must be prefixed with `VITE_`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Variables without the `VITE_` prefix are **not** available in the frontend code. This is a Vite requirement for security (prevents accidental exposure of server-side env vars).

### Debounced Search Input

The `DebouncedSearchInput` component (`Components/UI/DebouncedSearchInput.jsx`) wraps the search input with a configurable debounce delay. It uses the `useDebounce` hook internally.

**Use this component** for any admin search input. It prevents excessive API calls while the user is still typing.

---

## 6. WebAuthn / Passkeys

### In-Memory Challenge Store

Challenges are stored in-memory using a `Map`:

```typescript
const challengeStore = new Map<string, { challenge: string; userId?: string; expiresAt: number }>();
```

**Implications:**
- Challenges are **lost on server restart** — users must re-initiate biometric login
- Challenges are **not shared across server instances** — won't work with horizontal scaling
- Maximum capacity: fine for ~1K concurrent users, beyond that needs Redis
- Auto-cleanup every 5 minutes removes expired challenges

### RP ID Change Invalidates All Passkeys

```typescript
WEBAUTHN_RP_ID=codeforchangenepal.com
```

**Changing `WEBAUTHN_RP_ID` after users have registered passkeys will invalidate ALL of them.** Users would need to re-register their devices. Choose your final domain before heavy rollout.

### HTTPS Requirement

WebAuthn requires HTTPS in production. The browser will refuse to create or use passkeys on non-HTTPS origins.

**Exception:** `localhost` is treated as a secure context by browsers, so WebAuthn works in development without HTTPS.

### Origin Matching

The WebAuthn service validates the origin of authentication responses against a whitelist:

```typescript
["https://codeforchangenepal.com", "http://localhost:5173", "http://127.0.0.1:5173", "https://codeforchange.sajilodigital.com.np"]
```

**If deploying to a new URL, add it to this list.** Missing origins will cause "Registration verification failed" errors.

---

## 7. Push Notifications

### VAPID Keys Required

Without VAPID keys, the backend starts but push notifications won't work:

```typescript
console.warn("⚠️ VAPID keys are missing... Push notifications will not work.");
```

The `generate-vapid.cjs` script creates them:
```bash
node generate-vapid.cjs
```

### Invalid Subscription Auto-Removal

When a push subscription fails with HTTP status 410 (Gone) or 404 (Not Found), the backend **automatically removes it** from the user's subscriptions:

```typescript
if (error.statusCode === 410 || error.statusCode === 404) {
  await UserTable.updateOne(
    { _id: userId },
    { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
  );
}
```

This is important — expired subscriptions are silently cleaned up without any user-facing errors.

### No In-App Notification Persistence

Push notifications are **not stored in a database**. They are sent via the Web Push API and displayed by the browser. If the user is offline when a notification is sent, they **will not** receive it later (unless the browser's push service retries).

---

## 8. Deployment

### Vercel Serverless — Cold Starts

The `api/index.ts` entry point caches the MongoDB connection:

```typescript
let isConnected = false;
```

But on a true cold start (new serverless instance), the first request will wait for:
1. Module loading (Express app initialization)
2. MongoDB connection (~500ms-2s)
3. Route matching and handler execution

This means the first request after idle can take **2-5 seconds**. Subsequent requests to the same instance are fast (~50-200ms).

**Mitigations:**
- Vercel Pro: Reserve a minimum of 1 instance (always warm)
- Cron job: Set up a monitor that hits the health endpoint every 5 minutes
- Acceptable for low-traffic sites (CFC's use case)

### Backend on Separate Host — CORS Issues

If deploying the backend on a different host (Render, DigitalOcean) than the frontend (Vercel), the HttpOnly cookie with `SameSite=None` may not work in all browsers.

**Current setup allows this** via the Bearer token fallback. But it's a security tradeoff (see #1 above).

### WebSocket + Socket.IO — Not Serverless Compatible

Socket.IO is listed in `package.json` dependencies but **is not currently used** in any route or middleware. If you implement real-time features:

**Socket.IO does NOT work in Vercel serverless.** You would need:
- A separate WebSocket server (e.g., on Render with sticky sessions)
- Or use a WebSocket-compatible provider (Pusher, Ably, Socket.IO adapter with Redis)

---

## 9. Payment Integration

### eSewa — No Test Mode on Production Gateway

The eSewa integration uses separate URLs for sandbox and production:

```env
# Sandbox (development)
ESEWA_GATEWAY_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_VERIFICATION_URL=https://uat.esewa.com.np/api/epay/main/v2/verify

# Production
ESEWA_GATEWAY_URL=https://esewa.com.np/api/epay/main/v2/form
ESEWA_VERIFICATION_URL=https://esewa.com.np/api/epay/main/v2/verify
```

**Donation flow is one-way:**
1. Frontend initiates → backend creates pending donation
2. User completes payment on eSewa
3. eSewa redirects back to success/failure page
4. Frontend calls verification endpoint
5. Backend verifies with eSewa API

There is **no webhook** for eSewa callbacks. If the user closes the browser before the redirect, the donation stays "Pending" forever. There's no timeout or auto-cancellation for pending donations.

---

## 10. Admin & RBAC

### Permission Bypass for Admin/SuperAdmin

```typescript
if (userRole === "admin" || userRole === "superadmin") {
  return next();  // Bypass all permission checks
}
```

Admin and super admin roles **skip all permission checks**. The check is performance-critical — it avoids a database query just to verify permissions.

### EB Tech-Lead Gets Admin-Level Access

```typescript
if (userRole === "eb") {
  const user = await UserTable.findById(req.user.id);
  if (user?.executiveDetails?.position === "tech-lead") {
    return next();  // Tech-lead gets admin-level bypass
  }
}
```

The **tech-lead** EB position has the same access as admin/superadmin. Other EB positions go through normal permission checks.

### Global Search — 3 Collections Only

The admin global search (`/api/admin/search?q=query`) searches only:
1. **Users** — by name, email, membershipId
2. **Events** — by title, slug, location
3. **Blogs** — by title, slug

**It does not search** impacts, internships, certificates, or any other module.

### "Online Users" is Best-Effort

```typescript
// Users active in the last 5 minutes
{ lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }
```

"Online" status is based on the `lastActive` timestamp, which is updated in the auth middleware (background, throttled to once per minute). This means:
- Users are shown as "online" for up to 5 minutes after their last request
- This is not real-time (no WebSocket)
- The throttle at 1 minute means a user could be active but `lastActive` is up to 60 seconds stale

### Admin Activity Log

All admin actions (create, update, delete users/events/blogs) are logged in the `logs` collection:

```typescript
await adminService.logActivity({
  userId,
  userName,
  action: "CREATE",  // CREATE, UPDATE, DELETE, LOGIN
  resource: "USER",   // USER, EVENT, BLOG, etc.
  details: `Created user: ${user.name}`,
});
```

The log is write-only (appended on action, never modified) and has a `{ createdAt: -1 }` index for efficient recent-first queries.

### Content Type Query

`GET /api/admin/content?type=events` maps to a switch statement:

```typescript
case "events": return await Event.find().sort({ createdAt: -1 });
case "blogs": return await Blog.find().sort({ createdAt: -1 });
case "team": return await User.find({ role: { $ne: 'guest' } });
case "resources": return [];  // ⚠️ Returns empty array!
case "users": return await User.find().select("-password -otp ...");
```

**Note:** `resources` type **always returns an empty array**. This might be a bug or a placeholder. The resources module has its own endpoints under `/api/resources`.
