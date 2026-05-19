# Setup Guide — Code for Change Nepal

> **Prerequisites:** Node.js 18+, npm/pnpm, MongoDB Atlas account, Git

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Variables Reference](#environment-variables-reference)
3. [Frontend Setup Details](#frontend-setup-details)
4. [Backend Setup Details](#backend-setup-details)
5. [Database Setup](#database-setup)
6. [Cloudinary Setup](#cloudinary-setup)
7. [Email Setup](#email-setup)
8. [Push Notification Setup](#push-notification-setup)
9. [Payment (eSewa) Setup](#payment-esewa-setup)
10. [Seeding the Admin Account](#seeding-the-admin-account)
11. [Running the Complete Stack](#running-the-complete-stack)
12. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/CFC-Official-Website.git
cd CFC-Official-Website

# 2. Backend
cd backend-cfc
cp .env.example .env   # edit with your values
npm install
npm run dev            # starts at http://localhost:5000

# 3. Frontend (new terminal)
cd frontend-cfc
cp .env.example .env   # edit with your values
npm install
npm run dev            # starts at http://localhost:5173
```

---

## Environment Variables Reference

### Backend (`backend-cfc/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `PORT` | No | `5000` | Server port |
| `FRONTEND_URL` | No | `http://localhost:5173` | Frontend origin for CORS + WebAuthn |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret key for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `1d` | JWT expiry duration |
| `OTP_EXPIRY` | No | `300` | OTP validity in seconds |
| `REDIS_URL` | No | — | Redis URL (only if `ENABLE_REDIS=true`) |
| `ENABLE_REDIS` | No | `false` | Enable Redis caching |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_USER` | Conditional | — | Gmail address for sending emails |
| `SMTP_PASS` | Conditional | — | Gmail app password |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | **Yes** | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | **Yes** | — | Cloudinary API secret |
| `WEBAUTHN_RP_ID` | No | Derived from `FRONTEND_URL` | WebAuthn relying party ID (domain) |
| `WEBAUTHN_RP_NAME` | No | `Code for Change Nepal` | Display name in biometric prompt |
| `VAPID_PUBLIC_KEY` | Conditional | — | Web Push public key |
| `VAPID_PRIVATE_KEY` | Conditional | — | Web Push private key |
| `ESEWA_PRODUCT_CODE` | No | `EPAYTEST` | eSewa merchant product code |
| `ESEWA_SECRET_KEY` | **Yes** | — | eSewa secret key |
| `ESEWA_GATEWAY_URL` | No | eSewa test URL | eSewa payment form URL |
| `ESEWA_VERIFICATION_URL` | No | eSewa test URL | eSewa verification URL |
| `PAYMENT_GATEWAY_URL` | No | — | Legacy payment gateway |

### Frontend (`frontend-cfc/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:5000/api` | Backend API base URL |

---

## Frontend Setup Details

### 1. Install Dependencies

```bash
cd frontend-cfc
npm install
```

> **Note:** The project uses `npm`. `pnpm` is not configured for the frontend. The `--legacy-peer-deps` flag may be needed if you encounter peer dependency conflicts (especially with `jodit-react`).

### 2. Configure Environment

```bash
cp .env.example .env
# Edit VITE_API_BASE_URL if your backend runs on a different port or URL
```

### 3. Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start dev server with HMR at `:5173` |
| `build` | `vite build` | Production build to `dist/` |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Run ESLint on all files |
| `render-build` | `npm install --legacy-peer-deps && npm run build` | Build command for Render deployment |

### 4. Project Config

```js
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

The app uses Tailwind CSS v4 with the **Vite plugin** (`@tailwindcss/vite`) — there's no separate PostCSS config. All Tailwind directives are in `src/index.css`.

---

## Backend Setup Details

### 1. Install Dependencies

```bash
cd backend-cfc
npm install
```

> The backend uses `npm` for package management. A `pnpm-lock.yaml` exists but is from a previous configuration. Use `npm install`.

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials. See the full reference table above.

### 3. Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `tsx watch src/server.ts` | Dev server with hot reload |
| `dev:tsnode` | `ts-node-dev` | Alternative dev server |
| `build` | `tsc` | TypeScript compilation to `dist/` |
| `start` | `node dist/server.js` | Production start from compiled output |
| `seed:admin` | `tsx src/modules/user/seed-admin.ts` | Seed super admin account |

### 4. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true
  }
}
```

> **Important:** The `app.ts` imports use `.js` extensions (e.g., `import { ENV } from "./shared/configs/env.js"`). This is intentional — TypeScript preserves the `.js` extension in compiled output, and Node.js ESM requires explicit extensions. Do **not** remove the `.js` extensions.

### 5. Vercel Serverless Entry

The `api/index.ts` file is the Vercel serverless function entry point:

```typescript
let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await databaseLoader();
    isConnected = true;  // cache connection across invocations
  }
  return app(req, res);
}
```

The `isConnected` flag prevents reconnecting to MongoDB on every cold start within the same serverless instance.

---

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user with read/write permissions
3. Whitelist all IPs (`0.0.0.0/0`) for development
4. Get your connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/CodeForChange?retryWrites=true&w=majority
   ```
5. Set as `MONGO_URI` in `backend-cfc/.env`

### Option 2: Local MongoDB

```bash
# Install MongoDB locally, then:
MONGO_URI=mongodb://localhost:27017/codeforchange
```

### Connection Details

- The database is named `CodeForChange` (configured in the connection string)
- Mongoose v9 is used with `family: 4` (IPv4 only)
- No migrations framework — schema changes are applied directly via Mongoose
- Indexes are auto-created based on schema definitions

---

## Cloudinary Setup

1. Create a free Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Set them in `backend-cfc/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud
   CLOUDINARY_API_KEY=123456789
   CLOUDINARY_API_SECRET=abcdefghijklmnop
   ```
4. Verify: the backend logs credential presence on startup in development mode

---

## Email Setup

The system uses **Gmail SMTP** via Nodemailer for sending OTPs.

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Copy the 16-character password
5. Set in `.env`:
   ```
   SMTP_USER=yourname@gmail.com
   SMTP_PASS=abcd1234efgh5678
   ```

### Why App Passwords?

Gmail's regular password is blocked by Google's security policies for SMTP access. An App Password bypasses 2FA for this specific application. If your Google account doesn't support app passwords, consider:
- Using a dedicated Gmail account for the application
- Using a transactional email service (SendGrid, Mailgun, etc.)

---

## Push Notification Setup

Push notifications use the **Web Push API** with VAPID keys.

### Generate VAPID Keys

```bash
cd backend-cfc
node generate-vapid.cjs
```

This outputs:
```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

### Configure

Add to `backend-cfc/.env`:
```
VAPID_PUBLIC_KEY=BG...
VAPID_PRIVATE_KEY=...
```

### How It Works

1. **Frontend** subscribes via the Push API when user logs in
2. **Backend** stores subscriptions in `user.pushSubscriptions`
3. **Admin** sends notifications to target audiences (all users, by role, by province)
4. **Service Worker** (`public/sw.js`) receives push events and displays notifications
5. **Expired subscriptions** are auto-removed on send failure (410 Gone)

> Push notifications gracefully degrade if VAPID keys are not configured.

---

## Payment (eSewa) Setup

The donation system integrates with **eSewa** (a Nepali payment gateway).

### Sandbox Credentials

The `.env.example` contains sandbox credentials:
```
ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8g8M89Pgg8UXX80c
```

These work with the eSewa test environment for development.

### Production Setup

1. Register as an eSewa merchant
2. Replace `ESEWA_PRODUCT_CODE` and `ESEWA_SECRET_KEY` with live values
3. Update gateway URLs:
   ```
   ESEWA_GATEWAY_URL=https://esewa.com.np/api/epay/main/v2/form
   ESEWA_VERIFICATION_URL=https://esewa.com.np/api/epay/main/v2/verify
   ```

---

## Seeding the Admin Account

The backend includes a seed script to create the initial super admin:

```bash
cd backend-cfc
npm run seed:admin
```

This script:
1. Connects to your MongoDB (using `MONGO_URI` from `.env`)
2. Checks if `sajhilodigital@gmail.com` already exists
3. If not, creates a super admin user with:
   - Email: `sajhilodigital@gmail.com`
   - Password: (defined in script — currently `admin123` or similar)
   - All permissions granted (super admin role)
4. Logs the result

> **⚠️ Security:** The seed script's default password is defined in the source code. Change it immediately after first login, or modify the script before running.

### Verify Seed

```bash
# Start backend
npm run dev

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sajhilodigital@gmail.com","password":"<seed_password>"}'
```

---

## Running the Complete Stack

### Development Mode

```bash
# Terminal 1: Backend
cd backend-cfc
npm run dev
# => API running at http://localhost:5000

# Terminal 2: Frontend
cd frontend-cfc
npm run dev
# => UI running at http://localhost:5173
```

### Production Build

```bash
# Backend
cd backend-cfc
npm run build     # compiles to dist/
npm start         # runs dist/server.js

# Frontend
cd frontend-cfc
npm run build     # generates dist/ folder
npm run preview   # serves dist/ locally
```

---

## Troubleshooting

### Common Issues

| Issue | Likely Cause | Solution |
|-------|-------------|----------|
| `MongooseError: The `uri` parameter to `openUri()` must be a string` | Missing `MONGO_URI` | Check `.env` file is present and `MONGO_URI` is set |
| `JWT_SECRET is not defined` | Missing env var | Add `JWT_SECRET` to `.env` (at least 32 chars) |
| `ERR_MODULE_NOT_FOUND` for `.js` imports | TypeScript compilation issue | Run `npm run build` first, or use `tsx` for development |
| CORS error in browser | Wrong `FRONTEND_URL` | Ensure `FRONTEND_URL` in backend `.env` matches your frontend origin exactly |
| `Cloudinary upload failed` | Invalid credentials | Verify `CLOUDINARY_*` env vars are correct |
| `Email send failed` | SMTP credentials wrong | Verify Gmail app password is correct, not regular password |
| WebAuthn fails with "origin mismatch" | RP ID or origin mismatch | Ensure `WEBAUTHN_RP_ID` matches the domain exactly. WebAuthn requires HTTPS (except localhost) |
| Push notifications not showing | No VAPID keys | Generate keys with `node generate-vapid.cjs` |
| `react-hot-toast` shows "Network Error" | Backend not running | Start the backend server |
| `npm install` fails with peer dep conflict | `jodit-react` version mismatch | Use `npm install --legacy-peer-deps` |
| Admin login returns 403 | Wrong role/permissions | Use the super admin account (seed-admin) |

### Checking Backend Health

```bash
# Basic health check
curl http://localhost:5000/
# Expected: { "status": "success", "message": "Welcome to Code for Change Nepal Backend API", "version": "1.0.0" }

# Check if server starts properly (console output)
npm run dev
# Expected: 🚀 Code for Change Backend
#           Environment: development
#           Port: 5000
#           URL: http://localhost:5000
```

### Reset Everything

```bash
# Reset backend state
cd backend-cfc
rm -rf dist/          # Remove compiled output
npm run build         # Recompile

# Reset frontend state
cd frontend-cfc
rm -rf dist/          # Remove build output
rm -rf node_modules/.vite  # Clear Vite cache
npm run dev           # Fresh start

# Reset database (CAREFUL — deletes all data)
# Connect to MongoDB Atlas UI or use:
# mongosh "connection_string" --eval "db.dropDatabase()"
# Then re-run: npm run seed:admin
```
