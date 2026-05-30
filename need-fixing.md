# Need Fixing — Critical Issues Across the Project

> **Priority:** 🔴 Critical > 🟠 High > 🟡 Medium  
> **Source:** Codebase audit during documentation phase for `AI_CONTEXT.md`, `docs/EDGE_CASES.md`, `new-bugs.md`

---

## 🔴 Critical — Fix ASAP

### 0. eSewa Payment Flow Is Completely Disconnected from Frontend
- **File:** `frontend-cfc/src/Components/PageComponents/Donate/DonateSection.jsx:63-108`
- **Problem:** The donation form **always** POSTs to `/donations` (creates a manual "Pending" record) regardless of selection. When user selects "eSewa," they expect gateway redirect. Instead: "Your donation request has been recorded."
- **Impact:** eSewa is listed as a payment option but does nothing. Users think they paid but no transaction occurred. Real donations lost.
- **Fix:** When `paymentMethod === "eSewa"`, call `POST /donations/initiate-esewa` and redirect user to the gateway URL returned by backend.

---

## 🟠 High — Will Cause Production Pain

### 1. Duplicate `AppError` Class
- **Files:** `backend-cfc/src/shared/utils/appError.ts` and `backend-cfc/src/shared/utils/errorHandler.ts`
- **Problem:** Both files define an `AppError` class with slightly different signatures. `appError.ts` requires `statusCode`; `errorHandler.ts` defaults to 500. Depending on which file a module imports, `instanceof AppError` checks may silently fail.
- **Impact:** Error handling is unpredictable — some errors get proper status codes, others default to 500. Middleware that catches `AppError` instances may miss errors thrown with the other class.
- **Fix:** ~~Consolidate to one class in a single file. Re-export from the other (or delete one and update all imports).~~ **[FIXED]** `AppError` is now solely defined in `appError.ts` and exported by `errorHandler.ts`.

### 2. Dual Auth Token Strategy (XSS Risk)
- **File:** `backend-cfc/src/shared/middlewares/auth.middleware.ts`
- **Problem:** JWT is duplicated — stored in an HttpOnly cookie AND in `localStorage` (sent as Bearer header). The `localStorage` token is accessible to any JavaScript running on the page. If any XSS vulnerability exists, the attacker has persistent auth.
- **Context:** The Bearer fallback exists for cross-origin dev (frontend :5173 → backend :5000). In production, frontend and backend are on the same Vercel domain, so the cookie alone suffices.
- **Impact:** An XSS bug in any page leaks permanent auth to an attacker.
- **Fix:** Remove the Bearer token storage/fallback in production. Use the HttpOnly cookie as the sole auth mechanism. For dev, keep both but strip Bearer logic at the frontend level (send cookie only).

### 3. Hardcoded Superadmin — No Recovery
- **Files:** Seed script + `shared/configs/permissions.ts`
- **Problem:** `sajhilodigital@gmail.com` is hardcoded as protected at multiple code levels. This account cannot be deleted, modified, or unseated via API.
- **Impact:** Single point of failure. If that email account is compromised or loses access, there is no in-app recovery mechanism. The entire platform has no admin access path.
- **Fix:** Implement a recovery mechanism (e.g., a secure CLI command, a recovery token system, or a multi-admin fallback). At minimum, allow another superadmin to be promoted through a secure process.

### 4. In-Memory WebAuthn Challenge Store (Breaks on Restart + No Scale)
- **File:** `backend-cfc/src/modules/webauthn/webauthn.service.ts` (challenges stored in a `Map`)
- **Problem:** WebAuthn registration/login challenges live in a JavaScript `Map` in memory. Lost on server restart, crash, or Vercel cold start.
- **Impact:** Users mid-registration will fail when the server restarts (common on Vercel serverless). Cannot scale horizontally beyond ~1K concurrent auth attempts.
- **Fix:** Store challenges in MongoDB (or Redis if available). Set TTL to auto-expire stale challenges.

---

## 🟠 High — Will Cause Production Pain

### 5. Zero Automated Tests
- **Files:** None exist anywhere in the project.
- **Problem:** No test framework, no test files, no test scripts in `package.json`.
- **Impact:** Every deployment is a blind push. A typo in a Mongoose schema, a removed `await`, a broken import — caught only when a user reports it. No safety net for refactoring.
- **Fix:** Integrate Vitest (frontend) + Jest or Vitest (backend). Write tests for critical paths: auth, donation, certificate issuance, permission checks.

