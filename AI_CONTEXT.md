# AI Context — Code for Change Nepal

> **Purpose:** This file is for AI coding assistants (Claude, Copilot, etc.) to understand the project before writing code. Read this first.

---

## Project Identity

```
Name:     Code for Change (CFC) Official Website
URL:      https://codeforchangenepal.com
What:     Non-profit platform for IT students in Nepal — events, resources, community
Built by: Arun Neupane / Sajilo Digital (https://sajilodigital.com.np)
Arch:     Monorepo with /frontend-cfc + /backend-cfc
```

## Quick Tech Stack

### Frontend (`frontend-cfc/`)
- **React 19** + **Vite 7** + **Tailwind CSS 4** (via `@tailwindcss/vite` plugin)
- **React Router v7** — routes defined in `src/App.jsx`
- **Framer Motion** 12.38 — animations
- **Axios** 1.13 — HTTP client (shared instance in `src/Services/api.jsx`)
- **Recharts** 3.8 — admin dashboard charts
- **Jodit React** 5.3 — rich text editor
- **jsPDF** 4.2 — certificate/resume PDF export
- **@simplewebauthn/browser** 13.3 — passkey authentication
- **react-hot-toast** — toast notifications
- **react-helmet-async** — SEO meta tags
- **State:** React Context (AuthContext only), no Redux/Zustand

### Backend (`backend-cfc/`)
- **Express 5** + **TypeScript 5.9** (compiled via `tsc`, run via `tsx` in dev)
- **MongoDB** + **Mongoose 9** — database
- **Zod 4** — request validation
- **JWT** (`jsonwebtoken`) — auth tokens
- **WebAuthn** (`@simplewebauthn/server` 13.3) — biometric login
- **Cloudinary** (`cloudinary` + `multer` + `streamifier`) — file uploads
- **Nodemailer** — email (Gmail SMTP)
- **web-push** — push notifications
- **express-rate-limit** — rate limiting (9 limiters)
- **helmet**, **hpp**, **express-mongo-sanitize** — security
- **Socket.IO** — in dependencies but NOT used
- **Redis** (`ioredis`) — optional, has mock fallback

### Infrastructure
- **Hosting:** Vercel (both frontend SPA + backend serverless)
- **Database:** MongoDB Atlas
- **Media:** Cloudinary
- **Email:** Gmail SMTP (App Password)
- **Payment:** eSewa gateway

---

## Critical Conventions (AI MUST FOLLOW)

### 1. Import Extensions — ALWAYS use `.js`
```typescript
// ✅ CORRECT
import { ENV } from "../../shared/configs/env.js";
import { UserTable } from "../user/user.model.js";

// ❌ WRONG — will break at runtime (Node ESM requires extensions)
import { ENV } from "../../shared/configs/env";
```
TypeScript compiles to JS. Node ESM needs explicit `.js` extensions. TypeScript resolves `.js` → `.ts` during compilation. Never write extensionless imports.

### 2. Module Pattern — 6 files per feature
```
modules/{feature}/
├── {feature}.interface.ts    — Types + interfaces + enums
├── {feature}.model.ts        — Mongoose schema + model + hooks
├── {feature}.validation.ts   — Zod schemas
├── {feature}.service.ts      — Business logic (class or fns)
├── {feature}.controller.ts   — asyncHandler-wrapped req handlers
└── {feature}.route.ts        — Router + middleware chain
```

### 3. Error Handling — use asyncHandler
```typescript
// ✅ CORRECT
export const getItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await service.findById(req.params.id);
  if (!item) throw new AppError("Not found", 404);
  successResponse(res, item);
});

// ❌ WRONG — no try-catch in controllers
export const getItem = async (req, res) => {
  try { ... } catch (e) { res.status(500).json(...) }
};
```

