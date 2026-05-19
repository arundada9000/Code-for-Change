# Deployment Guide — Code for Change Nepal

> **Production URLs:**  
> Frontend: `https://codeforchangenepal.com` (or `https://codeforchange.sajilodigital.com.np`)  
> Backend API: `https://code-for-change-backend.onrender.com` (or Vercel serverless)

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Frontend: Vercel Deployment](#frontend-vercel-deployment)
3. [Backend: Vercel Serverless Deployment](#backend-vercel-serverless-deployment)
4. [Backend: Alternative — Render / Node Hosting](#backend-alternative--render--node-hosting)
5. [Production Environment Variables](#production-environment-variables)
6. [Domain Configuration](#domain-configuration)
7. [MongoDB Atlas Production Setup](#mongodb-atlas-production-setup)
8. [Cloudinary Production Setup](#cloudinary-production-setup)
9. [WebAuthn in Production](#webauthn-in-production)
10. [Push Notifications in Production](#push-notifications-in-production)
11. [Deployment Checklist](#deployment-checklist)
12. [Monitoring & Debugging](#monitoring--debugging)

---

## Deployment Overview

The CFC website uses a **split deployment** strategy:

```
┌──────────────────────────────────┐
│         Vercel (Edge)            │
│                                  │
│  codeforchangenepal.com          │
│  ├── Frontend (SPA)              │
│  │   └── dist/ (static files)    │
│  └── Backend (Serverless)        │
│      └── api/index.ts            │
│          → /api/*                │
│                                  │
│  Both on same domain =           │
│  HttpOnly cookies work natively  │
└──────────────────────────────────┘
```

**Both frontend and backend can be deployed to Vercel** as a single project (frontend as static SPA, backend as serverless function). This eliminates cross-origin cookie issues and simplifies CORS.

---

## Frontend: Vercel Deployment

### Prerequisites

1. A Vercel account (hobby tier is free)
2. Git repository connected to Vercel
3. Your custom domain added in Vercel dashboard

### Configuration

The frontend comes with a `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures **SPA routing** — all paths serve `index.html` and let React Router handle client-side navigation.

### Deployment Steps

```bash
# 1. Set up environment variables in Vercel Dashboard
# Go to your project → Settings → Environment Variables
VITE_API_BASE_URL=https://your-domain.com/api

# 2. Deploy
# Option A: Connect Git repo → Vercel auto-deploys on push
# Option B: Manual deploy
npm run build
npx vercel --prod

# 3. Configure build settings in Vercel:
#   Framework Preset: Vite
#   Build Command: npm run build
#   Output Directory: dist
#   Root Directory: frontend-cfc
```

### Vercel Build Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `cd frontend-cfc && npm install && npm run build` |
| **Output Directory** | `frontend-cfc/dist` |
| **Install Command** | `npm install --legacy-peer-deps` |
| **Node.js Version** | 20.x (or latest LTS) |

### Environment Variables in Vercel

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://yourdomain.com/api` |

> **Important:** Set `VITE_API_BASE_URL` to the **same domain** as the frontend if deploying both on Vercel (e.g., `/api`). Use the full URL only if backend is on a separate host.

---

## Backend: Vercel Serverless Deployment

### How It Works

The backend runs as a **Vercel Serverless Function** via `api/index.ts`. Vercel's `vercel.json` routes all requests to this handler:

```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/api/index.ts" }
  ]
}
```

The `api/index.ts` entry point:

```typescript
import app from "../src/app.js";
import databaseLoader from "../src/loaders/database.js";

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await databaseLoader();
    isConnected = true;
  }
  return app(req, res);
}
```

> **Connection Caching:** `isConnected` caches the MongoDB connection across invocations within the same serverless instance. This is critical — without it, every request would open a new database connection, hitting Atlas connection limits.

### Deployment Steps

```bash
# 1. Set up backend environment variables in Vercel Dashboard
# (See full list in production env vars section below)

# 2. Configure Vercel project:
#   Root Directory: backend-cfc
#   Build Command: npm run build
#   Output Directory: .vercel (Vercel default)

# 3. Deploy
npx vercel --prod
```

### Vercel Build Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend-cfc` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.vercel` |
| **Node.js Version** | 20.x |

### Important: API Route Config

Add an `api/index.ts` config export to increase the serverless function limits:

```typescript
export const config = {
  api: {
    bodyParser: false,  // Already handled by Express
    externalResolver: true,  // Express handles the response
  },
};
```

### Known Limitations

| Limitation | Impact | Mitigation |
|-----------|--------|------------|
| **Cold starts** | First request after idle may take 1-3s | Use Vercel Pro (always-on functions) or set a cron job to ping every 5 min |
| **10s timeout** | Serverless functions timeout after 10s (Hobby) or 60s (Pro) | Pro plan recommended for production |
| **No WebSocket** | Socket.IO is in dependencies but won't work in serverless | Use polling or separate WebSocket server |
| **File uploads** | Memory limit for serverless (may affect large uploads) | Keep upload sizes reasonable (<5MB enforced by multer) |

---

## Backend: Alternative — Render / Node Hosting

For **long-running processes** (WebSocket support, no cold starts), use a traditional Node.js host.

### Render.com Deployment

```yaml
# render.yaml (optional)
services:
  - type: web
    name: cfc-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      # ... all other env vars
```

### Manual Server Setup

```bash
git pull
cd backend-cfc
npm install --production
npm run build
npm start
# Uses dist/server.js
```

### Using PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start dist/server.js --name cfc-backend
pm2 save
pm2 startup
```

---

## Production Environment Variables

### Backend (.env)

```env
# ── Core ────────────────────────────────────
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://codeforchangenepal.com

# ── Database ────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/CodeForChange?retryWrites=true&w=majority

# ── JWT ─────────────────────────────────────
JWT_SECRET=<generate-a-strong-random-string-at-least-64-chars>
JWT_EXPIRES_IN=1d

# ── SMTP ────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-org-email@gmail.com
SMTP_PASS=<gmail-app-password>

# ── Cloudinary ──────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# ── WebAuthn ────────────────────────────────
WEBAUTHN_RP_ID=codeforchangenepal.com

# ── Push Notifications ──────────────────────
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...

# ── Payment (eSewa) ─────────────────────────
ESEWA_PRODUCT_CODE=<live-product-code>
ESEWA_SECRET_KEY=<live-secret-key>
ESEWA_GATEWAY_URL=https://esewa.com.np/api/epay/main/v2/form
ESEWA_VERIFICATION_URL=https://esewa.com.np/api/epay/main/v2/verify

# ── Optional ────────────────────────────────
OTP_EXPIRY=300
```

### Frontend (.env)

```env
# When frontend and backend on same domain:
VITE_API_BASE_URL=/api

# When backend on separate domain:
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## Domain Configuration

### Vercel Domain Setup

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your domain: `codeforchangenepal.com`
3. Follow Vercel's DNS instructions (add CNAME record)
4. Vercel automatically provisions SSL certificates (Let's Encrypt)

### CORS Configuration

The backend's CORS allows these origins:

```typescript
origin: [
  "https://codeforchangenepal.com",
  "https://codeforchange.sajilodigital.com.np",
  "https://codeforchangenepal.vercel.app",
  "https://code-for-change-nepal.onrender.com",
  // plus localhost variants for development
]
```

**If deploying to a new domain,** add it to the `origin` array in `backend-cfc/src/app.ts`.

---

## MongoDB Atlas Production Setup

### Configure IP Whitelist

In MongoDB Atlas → **Network Access**:
- Add your deployment's IP address (or Vercel's IP range)
- For Vercel serverless, IPs are dynamic — enable **"Allow access from anywhere"** (`0.0.0.0/0`) or use **Vercel IP range** (recommended: Vercel Pro provides static IPs via NAT gateway)

### Create Production User

```bash
# In MongoDB Atlas → Database Access
# Create a user with readWrite on CodeForChange database
# Use a strong, unique password
```

### Enable Automated Backups

MongoDB Atlas free tier includes continuous backups with point-in-time recovery (last 24 hours).

---

## Cloudinary Production Setup

### Upload Presets

For production, consider creating an **upload preset**:
1. Go to Cloudinary Dashboard → Settings → Upload
2. Create preset with:
   - **Signing mode:** Signed (requires API secret)
   - **Folder:** `cfc`
   - **Auto-tagging:** Optional
   - **Faces/Captioning:** Optional

### Image Optimization

Cloudinary automatically delivers optimized images based on device/viewport. The backend uploads with `resource_type: "auto"` which lets Cloudinary decide the best format.

---

## WebAuthn in Production

### Critical: RP ID and Domain

```
WEBAUTHN_RP_ID=codeforchangenepal.com
```

**This is the single most important WebAuthn setting.** Changing it invalidates ALL existing passkeys. Choose your final domain before users start registering devices.

### HTTPS Requirement

WebAuthn **requires HTTPS** in production (localhost is exempt). Vercel provides automatic SSL, so this is satisfied by default.

### Origin Matching

The WebAuthn service validates that the authentication response comes from an expected origin. The allowed origins list includes:
- `https://codeforchangenepal.com`
- `https://codeforchange.sajilodigital.com.np`
- `https://codeforchangenepal.vercel.app`

If deploying to a new URL, add it to `getExpectedOrigins()` in `webauthn.service.ts`.

---

## Push Notifications in Production

### VAPID Keys

Generate production VAPID keys:
```bash
cd backend-cfc
node generate-vapid.cjs
```

Add to production env:
```
VAPID_PUBLIC_KEY=<generated_public_key>
VAPID_PRIVATE_KEY=<generated_private_key>
```

### Service Worker

The `public/sw.js` is already in the frontend build output. It handles `push` and `notificationclick` events. Ensure it's not blocked by any `Service-Worker-Allowed` header configuration.

### Browser Limitations

| Browser | Push Support | Note |
|---------|-------------|------|
| Chrome | ✅ Full | Requires FCM |
| Firefox | ✅ Full | Uses Mozilla's push service |
| Safari | ✅ | macOS 13+, iOS 16+ |
| Edge | ✅ Full | Chromium-based |

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables are configured in Vercel/Render dashboard
- [ ] `JWT_SECRET` uses a strong random string (not the dev default)
- [ ] `MONGO_URI` points to production cluster (not dev/test)
- [ ] `FRONTEND_URL` matches the actual production domain
- [ ] CORS origin list includes the production domain
- [ ] WebAuthn `WEBAUTHN_RP_ID` is set to the production domain
- [ ] Cloudinary credentials point to production account
- [ ] eSewa credentials are live (not sandbox)
- [ ] VAPID keys are generated and configured
- [ ] Gmail app password is valid (not expired)
- [ ] `dist/` is in `.gitignore` (frontend and backend)
- [ ] Frontend `VITE_API_BASE_URL` is correct for the deployment architecture

### Build Verification

- [ ] `npm run build` succeeds on frontend
- [ ] `npm run build` (tsc) succeeds on backend
- [ ] No TypeScript errors
- [ ] No ESLint warnings

### Post-Deployment

- [ ] Health check: `GET /` returns 200 + welcome message
- [ ] Login flow works end-to-end
- [ ] Cookie is set (check browser DevTools → Application → Cookies)
- [ ] Admin dashboard loads and shows correct stats
- [ ] File upload works (Cloudinary)
- [ ] Email sending works (trigger password reset)
- [ ] Certificate verification works
- [ ] eSewa payment flow works (sandbox test)
- [ ] Sitemap loads: `GET /sitemap.xml`
- [ ] Robots.txt loads: `GET /robots.txt`
- [ ] Push notification subscription works
- [ ] Frontend PWA install prompt works
- [ ] SSL certificate is valid

---

## Monitoring & Debugging

### Vercel Logs

```
Vercel Dashboard → Deployments → [select deployment] → Functions Logs
```

Or via CLI:
```bash
vercel logs <deployment-url>
```

### MongoDB Atlas Monitoring

- **Real-time Performance Tab:** See current operations, slow queries
- **Metrics:** Connections, operations, memory, CPU
- **Slow Query Logging:** Enable in Atlas → Advanced Configuration

### Cloudinary Monitoring

- **Dashboard:** Bandwidth, storage, transformations
- **Media Library:** Browse all uploaded assets
- **Usage Reports:** Monthly usage statistics

### Common Production Issues

| Issue | Check | Solution |
|-------|-------|----------|
| **500 errors on API** | Vercel function logs | Check MongoDB connection, env vars |
| **CORS errors** | Browser console | Verify `FRONTEND_URL` matches exactly |
| **Login returns 401** | Check cookie/token | Verify `JWT_SECRET` is consistent across deployments |
| **Uploads failing** | Network tab | Check Cloudinary credentials, file size <5MB |
| **Emails not sending** | Backend logs | Check SMTP credentials, app password expiry |
| **Cold start slow** | Response time >1s | Upgrade to Vercel Pro or use cron pings |
| **WebAuthn fails** | Browser console | HTTPS required, RP_ID must match domain exactly |