### 6. Socket.IO Dead Dependency
- **File:** `backend-cfc/package.json` (lists `socket.io` + `@types/socket.io`)
- **Problem:** Socket.IO is in `package.json` but imported exactly zero times in `src/`. The server uses plain `app.listen()` with no Socket.IO setup.
- **Impact:** 2MB+ of unnecessary `node_modules` weight. Confusing for new contributors who assume real-time features exist. Wouldn't work on Vercel serverless anyway (no WebSocket support).
- **Fix:** `npm uninstall socket.io @types/socket.io`.

### 7. eSewa Payments — No Webhook / Idempotency
- **File:** `backend-cfc/src/modules/donation/`
- **Problem:** Payment verification is purely redirect-based. User → eSewa → redirect back to site. If the user closes their browser before the redirect completes, the donation stays `"Pending"` forever.
- **Impact:** Lost donations, incorrect financial records, no way to reconcile pending payments.
- **Fix:** Implement an eSewa webhook endpoint + a cron job or scheduled cleanup that checks pending donations older than N hours and marks them as failed.

### 8. Admin "Resources" Endpoint Returns Empty Array
- **File:** `backend-cfc/src/modules/admin/admin.service.ts` or `admin.controller.ts`
- **Problem:** `GET /api/admin/content?type=resources` returns `[]` even when resources exist in the database.
- **Impact:** Admin users see nothing in the Resources management panel. They cannot manage resources through the admin dashboard.
- **Fix:** Find the branching logic in the admin content handler and add the `resources` case (or fix the filter query).

---

## 🟡 Medium — Should Address

### 9. No Backend File Size Limit on Internship Resume Uploads
- **File:** `backend-cfc/src/modules/internships/application.route.ts:30`
- **Problem:** Frontend enforces 5MB, but backend multer has no `limits` config. Attacker can upload arbitrary-sized files.
- **Fix:** Add `limits: { fileSize: 5 * 1024 * 1024 }` to `upload.single("resume")`.

### 10. eSewa Signature Verification Message Format May Be Incorrect
- **File:** `backend-cfc/src/modules/donations/donation.service.ts:67-69`
- **Problem:** The signature message includes ALL fields including `signed_field_names` itself. May fail verification for legitimate payments.
- **Fix:** Exclude `signed_field_names` from the signature message string.

### 11. eSewa Verify Endpoint Has No Rate Limiter
- **File:** `backend-cfc/src/modules/donations/donation.route.ts:86`
- **Problem:** `GET /donations/verify-esewa` is unauthenticated and has no rate limiting. Open to brute-force/abuse.
- **Fix:** Add a rate limiter (e.g. 10/15min).

### 12. External QR API Dependency — Unnecessary Network Call
- **File:** `frontend-cfc/src/Pages/Admin/Certificate.jsx:155-156`
- **Problem:** PDF QR generation uses `https://api.qrserver.com/...`, but `react-qr-code` is already imported for on-screen QR.
- **Fix:** Use `react-qr-code` or a local QR library for PDFs too.

### 13. Certificate Duplicate-Detection Logic Duplicated Between Single and Bulk
- **File:** `backend-cfc/src/modules/certificates/certificate.service.ts:44-61,108-122`
- **Problem:** Same date-range duplicate check is copy-pasted between `issueCertificate` and `bulkIssue`.
- **Fix:** Extract into a shared helper method.

### 14. Duplicate Constants Between Certificate.jsx and BulkCertificateModal.jsx
- **Files:** `frontend-cfc/src/Pages/Admin/Certificate.jsx` + `BulkCertificateModal.jsx`
- **Problem:** Both define identical copies of `PROVINCES`, `PROVINCE_REGIONS`, `TEMPLATE_DEFAULTS`, CSS classes.
- **Fix:** Extract shared constants to a separate file.

### 15. Skeleton Component Injects Duplicate Style Tags
- **File:** `frontend-cfc/src/Components/Loading/Skeleton.jsx:28`
- **Problem:** Every skeleton instance injects a `<style>` tag with duplicate `@keyframes cfcShimmer`.
- **Fix:** Use a shared `<style>` tag or CSS module.

### 16. Confusing `FaDownload as FaImport` Alias
- **File:** `frontend-cfc/src/Pages/Admin/AdminEvents.jsx:24`
- **Problem:** `FaDownload` imported twice — once as itself, once aliased as `FaImport`.
- **Fix:** Use a proper import icon.