### 4. Response Format — use helpers
```typescript
import { successResponse } from "../../shared/utils/response.js";

// Success
successResponse(res, data, "Message", 200);
// → { success: true, message: "Message", data: {...}, timestamp: "..." }

// Errors
throw new AppError("Description", 400);
// Caught by global error handler → { success: false, message: "Description" }
```

### 5. Auth Middleware — authenticate + requireAnyPermission
```typescript
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";

// Public
router.get("/items", controller.getAll);

// Protected + permission-checked
router.post("/items", authenticate, requireAnyPermission(PERMISSIONS.ITEM_CREATE), controller.create);
```

### 6. Route Registration — must add to app.ts
```typescript
// In app.ts — after creating the route file
import itemRoutes from "./modules/items/item.route.js";
app.use("/api", itemRoutes);
```

### 7. File Uploads — Multer memoryStorage → Cloudinary
```typescript
// Controller receives req.file.buffer, uploads to Cloudinary
import { uploadToCloudinary, CLOUDINARY_FOLDERS } from "../../shared/utils/cloudinary.js";

const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.ITEMS);
// result.secure_url → save to document
```

### 8. Tailwind — v4 (no PostCSS config, uses Vite plugin)
```js
// vite.config.js — this is the setup
plugins: [react(), tailwindcss()]  // @tailwindcss/vite
```
All Tailwind directives in `src/index.css`. No separate PostCSS file. Use Tailwind classes directly in JSX.

### 9. Permission Naming — resource:action pattern
```typescript
// In shared/configs/permissions.ts
ITEM_CREATE: "item:create",
ITEM_UPDATE: "item:update",
ITEM_VIEW:   "item:view",
ITEM_DELETE: "item:delete",
```

---

## Directory Structure (Key Paths)

```
backend-cfc/src/
├── app.ts                              # Express setup + middleware + route mounting
├── server.ts                           # Bootstrap (DB connect + listen)
├── loaders/database.ts                 # MongoDB connect
├── shared/
│   ├── configs/env.ts                  # Zod-validated env vars (ALL env vars defined here)
│   ├── configs/permissions.ts          # Roles, EB positions, ALL permission definitions
│   ├── configs/cloudinary.ts           # Cloudinary init
│   ├── configs/redis.ts                # Redis client (optional, mock fallback)
│   ├── middlewares/auth.middleware.ts   # JWT verify (cookie + Bearer)
│   ├── middlewares/role.middleware.ts   # Permission check
│   ├── middlewares/validate.middleware.ts # Zod validation
│   ├── middlewares/multer.ts           # 5MB, memoryStorage, JPEG/PNG/WEBP/PDF/DOC
│   └── utils/                          # appError, asyncHandler, jwt, hash, mailer, otp, response, cloudinary, dns
└── modules/                            # 21 feature modules

frontend-cfc/src/
├── main.jsx                            # Entry: Router + AuthProvider + HelmetProvider
├── App.jsx                             # ALL route definitions (3 layouts)
├── Services/api.jsx                    # Axios instance (withCredentials: true)
├── Context/AuthContext.jsx             # Auth state + login/logout/passkey/permissions
├── Layout/                             # MainLayout, AdminLayout, AuthLayout
├── Pages/                              # All page components
├── Components/Common/                  # Header, Footer, PrivateRoute, SEO
├── Components/UI/                      # Reusable UI components (ContextMenu, etc.)
├── Hooks/                              # Custom hooks
└── utils/                              # pushNotification, imageCompressor, consoleGreeting
```

---

## Route Architecture (App.jsx)

