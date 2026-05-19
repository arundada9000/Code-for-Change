# Architecture Documentation — Code for Change Nepal

> **Status:** Living document — reflects the codebase as of May 2026  
> **Stack:** React 19 + Vite + Tailwind CSS 4 (frontend) · Express 5 + TypeScript + MongoDB (backend)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Directory Structure](#directory-structure)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Authentication & Authorization Flow](#authentication--authorization-flow)
6. [Module Pattern](#module-pattern)
7. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
8. [Rate Limiting Strategy](#rate-limiting-strategy)
9. [File Upload Pipeline](#file-upload-pipeline)
10. [Push Notification Architecture](#push-notification-architecture)
11. [Deployment Topology](#deployment-topology)

---

## System Overview

The CFC website is a **full-stack monorepo** with a clear separation of concerns:

```
┌──────────────────────────────────────────────────────┐
│                   DNS / CDN                          │
│            (Vercel Edge Network)                     │
└──────────┬───────────────────────────────┬───────────┘
           │                               │
           ▼                               ▼
┌─────────────────────┐     ┌─────────────────────────┐
│   Frontend (React)  │     │   Backend (Express)      │
│   codeforchangenepal│     │   /api/*                 │
│   .com              │     │   deployed as Vercel     │
│                     │────▶│   Serverless Function     │
│   PWA + SW + Push   │     │                          │
│   Notifications     │     │   ┌─────────────────┐    │
│                     │     │   │  MongoDB Atlas   │    │
│   Deployed: Vercel  │     │   │  (Mongoose ODM)  │    │
└─────────────────────┘     │   └─────────────────┘    │
                            │                          │
                            │   ┌─────────────────┐    │
                            │   │  Cloudinary      │    │
                            │   │  (Media Storage) │    │
                            │   └─────────────────┘    │
                            │                          │
                            │   ┌─────────────────┐    │
                            │   │  Redis (Optional)│    │
                            │   │  (Caching)       │    │
                            │   └─────────────────┘    │
                            │                          │
                            │   ┌─────────────────┐    │
                            │   │  SMTP (Gmail)    │    │
                            │   │  (Email/OTP)     │    │
                            │   └─────────────────┘    │
                            └─────────────────────────┘
```

### Key Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | React | 19.2 | UI rendering |
| Build Tool | Vite | 7.2 | Dev server + bundling |
| CSS Framework | Tailwind CSS | 4.1 | Utility-first styling |
| Animation | Framer Motion | 12.38 | Declarative animations |
| Routing | React Router DOM | 7.13 | Client-side routing |
| HTTP Client | Axios | 1.13 | API communication |
| Charts | Recharts | 3.8 | Admin dashboard charts |
| WYSIWYG Editor | Jodit React | 5.3 | Rich text editing |
| PDF Generation | jsPDF | 4.2 | Certificate/resume export |
| QR Code | React QR Code | 2.18 | Certificate verification |
| Backend Framework | Express | 5.2 | HTTP server |
| Runtime | TypeScript / tsx | 5.9 | Type safety |
| Database ODM | Mongoose | 9.0 | MongoDB object modeling |
| Validation | Zod | 4.2 | Schema validation |
| Authentication | JWT + WebAuthn | — | Auth + biometrics |
| File Upload | Multer + Cloudinary | 2.0 | Image/file hosting |
| Push Notifications | web-push | 3.6 | Web Push API |
| Payment | eSewa API | — | Donation processing |
| Email | Nodemailer | 7.0 | OTP, notifications |

---

## Directory Structure

```
CFC-Official-Website/
│
├── README.md                          # Project overview (this doc)
├── fixing.md                          # Code review findings
├── biometrics-login.md                # WebAuthn documentation
├── docs/                              # All documentation
│   ├── ARCHITECTURE.md                # This file
│   ├── API.md                         # API reference
│   ├── SETUP.md                       # Setup guide
│   ├── DEPLOYMENT.md                  # Deployment guide
│   ├── CONTRIBUTING.md                # Contributor guide
│   └── EDGE_CASES.md                  # Gotchas & edge cases
│
├── frontend-cfc/                      # React application
│   ├── index.html                     # Entry HTML (PWA meta, splash screens)
│   ├── vite.config.js                 # Vite config (React + Tailwind plugins)
│   ├── tailwind.config.js             # Tailwind configuration
│   ├── eslint.config.js               # ESLint flat config
│   ├── vercel.json                    # Vercel deploy config
│   ├── package.json                   # Dependencies & scripts
│   ├── public/
│   │   ├── manifest.json              # PWA manifest (13 icon sizes)
│   │   ├── sw.js                      # Service worker (push notifications)
│   │   ├── sitemap.xml                # Static sitemap
│   │   ├── robots.txt                 # Robots exclusion rules
│   │   ├── og-image.png               # Open Graph image
│   │   ├── logo.png                   # CFC logo
│   │   ├── sajilodigital.png          # Sajilo Digital badge
│   │   └── Resume/                    # Sample resume files
│   └── src/
│       ├── main.jsx                   # App entry (Router + AuthProvider + HelmetProvider)
│       ├── App.jsx                    # Route definitions (all pages)
│       ├── App.css                    # Empty (Tailwind via index.css)
│       ├── index.css                  # Global styles + Tailwind directives
│       ├── Context/
│       │   └── AuthContext.jsx        # Auth state (user, login, logout, passkey, permissions)
│       ├── Services/
│       │   └── api.jsx                # Axios instance (cookie + Bearer fallback)
│       ├── Hooks/
│       │   ├── useScrollToTop.jsx     # Scroll reset on route change
│       │   ├── useFetch.jsx           # Generic data fetching hook
│       │   ├── useDebounce.jsx        # Debounced value hook
│       │   ├── usePWAInstall.js       # PWA install prompt hook
│       │   ├── useProvinceColors.js   # Province chart color mapping
│       │   ├── useResumes.js          # Resume CRUD operations hook
│       │   └── useImageCompressor.js  # Image compression before upload
│       ├── Layout/
│       │   ├── MainLayout.jsx         # Header + Footer + children
│       │   ├── AdminLayout.jsx        # Sidebar + TopBar + content
│       │   └── AuthLayout.jsx         # Centered card layout
│       ├── Pages/                     # Page components
│       │   ├── {Home,About,Events,...}.jsx
│       │   ├── Auth/                  # Login, Register, OTP, ResetPassword
│       │   ├── Admin/                 # 18 admin pages (Dashboard, Events, Blogs, Users, etc.)
│       │   └── ResumeBuilder/         # Resume dashboard, builder, 3 templates
│       ├── Components/
│       │   ├── Common/                # Header, Footer, PrivateRoute, SEO, Animations, DocxViewer
│       │   ├── UI/                    # Card, Banner, EventCard, CustomCursor, Modal, etc.
│       │   ├── PageComponents/        # HeroSection, Testimonials, Supporters, EventFilter, etc.
│       │   └── Dashboard/             # Admin charts (Recharts components)
│       ├── Data/
│       │   ├── navItems.js            # Navigation structure
│       │   ├── teamData.js            # Team member data
│       │   └── resumeData.js          # Resume template/mock data
│       └── utils/
│           ├── pushNotification.js    # Service worker registration
│           └── imageCompressor.js     # Browser-image-compression wrapper
│
└── backend-cfc/                       # Express + TypeScript backend
    ├── package.json                   # Dependencies & scripts
    ├── tsconfig.json                  # TypeScript config (ES2020, ESNext modules)
    ├── vercel.json                    # Vercel serverless route config
    ├── generate-vapid.cjs             # VAPID key generator
    ├── api/
    │   └── index.ts                   # Vercel serverless entry point
    └── src/
        ├── server.ts                  # Standalone server entry (dev/prod)
        ├── app.ts                     # Express app setup (middleware, routes, error handler)
        ├── loaders/
        │   └── database.ts            # MongoDB connection loader
        ├── shared/
        │   ├── configs/
        │   │   ├── env.ts             # Zod-validated environment variables
        │   │   ├── database.ts        # Alternative DB connection (for scripts)
        │   │   ├── cloudinary.ts      # Cloudinary config
        │   │   ├── redis.ts           # Redis client (with mock fallback)
        │   │   └── permissions.ts     # Roles, EB positions, permissions mapping
        │   ├── middlewares/
        │   │   ├── auth.middleware.ts  # JWT verification (cookie + Bearer)
        │   │   ├── role.middleware.ts  # Permission-based authorization
        │   │   ├── validate.middleware.ts # Zod body/params/query validation
        │   │   └── multer.ts          # File upload (memory storage, 5MB limit)
        │   └── utils/
        │       ├── appError.ts        # Operational error class
        │       ├── errorHandler.ts    # Global error handler
        │       ├── asyncHandler.ts    # Async route wrapper
        │       ├── jwt.ts             # Token generation + verification
        │       ├── hash.ts            # bcrypt password hashing
        │       ├── mailer.ts          # Nodemailer transport (Gmail)
        │       ├── otp.ts             # OTP generation + email sending
        │       ├── response.ts        # Standardized JSON responses
        │       ├── sendError.ts       # Error response helper
        │       ├── cloudinary.ts      # Cloudinary upload/delete/extract
        │       ├── dns.ts             # Email domain MX record verification
        │       └── qr.ts              # (empty — QR generation in certificate model)
        └── modules/                   # 21 feature modules
            ├── auth/                  # Login, register, OTP, WebAuthn
            ├── user/                  # User CRUD, permissions, seeding
            ├── admin/                 # Dashboard, stats, activity logs
            ├── events/                # Event CRUD
            ├── blogs/                 # Blog CRUD
            ├── impact/                # Impact stories CRUD
            ├── gallery/               # Gallery CRUD
            ├── certificates/          # Certificate issue, verify, bulk
            ├── donations/             # Donations + eSewa payment
            ├── internships/           # Internship CRUD
            ├── resources/             # Resource CRUD (role-filtered)
            ├── contact/               # Contact form + admin
            ├── newsletter/            # Newsletter subscribe + admin
            ├── testimonials/          # Testimonial CRUD
            ├── supporters/            # Supporter CRUD
            ├── team/                  # Team member CRUD
            ├── periodicals/           # Periodical CRUD
            ├── walkthroughs/          # Walkthrough CRUD
            ├── resume/                # Resume builder CRUD
            ├── notifications/         # Push subscription + admin send
            └── seo/                   # Dynamic sitemap + robots.txt
```

---

## Frontend Architecture

### Route Structure

Routes are defined in `App.jsx` using React Router v7 with three layout groups:

```
<Routes>
  ├── <MainLayout>                     # Public routes
  │   ├── /                            → Home
  │   ├── /about                       → About
  │   ├── /events                      → Events
  │   ├── /events/:slug                → EventDetails
  │   ├── /creative                    → Blog listing
  │   ├── /creative/:slug              → BlogDetail
  │   ├── /creative/walkthrough        → WalkthroughList
  │   ├── /creative/walkthrough/:slug  → WalkthroughDetail
  │   ├── /creative/periodicals        → Periodicals
  │   ├── /our-impact                  → OurImpact
  │   ├── /our-impact/:id              → ImpactDetail
  │   ├── /provinces                   → Provinces
  │   ├── /provinces/:provinceName     → ProvinceDetails
  │   ├── /certificate-verification/:token → CertificateVerification
  │   ├── /internships                 → Internships
  │   ├── /internship-application      → InternshipApplication
  │   ├── /donate-us                   → DonateUs
  │   ├── /donation-success            → DonationSuccess
  │   ├── /donation-failure            → DonationFailure
  │   ├── /gallery                     → Gallery
  │   ├── /resources                   → Resources
  │   ├── /contact-us                  → Contact
  │   ├── /faq                         → FAQ
  │   ├── /register                    → Register
  │   ├── /join-us                     → JoinUs
  │   └── *                            → NotFound
  │
  ├── <PrivateRoute> + <MainLayout>    # Authenticated user routes
  │   ├── /profile                     → UserProfile
  │   ├── /resume-builder              → ResumeDashboard
  │   └── /resume-builder/:resumeId    → ResumeBuilder
  │
  ├── <AuthLayout>                     # Auth pages (centered card)
  │   ├── /login                       → Login
  │   ├── /forget-password             → ForgetPassword
  │   ├── /verify-otp                  → OTPVerify
  │   └── /reset-password              → ResetPassword
  │
  └── <PrivateRoute adminOnly> + <AdminLayout>  # Admin routes (18 pages)
      └── /admin/{...}                 → Dashboard, Events, Blogs, Users, etc.
</Routes>
```

### State Management

The application uses **React Context** for auth state (`AuthContext`) rather than a full state management library. This is appropriate because:

- Auth state is the only globally shared state
- All other data is fetched per-page via custom hooks (`useFetch`, `useResumes`)
- The admin dashboard fetches fresh data on mount (no stale cache concerns)

### Admin Page Lazy Loading

All 18 admin pages and 3 resume builder pages are **lazy-loaded** using `React.lazy()` + `Suspense`:

```jsx
const Dashboard = lazy(() => import("./Pages/Admin/Dashboard"));
```

This ensures the initial bundle only contains public pages, keeping the first-load bundle small. Admin pages are fetched on-demand when the user navigates to `/admin/*`.

### PWA Architecture

- **Manifest:** `public/manifest.json` — 13 icon sizes, theme color `#0076B4`, `display: standalone`
- **Service Worker:** `public/sw.js` — handles `push` events (notification display) and `notificationclick` events (URL navigation)
- **iOS Support:** Splash screens for 8 device sizes (iPhone 16 Pro Max, iPhone SE, iPad Pro 13" etc.)
- **Install Prompt:** `usePWAInstall.js` hook manages the `beforeinstallprompt` event

---

## Backend Architecture

### Request Lifecycle

```
HTTP Request
    │
    ▼
Vercel Serverless (api/index.ts)
    │
    ▼
app.ts Middleware Stack
    ├── 1. helmet()               — Security headers
    ├── 2. cors()                  — CORS with allowed origins
    ├── 3. express.json()          — Body parsing (2MB limit)
    ├── 4. express.urlencoded()    — URL-encoded body parsing
    ├── 5. mongoSanitize()         — NoSQL injection prevention
    ├── 6. xssSanitize()           — Custom XSS stripping (script tags, event handlers)
    ├── 7. cookieParser()          — Cookie parsing
    ├── 8. hpp()                   — HTTP parameter pollution protection
    ├── 9. compression()           — Gzip/brotli compression
    ├── 10. morgan("dev")          — Request logging (dev only)
    ├── 11. Rate Limiters          — Auth, registration, password reset, WebAuthn
    │
    ▼
Module Router (e.g., event.route.ts)
    ├── Optional: authenticate     — JWT verification
    ├── Optional: requirePermission — RBAC check
    ├── Optional: validate         — Zod schema validation
    ├── Optional: upload           — Multer file handling
    │
    ▼
Controller
    │   (thin layer: extracts params, calls service, sends response)
    ▼
Service
    │   (business logic, database operations)
    ▼
Mongoose Model → MongoDB Atlas
```

### Middleware Execution Order (in `app.ts`)

Middlewares are registered in a specific order for security:

1. **CORS** must come before route handlers to handle preflight
2. **Security middlewares** (helmet, mongoSanitize, xssSanitize, hpp) come before body parsing to sanitize input early
3. **Rate limiters** are applied after parsing but before route handlers
4. **Auth middleware** is applied per-route (not globally), allowing public endpoints
5. **Global error handler** is registered LAST — this is critical

### The XSS Sanitizer (Custom Middleware)

```typescript
const xssSanitize = (req, _res, next) => {
  if (req.body) {
    req.body = stripHtml(req.body);
  }
  next();
};
```

This recursive function strips:
- `<script>` blocks (with arbitrary attributes)
- All HTML tags via regex
- `javascript:` protocol strings
- Event handler attributes (`onclick=`, `onerror=`, etc.)

> **Note:** This is a custom implementation. The `xss-clean` package is in `package.json` but is not used in the middleware chain.

---

## Authentication & Authorization Flow

### Password-Based Login

```
User                    Frontend                    Backend                    MongoDB
  │                        │                          │                         │
  │  Enter email+password  │                          │                         │
  │───────────────────────▶│                          │                         │
  │                        │  POST /auth/login         │                         │
  │                        │─────────────────────────▶│                         │
  │                        │                          │  Find user by email      │
  │                        │                          │────────────────────────▶│
  │                        │                          │◀────────────────────────│
  │                        │                          │                         │
  │                        │                          │  Check:                  │
  │                        │                          │  ├── isActive?           │
  │                        │                          │  ├── isVerified?         │
  │                        │                          │  ├── lockUntil?          │
  │                        │                          │  └── password match?     │
  │                        │                          │                         │
  │                        │                          │  Generate JWT            │
  │                        │                          │  Set HttpOnly cookie     │
  │                        │                          │                         │
  │                        │◀─────────────────────────│                         │
  │                        │  Response: { token, user }                         │
  │◀───────────────────────│                          │                         │
  │                        │                          │                         │
  │  localStorage.setItem( │                          │                         │
  │  "token", token)        │                          │                         │
  │  localStorage.setItem( │                          │                         │
  │  "user", userJSON)      │                          │                         │
```

### WebAuthn / Passkey Login

```
User                    Frontend                    Backend                    Browser
  │                        │                          │                         │
  │  Click "Sign in with   │                          │                         │
  │  passkey"              │                          │                         │
  │───────────────────────▶│                          │                         │
  │                        │  POST /webauthn/         │                         │
  │                        │  login-options           │                         │
  │                        │─────────────────────────▶│                         │
  │                        │                          │  Generate challenge     │
  │                        │                          │  Store in memory (60s)  │
  │                        │◀─────────────────────────│                         │
  │                        │                          │                         │
  │                        │  startAuthentication()   │                         │
  │                        │───────────────────────────────────────────────────▶│
  │                        │                          │                         │
  │  Native biometric      │                          │                         │
  │  prompt (Face ID /     │                          │                         │
  │  fingerprint)          │                          │                         │
  │◀────────────────────────────────────────────────────────────────────────────│
  │                        │                          │                         │
  │                        │  POST /webauthn/         │                         │
  │                        │  login-verify            │                         │
  │                        │─────────────────────────▶│                         │
  │                        │                          │  Verify signature with  │
  │                        │                          │  stored public key      │
  │                        │                          │  Same JWT as password   │
  │                        │◀─────────────────────────│                         │
  │◀───────────────────────│                          │                         │
```

### Token Handling Strategy

The system uses a **dual token strategy** due to cross-origin deployment constraints:

1. **HttpOnly Cookie** (`jwt`) — Primary auth mechanism. Secure, XSS-proof. Works when frontend and backend are on the same domain.
2. **Bearer Token** (`localStorage`) — Fallback for cross-origin deployments (e.g., Vercel frontend + separate API host). Vulnerable to XSS.

The auth middleware checks both:
```typescript
const token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];
```

> **⚠️ Security Concern:** See `EDGE_CASES.md` for details on this dual strategy.

### Auth Middleware Behavior

The `authenticate` middleware:
1. Extracts JWT from cookie or Authorization header
2. Verifies token signature + expiry
3. Decodes payload (id, email, role)
4. Attaches decoded user to `req.user`
5. **Background:** Updates `lastActive` timestamp (throttled to once per minute per user)
6. On failure: returns `401` JSON response

---

## Module Pattern

Every backend module follows a consistent 6-file pattern:

```
modules/{feature}/
├── {feature}.interface.ts     — TypeScript interfaces / enums
├── {feature}.model.ts         — Mongoose schema + model
├── {feature}.validation.ts    — Zod validation schemas
├── {feature}.service.ts       — Business logic
├── {feature}.controller.ts    — Request/response handling
└── {feature}.route.ts         — Route definitions (wired in app.ts)
```

Some modules omit files when not needed (e.g., read-only modules may skip validation).

### Example: Events Module

```typescript
// event.interface.ts — defines IEvent, EventType enum, ISpeaker, IContactInfo
// event.model.ts     — Mongoose schema with pre-save slug generation
// event.validation.ts — createEventSchema, updateEventSchema (Zod)
// event.service.ts   — CRUD operations with Cloudinary upload
// event.controller.ts — Thin wrappers calling service methods
// event.route.ts     — 6 routes (GET 3, POST 1, PUT 1, DELETE 1)
```

### Route Registration (in `app.ts`)

```typescript
// All routes are registered centrally:
app.use("/api", eventRoutes);          // GET /api/events
app.use("/api", blogRoutes);           // GET /api/blogs
app.use("/api/auth", authRoutes);      // POST /api/auth/login
app.use("/api/auth/webauthn", webauthnRoutes);  // POST /api/auth/webauthn/...
app.use("/api/users", userRoutes);     // GET /api/users/list-user
app.use("/api/resumes", resumeRoutes);  // GET /api/resumes
app.use("/api/notifications", notificationRoutes); // POST /api/notifications/subscribe
// ... etc.
```

---

## Role-Based Access Control (RBAC)

### Roles

| Role | Slug | Description |
|------|------|-------------|
| Super Admin | `superadmin` | Full system access |
| Admin | `admin` | All permissions |
| Executive Body | `eb` | Management team (12 positions) |
| College Representative | `cr` | College-level leads |
| General Member | `gm` | Regular members |
| IPPL | `ippl` | Internship/project leads |
| Advisor | `advisor` | Advisory board |
| Alumni | `alumni` | Former members |
| Guest | `guest` | Unregistered users (default) |

### EB Positions

```
tech-lead, project-lead, vice-project-lead, operation-lead,
admin-lead, hr-lead, pr-lead, treasurer, vice-treasurer,
executive-member, secretary, vice-secretary
```

### Permission Model

Permissions are string-based with a `resource:action` convention:

```typescript
PERMISSIONS = {
  MEMBER_CREATE: "member:create",
  MEMBER_UPDATE: "member:update",
  EVENT_CREATE:  "event:create",
  BLOG_CREATE:   "blog:create",
  // ... 50+ permissions total
}
```

### Permission Resolution

```typescript
// For each user, permissions are resolved as:
finalPermissions = rolePermissions ∪ userSpecificPermissions

// Role permissions are predefined in ROLE_PERMISSIONS
// Specific permissions can be added per-user via admin panel
// Admin/SuperAdmin bypass permission checks entirely
// EB tech-lead position also gets admin-level access
```

### Permission Check Flow

```
Request → authenticate → requireAnyPermission(PERMISSION_X) → next()

requireAnyPermission:
  1. Check if user role is admin/superadmin → skip to next()
  2. Check if user is EB tech-lead → skip to next()
  3. Merge role permissions + user-specific permissions
  4. Check if any required permission is in the merged set
  5. If yes → next(); If no → 403
```

---

## Rate Limiting Strategy

The backend applies 7 distinct rate limiters:

| Limiter | Route | Window | Max Requests | Purpose |
|---------|-------|--------|-------------|---------|
| Global | `/api/*` | 1 hour | 1000 | General API abuse |
| Auth | `/auth/login`, `/verify-otp` | 15 min | 5 | Brute force protection |
| WebAuthn | `/webauthn/login-*` | 15 min | 10 | Biometric brute force |
| Registration | `/auth/register` | 1 hour | 3 | Spam registration |
| Password Reset | `/auth/forget-password`, `/resend-otp` | 1 hour | 5 | Reset abuse |
| Contact Form | `/contacts` | 1 hour | 3 | Spam messages |
| Donation | `/donations`, `/donations/initiate-esewa` | 15 min | 5 | Payment abuse |
| Newsletter | `/newsletter/subscribe` | 1 hour | 2 | Subscription spam |
| Internship App | `/internships/applications` | 15 min | 3 | Application spam |

> All limiters use `express-rate-limit` with standard headers and IP-based tracking. Requires `app.set("trust proxy", 1)` for accurate client IP detection behind proxies.

---

## File Upload Pipeline

```
User Upload
    │
    ▼
Multer (memoryStorage)
    │   - 5MB file size limit
    │   - Allowed: JPEG, PNG, WEBP, PDF, DOC/DOCX
    │   - Rejects everything else with clear error
    ▼
Controller
    │   - Receives req.file.buffer
    ▼
Cloudinary Upload
    │   - 120-second timeout
    │   - Resource type: "auto"
    │   - Organized into folders: cfc/{module_name}/
    ▼
Response
    ├── secure_url (HTTPS URL)
    ├── public_id (for deletion)
    └── folder path
```

### Cloudinary Folder Structure

All uploads are organized under `cfc/{module}/`:

```
cfc/
├── events/
├── profiles/
├── blogs/
├── team/
├── impact/
├── resources/
├── certificates/
├── gallery/
├── internships/
├── testimonials/
├── supporters/
├── periodicals/
└── walkthroughs/
```

---

## Push Notification Architecture

```
Admin Panel (Frontend)                    User Device
    │                                        │
    │  "Send Notification"                    │
    │  (target: all users / role / province)  │
    │────────────────────▶                    │
    │                     │                    │
    │                     │                    │
    │              POST /api/notifications/admin/send
    │                     │                    │
    │                     ▼                    │
    │            Backend Notification Service   │
    │                     │                    │
    │              Query users matching filter  │
    │              (pushSubscriptions not empty)│
    │                     │                    │
    │              For each user:              │
    │              webpush.sendNotification()  │
    │                     │                    │
    │                     │                    │
    │                     │         Push Service (Browser)
    │                     │◀───────────────────│
    │                     │                    │
    │                     │    Service Worker  │
    │                     │    (sw.js)         │
    │                     │    "push" event    │
    │                     │    showNotification │
    │                     │                    │
    │                     │    User taps       │
    │                     │    "notificationclick"  │
    │                     │    → openWindow(url)    │
    │                     │                    │
```

### Subscription Lifecycle

```
1. User logs in
2. Frontend subscribes via Push API (navigator.serviceWorker)
3. POST /api/notifications/subscribe → saves to user.pushSubscriptions
4. Server sends welcome notification
5. On invalid subscription (410 Gone): server auto-removes from DB
6. User can manage preferences via POST /api/notifications/preferences
```

---

## Deployment Topology

### Production (Vercel)

```
┌─ User ─────────────────────────────────────────────────┐
│  https://codeforchangenepal.com                         │
│  https://codeforchange.sajilodigital.com.np             │
└────────────────────────┬────────────────────────────────┘
                         │
                    DNS (Vercel)
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
   Frontend (Static)          Backend (Serverless)
   Vercel SPA                     ┌──────────────────┐
   ┌─────────────┐                │ api/index.ts     │
   │ dist/       │                │                  │
   │ index.html  │──── /api/* ───▶│ app.ts           │
   │ assets/*    │                │ MongoDB Atlas    │
   │ sw.js       │                │ Cloudinary       │
   └─────────────┘                │ SMTP (Gmail)     │
                                  └──────────────────┘
```

### Development (Local)

```
http://localhost:5173  ──── /api/* ────▶  http://localhost:5000
(Frontend dev server)                    (Backend dev server)
                                         MongoDB Atlas (remote)
                                         Cloudinary (remote)
```

---

## Data Models (Summary)

The application uses **MongoDB** with 13+ collections:

| Collection | Module | Key Fields |
|-----------|--------|-----------|
| `users` | Auth/User | name, email, role, password, permissions, webauthnCredentials, pushSubscriptions |
| `events` | Events | title, description, date, location, type, speakers, status |
| `blogs` | Blogs | title, content, author, category, slug, isFeatured, seo |
| `impacts` | Impact | title, description, category, metrics, image |
| `certificates` | Certificates | certificateId, tokenHash, qrCode, recipientName, status |
| `donations` | Donations | donorName, amount, paymentMethod, transactionId, status |
| `internships` | Internships | title, companyName, category, description, status |
| `applications` | Internships | applicantName, email, internshipId, resume, status |
| `contacts` | Contact | name, email, subject, message, isRead |
| `newsletters` | Newsletter | email, isSubscribed, subscribedAt |
| `gallery` | Gallery | title, imageUrl, category, province |
| `testimonials` | Testimonials | name, role, content, rating, isActive |
| `supporters` | Supporters | name, logo, website, tier, isActive |
| `team` | Team | name, role, position, image, description |
| `periodicals` | Periodicals | title, slug, category, files, publishedAt |
| `walkthroughs` | Walkthroughs | title, slug, category, image, files |
| `resources` | Resources | title, description, fileUrl, category, allowedRoles |
| `resumes` | Resumes | userId, title, templateId, personalInfo, sections |
| `logs` | Admin | userId, action, resource, details, createdAt |
| `tasks` | Admin | title, description, status, priority |
| `Counter` | Certificates | (auto-increment counter for cert IDs) |

---

## Error Handling Strategy

### Backend

1. **Operational Errors** (`AppError`): Expected errors (validation failure, not found, auth failure). Caught by `asyncHandler` and forwarded to global error handler.
2. **Programmer Errors**: Unexpected bugs (null reference, type errors). Also caught by global handler, returned as 500.
3. **Global Error Handler**: Logs error details (message, stack, timestamp) and returns standardized JSON response.

### Frontend

1. **API Interceptor**: Axios response interceptor catches 401 responses and auto-clears auth state
2. **Toast Notifications**: `react-hot-toast` for user-facing success/error messages
3. **Error Boundaries**: (Not implemented — consider adding for admin pages)

---

## Key Design Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **MongoDB over SQL** | Flexible schema for user profiles, nested documents (education, membership) | No joins, denormalized data |
| **Monorepo** | Single repo for both frontend and backend simplifies CI/CD | Larger clone, independent deploy cycles |
| **Vercel Serverless** | Zero DevOps, auto-scaling, CDN | Cold starts, 10s function timeout |
| **In-memory challenge store** | Simple, zero dependencies for WebAuthn | Lost on restart, max ~1K concurrent users |
| **Custom XSS sanitizer** | Avoids npm dependency for simple use case | Less robust than DOMPurify |
| **HttpOnly cookie + Bearer token** | Works in both same-origin and cross-origin setups | Dual attack surface |
| **Memory storage + Cloudinary** | No local file management, CDN delivery | Requires internet for uploads |