### 17. No `province` Field in Public Donation Form
- **File:** `frontend-cfc/src/Components/PageComponents/Donate/DonateSection.jsx`
- **Problem:** Public donation form doesn't collect province for demographic data.

### 18. `FRONTEND_URL` Optional but Required for eSewa Redirects
- **File:** `backend-cfc/src/shared/configs/env.ts:27` + `donation.service.ts:47`
- **Problem:** `FRONTEND_URL` is optional with a default, but eSewa redirect URLs depend on it.
- **Fix:** Make `FRONTEND_URL` required in dev/prod.

### 19. Donation Stats Endpoint Doesn't Support Province Filtering
- **File:** `backend-cfc/src/modules/donations/donation.service.ts:154`
- **Fix:** Add province filter to `getDonationStats`.

### 20. Certificate Verify Endpoint — Only Global Rate Limiter
- **File:** `backend-cfc/src/modules/certificates/certificate.route.ts:20-24`
- **Problem:** Public verify endpoint has no dedicated rate limiter (only 1000/hr global).
- **Fix:** Add a dedicated limiter (e.g. 20/min).

### 21. Two Frontend Routes for Same Verification Page
- **File:** `frontend-cfc/src/App.jsx:99-106`
- **Problem:** Both `/certificate-verification/:token?` and `/verify-certificate/:token` point to the same page.
- **Fix:** Consolidate to one route.

### 22. Volunteer Track Silent Fallback
- **File:** `frontend-cfc/src/Pages/InternshipApplication.jsx:47`
- **Problem:** If `job.category` doesn't match any `TRACKS`, falls back to `TRACKS[0]` silently.
- **Fix:** Show a warning or fall back gracefully.

### 23. Fragile Route Ordering in app.ts
- **File:** `backend-cfc/src/app.ts:180-181`
- **Problem:** If `applicationRoutes` and `internshipRoutes` are reordered, protected endpoints become public.

### 24. Certificate Single-Issue Random ID Collision
- **File:** `backend-cfc/src/modules/certificates/certificate.model.ts:59-64`
- **Problem:** 1M:1 odds/day for certificateId collision; gives misleading error.
- **Fix:** Add retry logic or use a longer random string.

### 25. Unused `Breadcrumbs` Import in Internships.jsx
- **File:** `frontend-cfc/src/Pages/Internships.jsx:4`
- **Problem:** Import left behind after dead JSX cleanup. Component never rendered.

### 26. `VITE_API_BASE_URL` Fallback to localhost in Production **[FIXED]**
- **File:** `frontend-cfc/src/Services/api.jsx:4`
- **Problem:** Fell back to `http://localhost:5000/api` if env var unset.
- **Fix:** ~~Now throws if `VITE_API_BASE_URL` is not set.~~ ✅ **FIXED** in commit `2caae1c`.

### 27. VAPID Public Key Hardcoded in Frontend Source **[FIXED]**
- **File:** `frontend-cfc/src/Components/PageComponents/Profile/NotificationSettings.jsx:8`
- **Problem:** Hardcoded fallback VAPID key in source. Silent failure on key rotation.
- **Fix:** ~~Now throws if `VITE_VAPID_PUBLIC_KEY` is not set.~~ ✅ **FIXED** in commit `2caae1c`.

### 28. No MongoDB Migration Framework
- **Files:** All Mongoose models (`*.model.ts`)
- **Problem:** Schema changes apply directly with no migration system. Adding a `required` field to an existing schema crashes on documents that lack that field.
- **Impact:** Breaking production on schema changes. No rollback capability.
- **Fix:** Use `migrate-mongo` or write a simple migration script pattern. Add `required: false` for new fields on existing collections, with a data migration step.

### 29. "Online Users" Metric Is 5 Minutes Stale
- **File:** `backend-cfc/src/modules/dashboard/dashboard.service.ts`
- **Problem:** "Online users" count is based on `lastActive` timestamp with a 5-minute threshold. This is not real-time.
- **Impact:** Misleading for admin monitoring and decision-making.
- **Fix:** Reduce threshold to 1-2 minutes or implement a heartbeart mechanism. Add a note in the UI that this is "active in last N minutes."

---

## See Also
- `docs/EDGE_CASES.md` — Additional edge cases, design quirks, and non-obvious behaviors
- `AI_CONTEXT.md` — Project context for AI/LLM assistants (includes gotchas section)