```jsx
<Routes>
  {/* PUBLIC — MainLayout */}
  <Route element={<MainLayout />}>
    / → Home, /about → About, /events → Events, /events/:slug → EventDetails,
    /creative → Blog, /creative/:slug → BlogDetail,
    /creative/walkthrough → WalkthroughList, /walkthrough/:slug → WalkthroughDetail,
    /creative/periodicals → Periodicals,
    /our-impact → OurImpact, /our-impact/:id → ImpactDetail,
    /provinces → Provinces, /provinces/:provinceName → ProvinceDetails,
    /certificate-verification/:token → CertificateVerification,
    /internships → Internships, /internship-application → InternshipApplication,
    /donate-us → DonateUs, /donation-success, /donation-failure,
    /gallery → Gallery, /resources → Resources,
    /contact-us → Contact, /faq → FAQ, /register → Register, /join-us → JoinUs,
    * → NotFound
  </Route>

  {/* AUTHENTICATED USER — PrivateRoute + MainLayout */}
  <Route element={<PrivateRoute />}>
    /profile → UserProfile,
    /resume-builder → ResumeDashboard, /resume-builder/:resumeId → ResumeBuilder
  </Route>

  {/* AUTH PAGES — AuthLayout (centered card) */}
  <Route element={<AuthLayout />}>
    /login → Login, /forget-password → ForgetPassword,
    /verify-otp → OTPVerify, /reset-password → ResetPassword
  </Route>

  {/* ADMIN — PrivateRoute adminOnly + AdminLayout */}
  <Route element={<PrivateRoute adminOnly={true} />}>
    /admin → Dashboard, /admin/event → AdminEvents, /admin/event/:id → AdminEventDetail,
    /admin/blog → AdminBlogs, /admin/blog/:id → AdminBlogDetail,
    /admin/walkthroughs, /admin/periodicals, /admin/gallery,
    /admin/donation, /admin/impacts,
    /admin/user → AdminUsers, /admin/user/:id → UserDetail,
    /admin/member, /admin/certificate, /admin/internships, /admin/internship,
    /admin/profile, /admin/resource, /admin/testimonials,
    /admin/supporters, /admin/newsletter, /admin/contacts,
    /admin/national-team, /admin/resumes, /admin/push-notifications,
    /admin/sajilo-digital
  </Route>
</Routes>
```

### Lazy Loading Rule
- **Public pages:** Eagerly imported (normal import)
- **Admin pages:** Lazy loaded via `React.lazy(() => import("./Pages/Admin/..."))`
- **Resume builder:** Also lazy loaded

---

## All API Endpoints

### Auth — `/api/auth`
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/register` | Public | multipart (profileImage), rate: 3/hr |
| POST | `/login` | Public | rate: 5/15min |
| POST | `/logout` | Public | clears cookie |
| GET | `/me` | Required | current user |
| PATCH | `/profile` | Required | update own profile |
| POST | `/forget-password` | Public | rate: 5/hr, 60s cooldown per email |
| POST | `/verify-otp` | Public | 5 attempt limit, returns resetToken |
| POST | `/resend-otp` | Public | same logic as forget-password |
| POST | `/reset-password` | Public | needs resetToken from verify-otp |

### WebAuthn — `/api/auth/webauthn`
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/register-options` | Required | get challenge |
| POST | `/register-verify` | Required | save credential |
| POST | `/login-options` | Public | rate: 10/15min |
| POST | `/login-verify` | Public | rate: 10/15min, same JWT as password |
| GET | `/credentials` | Required | list devices |
| DELETE | `/credentials/:id` | Required | remove device |

### Admin Dashboard — `/api/admin`
| GET | `/admin/dashboard` | MEMBER_VIEW | stats, trends, analytics |
| GET | `/admin/search?q=` | MEMBER_VIEW | users + events + blogs |
| GET | `/admin/content?type=` | MEMBER_VIEW | events/blogs/users/team/impacts/contacts |
| GET | `/admin/activities` | MEMBER_VIEW | paginated activity log |
| GET/POST/PATCH/DELETE | `/admin/users/:id` | MEMBER_* | user CRUD |
| GET | `/admin/events/:id` | EVENT_VIEW | event detail |
| GET | `/admin/blogs/:id` | BLOG_VIEW | blog detail |

