# API Reference — Code for Change Nepal

> **Base URL (dev):** `http://localhost:5000/api`  
> **Base URL (prod):** `https://codeforchange.sajilodigital.com.np/api`  
> **Content Type:** `application/json` (unless file upload)  
> **Auth:** Bearer token (`Authorization: Bearer <token>`) or HttpOnly cookie (`jwt`)

---

## Response Format

All API responses follow a consistent structure:

```json
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-05-19T12:00:00.000Z"
}

// Error
{
  "success": false,
  "message": "Error description",
  "timestamp": "2026-05-19T12:00:00.000Z"
}

// Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ],
  "timestamp": "2026-05-19T12:00:00.000Z"
}
```

> **Note:** Error details are only included in non-production environments.

---

## Table of Contents

1. [Auth](#1-auth) (10 endpoints)
2. [User Management](#2-user-management) (7 endpoints)
3. [Admin Dashboard](#3-admin-dashboard) (10 endpoints)
4. [Events](#4-events) (6 endpoints)
5. [Blogs / Creative](#5-blogs--creative) (6 endpoints)
6. [Impact](#6-impact) (5 endpoints)
7. [Gallery](#7-gallery) (5 endpoints)
8. [Resources](#8-resources) (6 endpoints)
9. [Certificates](#9-certificates) (6 endpoints)
10. [Donations & Payments](#10-donations--payments) (8 endpoints)
11. [Internships](#11-internships) (4 endpoints)
12. [Internship Applications](#12-internship-applications) (5 endpoints)
13. [Contact](#13-contact) (5 endpoints)
14. [Newsletter](#14-newsletter) (6 endpoints)
15. [Testimonials](#15-testimonials) (5 endpoints)
16. [Supporters](#16-supporters) (5 endpoints)
17. [Team](#17-team) (5 endpoints)
18. [Periodicals](#18-periodicals) (7 endpoints)
19. [Walkthroughs](#19-walkthroughs) (7 endpoints)
20. [Resume Builder](#20-resume-builder) (7 endpoints)
21. [Notifications](#21-notifications) (4 endpoints)
22. [SEO](#22-seo) (2 endpoints)

---

## 1. Auth

Base: `/api/auth`

### POST `/register`
Register a new user.

**Auth:** None  
**Rate Limit:** 3 per hour per IP  
**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name |
| `email` | string | Yes | Email address |
| `password` | string | Yes | Min 8 chars |
| `phone` | string | No | Phone number |
| `province` | string | No | Province name |
| `collegeName` | string | No | College name |
| `faculty` | string | No | Faculty |
| `semester` | string | No | Current semester |
| `code` | string | No | Membership code |
| `role` | string | No | Role (default: `gm`) |
| `profileImage` | file | No | Profile photo (JPEG/PNG) |

**Response:** `201`
```json
{
  "success": true,
  "message": "Registered successfully. You can now login.",
  "data": { "id": "...", "name": "...", "email": "...", "role": "gm" }
}
```

---

### POST `/login`
Authenticate with email and password.

**Auth:** None  
**Rate Limit:** 5 per 15 min per IP

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Email |
| `password` | string | Yes | Password |

**Response:** `200`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": { "id": "...", "name": "...", "email": "...", "role": "admin", "isVerified": true, ... }
  }
}
```

**Sets cookie:** `jwt` (HttpOnly, secure in production, sameSite)

---

### POST `/logout`
Clear the auth cookie.

**Auth:** None

**Response:** `200` — cookie cleared

---

### GET `/me`
Get currently authenticated user's profile.

**Auth:** Required

**Response:** `200` — Full user profile object

---

### PATCH `/profile`
Update the authenticated user's profile.

**Auth:** Required

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Full name |
| `phone` | string | Phone |
| `bio` | string | Max 1000 chars |
| `address` | string | Address |
| `gender` | enum | `male`, `female`, `other`, or `""` |
| `website` | string | URL or empty to clear |
| `linkedin` | string | URL or empty to clear |
| `github` | string | URL or empty to clear |
| `collegeName` / `university` / `faculty` / `semester` | string | Education fields |

---

### POST `/forget-password`
Request a password reset OTP.

**Auth:** None  
**Rate Limit:** 5 per hour per IP

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |

**Behavior:** Always returns success (even if email doesn't exist) to prevent email enumeration. If account exists, OTP is sent to email. Cooldown: 60 seconds between resends.

---

### POST `/verify-otp`
Verify the OTP and get a reset token.

**Auth:** None  
**Rate Limit:** 5 per 15 min per IP

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `otp` | string | Yes (6 digits) |

**Response:**
```json
{ "data": { "resetToken": "eyJ..." } }
```

> OTP attempts limited to 5. After 5 failures, OTP is invalidated.

---

### POST `/resend-otp`
Resend the OTP (same logic as forget-password).

**Auth:** None  
**Rate Limit:** 5 per hour per IP

---

### POST `/reset-password`
Reset password using the token from OTP verification.

**Auth:** None

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `resetToken` | string | Yes |  
| `newPassword` | string | Yes (8+ chars, must include uppercase, lowercase, number, special char) |

---

### WebAuthn Endpoints

Base: `/api/auth/webauthn`

#### POST `/register-options`
Generate WebAuthn registration options. **Auth:** Required

#### POST `/register-verify`
Verify and store a new biometric credential. **Auth:** Required

| Field | Type | Description |
|-------|------|-------------|
| `challengeId` | string | From register-options response |
| `response` | object | Browser's WebAuthn response |
| `deviceName` | string | User-friendly device name |

#### POST `/login-options`
Generate WebAuthn authentication options. **Auth:** None  
**Rate Limit:** 10 per 15 min

#### POST `/login-verify`
Verify WebAuthn authentication and log in. **Auth:** None  
**Rate Limit:** 10 per 15 min

**Sets cookie:** `jwt` (same as password login)

#### GET `/credentials`
List registered biometric devices. **Auth:** Required

#### DELETE `/credentials/:id`
Remove a registered biometric device. **Auth:** Required

---

## 2. User Management

Base: `/api/users`

### GET `/public-users`
Get list of active, non-deleted public users.

**Auth:** None

**Query:** `?province=kathmandu` (optional filter)

**Response:** Array of users with name, role, province, profileImage, education, social links.

---

### POST `/create-user`
Create a new user (admin only). **Auth:** MEMBER_CREATE

---

### GET `/list-user`
List all non-superadmin users. **Auth:** MEMBER_VIEW

---

### PUT `/update-user/:id`
Update user details. **Auth:** MEMBER_UPDATE

**Content-Type:** `multipart/form-data`

---

### DELETE `/delete-user/:id`
Delete a user. **Auth:** MEMBER_DELETE

**Restrictions:**
- Cannot delete super admin (`sajhilodigital@gmail.com`)
- Cannot delete admin users
- Cannot delete yourself

---

### PUT `/update-permissions/:userId/add`
Add a specific permission to a user. **Auth:** SETTINGS_MANAGE

```json
{ "permission": "event:create" }
```

### PUT `/update-permissions/:userId/remove`
Remove a specific permission from a user. **Auth:** SETTINGS_MANAGE

```json
{ "permission": "event:create" }
```

---

## 3. Admin Dashboard

Base: `/api/admin`

### GET `/dashboard`
Get comprehensive dashboard statistics. **Auth:** MEMBER_VIEW

**Response includes:**
- **counts:** events, blogs, users, teamMembers, unreadContacts, donations, certificates, internships, onlineUsers
- **trends:** Today's new records for each entity
- **recent:** Recent events (5), activities (10), logins (5), online users, upcoming event reminders
- **analytics:**
  - `usersByRole` — distribution (e.g., `[{name: "ADMIN", value: 3}, {name: "EB", value: 15}]`)
  - `membersByProvince` — members grouped by province and role
  - `eventsByProvince` — events grouped by region
  - `certificatesByProvince` — certificates grouped by province

### GET `/content?type={type}`
Get all content of a specific type. **Auth:** MEMBER_VIEW

**Types:** `events`, `blogs`, `resources`, `team`, `impacts`, `contacts`, `users`

### GET `/search?q={query}`
Global search across users, events, and blogs. **Auth:** MEMBER_VIEW

### GET `/activities?page=1&limit=20`
Get paginated activity logs. **Auth:** MEMBER_VIEW

### GET `/users/:id`
Get user details. **Auth:** MEMBER_VIEW

### GET `/events/:id`
Get event details. **Auth:** EVENT_VIEW

### GET `/blogs/:id`
Get blog details. **Auth:** BLOG_VIEW

### POST `/users/create-user`
Create user with file upload. **Auth:** MEMBER_CREATE

### PATCH `/users/:id`
Update user. **Auth:** MEMBER_UPDATE

### DELETE `/users/:id`
Delete user. **Auth:** MEMBER_DELETE

---

## 4. Events

Base: `/api/events`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events` | None | List all events |
| GET | `/events/slug/:slug` | None | Get event by slug |
| GET | `/events/:id` | None | Get event by ID |
| POST | `/events` | EVENT_CREATE | Create (multipart: image) |
| PUT | `/events/:id` | EVENT_UPDATE | Update (multipart: image) |
| DELETE | `/events/:id` | EVENT_DELETE | Delete |

**Event fields:** title, description, fullDescription, date, startDate, endDate, location, region, venue, image, type (hackathon/workshop/webinar/conference/social_impact), status (Draft/Published/Upcoming/Live/Completed), organizer, speakers[], highlights[], tags[], registrationLink, isNational, isCompleted

---

## 5. Blogs / Creative

Base: `/api/blogs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/blogs` | None | List all blogs |
| GET | `/blogs/slug/:slug` | None | Get blog by slug |
| GET | `/blogs/:id` | None | Get blog by ID |
| POST | `/blogs` | BLOG_CREATE | Create (multipart: image) |
| PUT | `/blogs/:id` | BLOG_UPDATE | Update (multipart: image) |
| DELETE | `/blogs/:id` | BLOG_DELETE | Delete |

**Blog fields:** title, content, excerpt, author, category, image, tags, readTime, isPublished, isFeatured, metaTitle, metaDescription, authorDetails (with social links)

---

## 6. Impact

Base: `/api/impacts`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/impacts` | None | List all impacts |
| GET | `/impacts/:id` | None | Get by ID |
| POST | `/impacts` | IMPACT_CREATE | Create (multipart: image) |
| PUT | `/impacts/:id` | IMPACT_UPDATE | Update (multipart: image) |
| DELETE | `/impacts/:id` | IMPACT_DELETE | Delete |

---

## 7. Gallery

Base: `/api/gallery`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/gallery` | None | List all gallery items |
| GET | `/gallery/:id` | None | Get by ID |
| POST | `/gallery` | GALLERY_CREATE | Create (multipart: image) |
| PUT | `/gallery/:id` | GALLERY_UPDATE | Update (multipart: image) |
| DELETE | `/gallery/:id` | GALLERY_DELETE | Delete |

---

## 8. Resources

Base: `/api/resources`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/resources` | Optional | List resources (filtered by role) |
| GET | `/resources/:id` | Optional | Get resource by ID |
| POST | `/resources/:id/download` | Optional | Track download count |
| POST | `/resources` | RESOURCE_CREATE | Create (multipart: file) |
| PUT | `/resources/:id` | RESOURCE_UPDATE | Update (multipart: file) |
| DELETE | `/resources/:id` | RESOURCE_DELETE | Delete |

> **Role Filtering:** Resources are filtered by `allowedRoles` field. Unauthenticated users see resources with `allowedRoles: ["guest"]` or empty. The `authenticate` middleware is called but errors are caught silently, falling back to guest role.

---

## 9. Certificates

Base: `/api/certificates`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/verify/:token` | None | Verify a certificate by token |
| POST | `/issue` | CERTIFICATE_ISSUE | Issue a single certificate |
| POST | `/bulk-issue` | CERTIFICATE_ISSUE | Bulk issue certificates |
| GET | `/ledger` | CERTIFICATE_VIEW | List all certificates |
| PATCH | `/:id/status` | CERTIFICATE_UPDATE | Update certificate status |
| DELETE | `/:id` | CERTIFICATE_DELETE | Delete certificate |

### Certificate Verification

```
GET /api/certificates/verify/{token}
```

Returns certificate details including:
- recipientName, courseName, certificateId, issueDate
- QR code data URL (generated on creation)
- Status (Valid, Expired, Revoked)
- Verification URL

### Certificate Issue

```json
POST /api/certificates/issue
{
  "recipientName": "John Doe",
  "recipientEmail": "john@example.com",
  "courseName": "React Workshop",
  "province": "Kathmandu",
  "certificateType": "event",
  "issueDate": "2026-05-19",
  "startDate": "2026-05-01",
  "endDate": "2026-05-03",
  "duration": "3 days",
  "hours": "24",
  "grade": "A"
}
```

### Certificate ID Format

`CFC-YYYYMMDD-XXXXX` — auto-generated, unique. Includes embedded QR code with verification URL.

---

## 10. Donations & Payments

Base: `/api/donations`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/donations` | None (rate limited) | Record a donation |
| GET | `/admin/donations` | REPORT_VIEW | List all donations |
| GET | `/admin/donations/stats` | REPORT_VIEW | Donation statistics |
| GET | `/admin/donations/:id` | REPORT_VIEW | Get donation by ID |
| PATCH | `/admin/donations/:id/status` | SETTINGS_MANAGE | Update status |
| PUT | `/admin/donations/:id` | SETTINGS_MANAGE | Update donation |
| POST | `/donations/initiate-esewa` | None | Initiate eSewa payment |
| GET | `/donations/verify-esewa` | None | Verify eSewa payment |

### eSewa Payment Flow

```
1. Frontend: POST /donations/initiate-esewa
   → Backend creates donation record (status: Pending)
   → Returns payment form data

2. Frontend: Redirects user to eSewa payment gateway
   → User completes payment on eSewa

3. eSewa: Redirects back to /donation-success or /donation-failure

4. Frontend: GET /donations/verify-esewa (with query params)
   → Backend verifies transaction with eSewa API
   → Updates donation status
```

---

## 11. Internships

Base: `/api/internships`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/internships` | None | List all internships |
| GET | `/internships/:id` | None | Get by ID |
| POST | `/internships` | INTERNSHIP_CREATE | Create (multipart: companyLogo) |
| PUT | `/internships/:id` | INTERNSHIP_UPDATE | Update |
| DELETE | `/internships/:id` | INTERNSHIP_DELETE | Delete |

---

## 12. Internship Applications

Base: `/api/internships`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/applications` | None | 3 per 15 min | Submit application |
| GET | `/applications` | INTERNSHIP_VIEW | — | List all applications |
| PATCH | `/applications/:id/status` | INTERNSHIP_UPDATE | — | Update status |
| DELETE | `/applications/:id` | INTERNSHIP_DELETE | — | Delete |

### Submit Application

**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `applicantName` | string | Yes |
| `email` | string | Yes |
| `phone` | string | Yes |
| `internshipId` | string | Yes |
| `resume` | file | Yes (PDF/DOC/DOCX) |
| `coverLetter` | string | No |

---

## 13. Contact

Base: `/api/contacts`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/contacts` | None | 3 per hour per IP | Submit contact form |
| GET | `/contacts` | CONTACT_VIEW | — | List contacts |
| GET | `/contacts/:id` | CONTACT_VIEW | — | Get by ID |
| PATCH | `/contacts/:id/read` | CONTACT_VIEW | — | Mark as read |
| DELETE | `/contacts/:id` | CONTACT_DELETE | — | Delete |

---

## 14. Newsletter

Base: `/api/newsletter`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/subscribe` | None | 2 per hour per IP | Subscribe email |
| GET | `/` | NEWSLETTER_VIEW | — | List subscribers |
| GET | `/export` | NEWSLETTER_VIEW | — | Export as CSV |
| GET | `/:id` | NEWSLETTER_VIEW | — | Get subscriber |
| PATCH | `/:id` | NEWSLETTER_UPDATE | — | Update subscriber |
| DELETE | `/:id` | NEWSLETTER_DELETE | — | Delete subscriber |

> Subscribe endpoint validates email format and checks MX records (DNS verification).

---

## 15. Testimonials

Base: `/api/testimonials`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/testimonials` | None | List active testimonials |
| GET | `/testimonials/admin/all` | TESTIMONIAL_VIEW | List all (incl. inactive) |
| GET | `/testimonials/:id` | TESTIMONIAL_VIEW | Get by ID |
| POST | `/testimonials` | TESTIMONIAL_CREATE | Create (multipart: image) |
| PUT | `/testimonials/:id` | TESTIMONIAL_UPDATE | Update |
| DELETE | `/testimonials/:id` | TESTIMONIAL_DELETE | Delete |

---

## 16. Supporters

Base: `/api/supporters`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/supporters` | None | List active supporters |
| GET | `/supporters/admin/all` | SUPPORTER_VIEW | List all |
| GET | `/supporters/:id` | SUPPORTER_VIEW | Get by ID |
| POST | `/supporters` | SUPPORTER_CREATE | Create (multipart: logo) |
| PUT | `/supporters/:id` | SUPPORTER_UPDATE | Update |
| DELETE | `/supporters/:id` | SUPPORTER_DELETE | Delete |

---

## 17. Team

Base: `/api/team`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/team` | None | List all team members |
| GET | `/api/team/:id` | None | Get by ID |
| POST | `/api/team/` | TEAM_CREATE | Create (multipart: image) |
| PUT | `/api/team/:id` | TEAM_UPDATE | Update |
| DELETE | `/api/team/:id` | TEAM_DELETE | Delete |

---

## 18. Periodicals

Base: `/api/periodicals`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/periodicals` | None | List all |
| GET | `/periodicals/slug/:slug` | None | Get by slug |
| GET | `/periodicals/:id` | None | Get by ID |
| POST | `/periodicals` | PERIODICAL_CREATE | Create (multipart: files[], max 10) |
| PUT | `/periodicals/:id` | PERIODICAL_UPDATE | Update (multipart: files[]) |
| PATCH | `/periodicals/:id/remove-file` | PERIODICAL_UPDATE | Remove a file |
| DELETE | `/periodicals/:id` | PERIODICAL_DELETE | Delete |

---

## 19. Walkthroughs

Base: `/api/walkthroughs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/walkthroughs` | None | List all |
| GET | `/walkthroughs/slug/:slug` | None | Get by slug |
| GET | `/walkthroughs/:id` | None | Get by ID |
| POST | `/walkthroughs` | WALKTHROUGH_CREATE | Create (multipart: image + files[]) |
| PUT | `/walkthroughs/:id` | WALKTHROUGH_UPDATE | Update (multipart: image + files[]) |
| PATCH | `/walkthroughs/:id/remove-file` | WALKTHROUGH_UPDATE | Remove a file |
| DELETE | `/walkthroughs/:id` | WALKTHROUGH_DELETE | Delete |

---

## 20. Resume Builder

Base: `/api/resumes`

All resume endpoints require authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | List user's resumes |
| GET | `/admin/all` | `user:view` | List all resumes (admin) |
| GET | `/:id` | Yes | Get resume by ID |
| POST | `/` | Yes | Create resume |
| PATCH | `/:id` | Yes | Update resume |
| DELETE | `/:id` | Yes | Delete resume |
| DELETE | `/admin/:id` | `user:delete` | Delete any resume (admin) |
| POST | `/:id/duplicate` | Yes | Duplicate a resume |

### Resume Schema

```json
{
  "title": "My Resume",
  "templateId": "minimalist-pro",
  "accentColor": "#0076B4",
  "personalInfo": {
    "fullName": "",
    "title": "Software Engineer",
    "email": "",
    "phone": "",
    "address": "",
    "summary": "",
    "website": "",
    "linkedin": "",
    "github": "",
    "profileImage": ""
  },
  "experience": [{ "company": "", "position": "", "startDate": "", "endDate": "", "current": false, "description": "" }],
  "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "" }],
  "skills": [{ "category": "Frontend", "items": ["React", "TypeScript"] }],
  "projects": [{ "name": "", "description": "", "technologies": "", "link": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "", "link": "" }],
  "languages": [{ "language": "English", "proficiency": "Fluent" }],
  "links": [{ "label": "Portfolio", "url": "" }]
}
```

### Available Templates

| Template ID | Name | Style |
|-------------|------|-------|
| `minimalist-pro` | Minimalist Pro | Clean, modern |
| `classic-formal` | Classic Formal | Traditional |
| `creative-bold` | Creative Bold | Colorful, modern |

---

## 21. Notifications

Base: `/api/notifications`

All notification routes require authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/subscribe` | Yes | Subscribe to push notifications |
| POST | `/unsubscribe` | Yes | Unsubscribe (provide endpoint) |
| PUT | `/preferences` | Yes | Update notification preferences |
| POST | `/admin/send` | SETTINGS_MANAGE | Send notification to users |

### Subscribe

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": { "p256dh": "...", "auth": "..." }
  }
}
```

### Send Notification (Admin)

```json
{
  "title": "New Event!",
  "body": "Check out our upcoming workshop.",
  "url": "/events/workshop-2026",
  "targetRoles": ["gm", "eb"],
  "targetProvince": "Kathmandu",
  "targetAll": false
}
```

### Notification Preferences

```json
{
  "preferences": {
    "events": true,
    "eventsAllProvinces": true,
    "internships": true,
    "applications": true,
    "certificates": true,
    "account": true,
    "resources": true,
    "content": true
  }
}
```

---

## 22. SEO

Base: `/` (root level)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sitemap.xml` | Dynamic XML sitemap |
| GET | `/robots.txt` | Robots exclusion file |

The sitemap is dynamically generated based on published content from Blogs, Events, and Impacts collections. Both endpoints use FRONTEND_URL for base URL generation.
