# Biometric Login (WebAuthn / Passkeys)

> **Status:** Implemented  
> **Added:** May 2026  
> **Standard:** [Web Authentication API (WebAuthn) Level 2](https://www.w3.org/TR/webauthn-2/)  
> **Library:** `@simplewebauthn/server` v13 (backend) + `@simplewebauthn/browser` (frontend)

---

## What It Does

Allows users to sign in using their device's built-in biometric hardware - fingerprint, Face ID, Windows Hello, or device PIN - as an **alternative** to email + password. The existing password login remains unchanged and always available as a fallback.

## How It Works (Under the Hood)

WebAuthn uses **public-key cryptography**, not shared secrets. Here's the simplified flow:

### Registration (one-time, per device)

```
1. User logs in normally → goes to Profile → clicks "Add this device"
2. Frontend: POST /api/auth/webauthn/register-options
3. Backend: generates a random challenge, stores it in memory (60s TTL),
   returns registration options (RP info, user info, challenge)
4. Browser: prompts the user for biometrics (OS-level native prompt)
5. Browser: creates a public/private key pair,
   stores private key in device's secure enclave (never leaves the device)
6. Frontend: POST /api/auth/webauthn/register-verify with signed response
7. Backend: verifies the signature, stores the PUBLIC KEY + credential ID
   in the user's `webauthnCredentials` array in MongoDB
```

### Authentication (each login)

```
1. User visits login page → clicks "Sign in with passkey"
2. Frontend: POST /api/auth/webauthn/login-options
3. Backend: generates a random challenge, returns auth options
4. Browser: finds matching passkeys for this domain,
   prompts user for biometrics
5. Browser: signs the challenge with the stored private key
6. Frontend: POST /api/auth/webauthn/login-verify with signed response
7. Backend: looks up user by credential ID,
   verifies signature with stored public key,
   runs same security checks as password login (isActive, isVerified, lockUntil),
   issues the EXACT SAME JWT token + cookie as password login
8. User is logged in → redirected to /admin
```

### Key Security Properties

| Property | Detail |
|----------|--------|
| **Phishing resistant** | Private key is bound to the domain (RP ID). Can't be used on a different site. |
| **No shared secrets** | Unlike passwords, nothing stored on the server can be used to impersonate the user. |
| **Replay protection** | Each authentication uses a unique challenge (60s TTL) + monotonic counter. |
| **Same auth checks** | Account lockout, isActive, isVerified — all enforced before issuing JWT. |
| **Private key isolation** | Never leaves the device's secure hardware (TPM/Secure Enclave). |

---

## Architecture

### Files Added/Modified

#### Backend

| File | Change | Purpose |
|------|--------|---------|
| `modules/auth/webauthn.service.ts` | **NEW** | Core logic: challenge store, registration, authentication, credential CRUD |
| `modules/auth/webauthn.controller.ts` | **NEW** | Express controller wrapping the service |
| `modules/auth/webauthn.route.ts` | **NEW** | Route definitions (6 routes) |
| `modules/user/user.interface.ts` | Modified | Added `WebAuthnCredential` interface + field on `IUser` |
| `modules/user/user.model.ts` | Modified | Added `webauthnCredentials` schema + sparse index |
| `shared/configs/env.ts` | Modified | Added `WEBAUTHN_RP_ID` and `WEBAUTHN_RP_NAME` env vars |
| `app.ts` | Modified | Mounted routes + added rate limiting |

#### Frontend

| File | Change | Purpose |
|------|--------|---------|
| `Components/PageComponents/Profile/BiometricSettings.jsx` | **NEW** | Device management UI (list, add, remove) |
| `Context/AuthContext.jsx` | Modified | Added `loginWithPasskey()` method |
| `Pages/Auth/Login.jsx` | Modified | Added passkey button + WebAuthn support check |
| `Pages/Admin/Profile.jsx` | Modified | Integrated `<BiometricSettings />` component |

### API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/webauthn/register-options` | Required | Generate registration challenge |
| POST | `/api/auth/webauthn/register-verify` | Required | Verify and store credential |
| POST | `/api/auth/webauthn/login-options` | Public | Generate authentication challenge |
| POST | `/api/auth/webauthn/login-verify` | Public | Verify and issue JWT |
| GET | `/api/auth/webauthn/credentials` | Required | List user's registered devices |
| DELETE | `/api/auth/webauthn/credentials/:id` | Required | Remove a device credential |

### Database Schema

The `webauthnCredentials` array on the User document:

```javascript
webauthnCredentials: [{
  credentialId: String,   // base64url-encoded credential ID
  publicKey:    String,   // base64url-encoded public key
  counter:      Number,   // monotonic counter for replay protection
  transports:   [String], // e.g. ["internal", "hybrid"]
  deviceName:   String,   // user-provided friendly name
  createdAt:    Date,
}]
```

Indexed: `{ "webauthnCredentials.credentialId": 1 }` (sparse)

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WEBAUTHN_RP_ID` | No | Derived from `FRONTEND_URL` hostname | The Relying Party ID (must match your domain exactly) |
| `WEBAUTHN_RP_NAME` | No | `"Code for Change Nepal"` | Display name shown in the browser's biometric prompt |

### Setting up for production

```env
# For testing on sajilodigital subdomain:
WEBAUTHN_RP_ID=codeforchange.sajilodigital.com.np

# When you move to the main domain:
WEBAUTHN_RP_ID=codeforchangenepal.com
```

> **⚠️ IMPORTANT:** Changing `WEBAUTHN_RP_ID` invalidates ALL existing passkeys. Users will need to re-register their devices. Plan your final domain before heavy rollout.

---

## Challenge Store

Challenges are stored **in-memory** using a `Map<string, { challenge, userId?, expiresAt }>`.

- **TTL:** 60 seconds
- **Cleanup:** Automatic, every 5 minutes
- **Scale:** Fine for ~1K users. If you scale to thousands of concurrent logins, move to Redis.

When the server restarts, all pending challenges are lost. This is fine — users just retry the biometric prompt.

---

## Browser Compatibility

| Browser | Supports WebAuthn | What User Sees |
|---------|-------------------|----------------|
| Chrome 67+ | ✅ | Fingerprint / Windows Hello / Phone prompt |
| Safari 14+ | ✅ | Touch ID / Face ID |
| Firefox 60+ | ✅ | Windows Hello / Security key |
| Edge 18+ | ✅ | Windows Hello |
| Old browsers | ❌ | Passkey button is hidden (graceful fallback) |

The passkey button is **only shown** when `browserSupportsWebAuthn()` returns `true`. Users with unsupported browsers simply see the normal email/password form.

---

## User Flow

### First-time setup

1. User logs in with email + password
2. Goes to **Profile** page
3. Scrolls to **Biometric Login** section
4. Clicks **"Add this device"**
5. Enters a device name (e.g., "My MacBook")
6. Browser shows native biometric prompt
7. ✅ Device registered — appears in the list

### Subsequent logins

1. User visits login page
2. Clicks **"Sign in with passkey"** button
3. Browser shows native biometric prompt
4. ✅ Logged in — redirected to /admin

### Removing a device

1. Go to **Profile** → **Biometric Login**
2. Hover over the device → click trash icon
3. Confirm removal
4. ✅ Device can no longer be used for biometric login

---

## What Doesn't Change

- ✅ Password login works exactly as before
- ✅ JWT tokens, cookies, and auth middleware are untouched
- ✅ Role-based permissions, account lockout, activity logging — all the same
- ✅ Existing users see zero difference unless they opt in
- ✅ No database migration needed (MongoDB schema is additive)

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Challenge expired" | User took >60s on the biometric prompt | Retry — a new challenge is generated each time |
| "No account found for this credential" | Credential was removed, or registered on a different domain | Re-register the device from Profile |
| Passkey button not showing | Browser doesn't support WebAuthn | Use a modern browser (Chrome, Safari, Edge, Firefox) |
| "Registration verification failed" | Origin mismatch between frontend URL and backend config | Ensure `WEBAUTHN_RP_ID` matches your domain and the origin is in the allowed list |
| Works in dev but not production | HTTPS required for WebAuthn | Ensure your production site is served over HTTPS |