### Content Modules — `/api`
| Module | Endpoints | Public | Auth Required |
|--------|-----------|--------|---------------|
| Events | `GET /events`, `GET /events/slug/:slug`, `GET /events/:id`, `POST/PUT/DELETE /events/:id` | GET | POST/PUT/DELETE |
| Blogs | `GET /blogs`, `GET /blogs/slug/:slug`, `GET /blogs/:id`, `POST/PUT/DELETE /blogs/:id` | GET | POST/PUT/DELETE |
| Impact | `GET /impacts`, `GET /impacts/:id`, `POST/PUT/DELETE /impacts/:id` | GET | POST/PUT/DELETE |
| Gallery | `GET /gallery`, `GET /gallery/:id`, `POST/PUT/DELETE /gallery/:id` | GET | POST/PUT/DELETE |
| Resources | `GET /resources`, `GET /resources/:id`, `POST/PUT/DELETE /resources/:id` | Optional auth | POST/PUT/DELETE |

### Certificates — `/api/certificates`
| GET | `/verify/:token` | Public | QR verification |
| POST | `/issue` | CERTIFICATE_ISSUE | single |
| POST | `/bulk-issue` | CERTIFICATE_ISSUE | array |
| GET | `/ledger` | CERTIFICATE_VIEW | list all |
| PATCH | `/:id/status` | CERTIFICATE_UPDATE | Valid/Expired/Revoked |
| DELETE | `/:id` | CERTIFICATE_DELETE | |

### Donations — `/api`
| POST | `/donations` | Public | rate: 5/15min |
| GET | `/admin/donations` | REPORT_VIEW | |
| POST | `/donations/initiate-esewa` | Public | eSewa payment |
| GET | `/donations/verify-esewa` | Public | verify payment |

### Internships — `/api`
| GET | `/internships`, `/internships/:id` | Public | |
| POST/PUT/DELETE | `/internships/:id` | INTERNSHIP_* | |
| POST | `/internships/applications` | Public | rate: 3/15min, resume upload |
| GET | `/internships/applications` | INTERNSHIP_VIEW | |
| PATCH/DELETE | `/internships/applications/:id` | INTERNSHIP_* | |

### Other Modules — `/api`
| Contact | `POST /contacts` (Public, rate: 3/hr), `GET/PATCH/DELETE` (CONTACT_*) |
| Newsletter | `POST /subscribe` (Public, rate: 2/hr), CRUD (NEWSLETTER_*) |
| Testimonials | `GET /testimonials` (Public), CRUD (TESTIMONIAL_*) |
| Supporters | `GET /supporters` (Public), CRUD (SUPPORTER_*) |
| Team | `GET /api/team`, `GET /api/team/:id` (Public) |
| Periodicals | `GET /periodicals` (Public), CRUD (PERIODICAL_*) |
| Walkthroughs | `GET /walkthroughs` (Public), CRUD (WALKTHROUGH_*) |
| Users | `GET /users/public-users` (Public), CRUD (MEMBER_*) |
| Notifications | All require auth: subscribe, unsubscribe, preferences, admin/send |
| Resumes | All require auth: CRUD + duplicate + admin list/delete |
| Resume | All require auth: CRUD + admin list/delete |
| SEO | `GET /sitemap.xml`, `GET /robots.txt` — root level, not under /api |

---

## RBAC Summary

### 7 Active Roles
```
superadmin > admin > eb > cr = gm = ippl = advisor = alumni > guest
```

### Permission Bypass Rules
- **admin + superadmin:** Skip all permission checks (return next() immediately)
- **EB tech-lead:** Skip all permission checks (treated as admin)
- **All others:** Role permissions + user-specific permissions are merged and checked

### Permission Model
```typescript
// 50+ permissions defined in shared/configs/permissions.ts
// Format: RESOURCE_ACTION = "resource:action"
// Example:
MEMBER_CREATE: "member:create"
EVENT_CREATE: "event:create"
CERTIFICATE_ISSUE: "certificate:issue"
```

---

## Key Gotchas (AI Must Know)

1. **DUAL AUTH:** Both HttpOnly cookie AND Bearer token work. `req.cookies?.jwt || req.headers.authorization?.split(" ")[1]`. This is intentional for cross-origin fallback but creates a security concern.

2. **.js EXTENSIONS:** Every local TypeScript import MUST use `.js` extension (e.g., `import { x } from "./file.js"`). TypeScript resolves this. Removing .js breaks runtime.

3. **NO MIGRATIONS:** Mongoose schema changes apply directly. No migration system. Handle existing documents gracefully when adding fields.

4. **IN-MEMORY CHALLENGE STORE:** WebAuthn challenges live in a Map. Lost on restart. Won't scale horizontally. Fine for ~1K concurrent users.

5. **REDIS IS OPTIONAL:** Without Redis, a mock client silently no-ops all calls. No errors, no caching.

6. **SUPERADMIN PROTECTION:** `sajhilodigital@gmail.com` is hardcoded as protected. Cannot be deleted or modified via API. Hidden from user listings.

7. **RATE LIMITERS:** 9 distinct limiters. When adding new public endpoints, ALWAYS add rate limiting. The `app.set("trust proxy", 1)` line is essential for accurate IP detection behind Vercel.

8. **CLOUDINARY TIMEOUT:** Uploads have a 120-second timeout. Files >5MB are rejected by Multer. Express JSON body limit is 2MB.

9. **ADMIN LAZY LOADING:** All admin pages use `React.lazy()`. Public pages are eagerly imported.

10. **FRONTEND ENV PREFIX:** All frontend env vars must start with `VITE_` (Vite requirement).

11. **SOCKET.IO IS NOT USED:** Listed in package.json but not wired anywhere. Would not work on Vercel serverless.

12. **NO TESTS:** The project has no automated tests. Manual verification required.

13. **VERCEL COLDS START:** First request after idle takes 2-5s (MongoDB connection + module loading). Subsequent requests are fast.

14. **eSEWA NO WEBHOOK:** Payment verification is redirect-based. Pending donations stay "Pending" forever if user closes browser.

---

## Environment Variables

### Backend (`backend-cfc/.env`)
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173          # CORS origin
MONGO_URI=mongodb+srv://...                  # REQUIRED
JWT_SECRET=...                               # REQUIRED (min 32 chars)
JWT_EXPIRES_IN=1d
OTP_EXPIRY=300
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...                                # Gmail address
SMTP_PASS=...                                # Gmail App Password
CLOUDINARY_CLOUD_NAME=...                    # REQUIRED
CLOUDINARY_API_KEY=...                       # REQUIRED
CLOUDINARY_API_SECRET=...                    # REQUIRED
WEBAUTHN_RP_ID=codeforchangenepal.com        # Production domain
WEBAUTHN_RP_NAME=Code for Change Nepal
VAPID_PUBLIC_KEY=...                         # For push notifications
VAPID_PRIVATE_KEY=...
ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=...
ESEWA_GATEWAY_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_VERIFICATION_URL=https://uat.esewa.com.np/api/epay/main/v2/verify
REDIS_URL=redis://...                        # Optional
ENABLE_REDIS=false
```

### Frontend (`frontend-cfc/.env`)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Module Pattern Template

When creating a new module, follow this exact structure:

### `{feature}.interface.ts`
```typescript
import { Document } from "mongoose";
export interface IFeature extends Document {
  name: string;
  slug?: string;
  isActive: boolean;
}
```

### `{feature}.model.ts`
```typescript
import { Schema, model } from "mongoose";
import { IFeature } from "./feature.interface.js";
const schema = new Schema<IFeature>(
  { name: { type: String, required: true }, isActive: { type: Boolean, default: true } },
  { timestamps: true }
);
export const Feature = model<IFeature>("Feature", schema);
```

### `{feature}.validation.ts`
```typescript
import { z } from "zod";
export const createSchema = z.object({ name: z.string().min(1) });
```

### `{feature}.service.ts`
```typescript
import { Feature } from "./feature.model.js";
export class FeatureService {
  async getAll() { return Feature.find(); }
  async create(data: any) { return Feature.create(data); }
}
```

### `{feature}.controller.ts`
```typescript
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { successResponse } from "../../shared/utils/response.js";
import { FeatureService } from "./feature.service.js";
const service = new FeatureService();
export class FeatureController {
  getAll = asyncHandler(async (req, res) => {
    const items = await service.getAll();
    successResponse(res, items);
  });
}
```

### `{feature}.route.ts`
```typescript
import { Router } from "express";
import { FeatureController } from "./feature.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
const router = Router();
const ctrl = new FeatureController();
router.get("/features", ctrl.getAll);
router.post("/features", authenticate, requireAnyPermission(PERMISSIONS.FEATURE_CREATE), ctrl.create);
export default router;
```

Then in `app.ts`:
```typescript
import featureRoutes from "./modules/features/feature.route.js";
app.use("/api", featureRoutes);
```

And in `permissions.ts`:
```typescript
FEATURE_CREATE: "feature:create",
FEATURE_UPDATE: "feature:update",
FEATURE_VIEW: "feature:view",
FEATURE_DELETE: "feature:delete",
```

---

## Common Patterns

### Paginated Response (when implementing)
```typescript
{ data: [...], total: 100, page: 1, totalPages: 5, hasMore: true }
```

### File Upload Route
```typescript
router.post("/items", authenticate, upload.single("file"), controller.create);
// For multiple files: upload.array("files", 10)
// For mixed: upload.fields([{ name: "image", maxCount: 1 }, { name: "files", maxCount: 10 }])
```

### Rate-Limited Public Route
```typescript
import { rateLimit } from "express-rate-limit";
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: "Too many requests" });
router.post("/items", limiter, controller.create);
```

### Zod Validation (body, params, query)
```typescript
import { validate } from "../../shared/middlewares/validate.middleware.js";
router.post("/items", validate(createSchema), controller.create);
// validate() parses { body, params, query } from the schema
// validateReqBody() parses only req.body
```

### MongoDB Validation on Model
Mongoose `required`, `enum`, `minlength`, `maxlength`, `match` validators are used. Indexes are defined in schema. All timestamps use `{ timestamps: true }`.

---

## Useful Commands

```bash
# Backend
npm run dev           # tsx watch src/server.ts (hot reload)
npm run build         # tsc (compile to dist/)
npm start             # node dist/server.js
npm run seed:admin    # seed superadmin account

# Frontend
npm run dev           # vite (HMR on :5173)
npm run build         # vite build (output: dist/)
npm run preview       # vite preview (serve dist/)
npm run lint          # eslint .
```

---

## Auth Token Flow (for AI understanding)

```
Login:
  1. POST /auth/login → backend validates credentials
  2. Backend generates JWT { id, email, role }
  3. Backend sets cookie: httpOnly, secure(prod), sameSite(strict dev / none prod)
  4. Backend returns JSON: { token, user }
  5. Frontend stores: token in localStorage, user in localStorage
  6. localStorage token is sent as Bearer header (fallback)
  7. Cookie is sent automatically (primary)

Auth Middleware:
  1. Reads req.cookies.jwt (cookie) || req.headers.authorization (Bearer)
  2. Verifies JWT signature + expiry
  3. Decodes payload → req.user = { id, email, role, permissions }
  4. Background: updates user.lastActive (throttled 1/min)
  5. On failure: returns 401 JSON

Permission Middleware:
  1. If admin/superadmin → skip (next())
  2. If eb/tech-lead → skip (next())
  3. Merge role_permissions + user_permissions
  4. Check if any required permission in merged set
  5. If yes → next(); If no → 403 JSON

Logout:
  1. POST /auth/logout → clears jwt cookie
  2. Frontend: clears localStorage token + user
```
