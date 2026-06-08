# Bugs & Issues — Still Open

> Consolidated from audit findings. All fixed items have been removed.

---

## 🔴 Critical

### 1. eSewa Payment Flow Disconnected from Frontend
- **File:** `frontend-cfc/src/Components/PageComponents/Donate/DonateSection.jsx:63-108`
- **Status:** Still present — form always POSTs to `/donations` for all payment methods; no eSewa redirect.
- **Fix:** When `paymentMethod === "eSewa"`, call `POST /donations/initiate-esewa` and redirect to gateway.

### 2. JWT Stored in localStorage (XSS Risk)
- **Files:** `frontend-cfc/src/Context/AuthContext.jsx:49` + `api.jsx:16-24`
- **Status:** Still present — `localStorage.setItem("token", token)` in login, Bearer header attached by interceptor.
- **Fix:** Remove Bearer fallback in production. Use HttpOnly cookie only.

---

## 🟠 High

### 4. Zero Automated Tests
- **Status:** Still present — no test framework, files, or scripts in any `package.json`.
- **Fix:** Integrate Vitest. Test auth, donations, certificates, permissions.

### 5. eSewa Payments — No Webhook / Idempotency
- **File:** `backend-cfc/src/modules/donations/`
- **Status:** Still present — verify is redirect-only; no webhook or cron for stale pendings.
- **Fix:** Implement webhook + cron job.

### 7. Dependency Vulnerabilities (Audit Needed)
- **Files:** Both `package.json` files
- **Status:** Not yet audited.
- **Fix:** Run `npm audit` and update vulnerable packages.

---

## 🟡 Medium

### 8. eSewa Signature Includes `signed_field_names` in Message
- **File:** `backend-cfc/src/modules/donations/donation.service.ts:69`
- **Status:** Still present — `signed_field_names` included in HMAC message, may cause mismatch.
- **Fix:** Exclude from signature message string.

### 9. eSewa Verify Endpoint Has No Rate Limiter
- **File:** `backend-cfc/src/modules/donations/donation.route.ts:87`
- **Status:** Still present — `GET /donations/verify-esewa` is unauthenticated, unlimited.
- **Fix:** Add limiter (e.g. 10/15min).

### 10. External QR API Dependency
- **File:** `frontend-cfc/src/Pages/Admin/Certificate.jsx:156`
- **Status:** Still present — `https://api.qrserver.com/...` used for PDF QRs despite `react-qr-code` already loaded.
- **Fix:** Use `react-qr-code` or local QR lib.

### 11. Certificate Duplicate-Detection Logic Duplicated
- **File:** `backend-cfc/src/modules/certificates/certificate.service.ts:44-61,108-123`
- **Status:** Still present — same date-range check copy-pasted between `issueCertificate` and `bulkIssue`.
- **Fix:** Extract shared helper.

### 12. Duplicate Constants in Certificate.jsx and BulkCertificateModal.jsx
- **Files:** `Certificate.jsx:41-71` + `BulkCertificateModal.jsx:8-27`
- **Status:** Still present — `PROVINCES`, `PROVINCE_REGIONS`, `TEMPLATE_DEFAULTS`, CSS classes all duplicated.
- **Fix:** Extract to shared constants file.

### 13. Skeleton Component Injects Duplicate Style Tags
- **File:** `frontend-cfc/src/Components/Loading/Skeleton.jsx`
- **Status:** Still present — every skeleton instance renders `<StyleInjector>` with duplicate `@keyframes`.
- **Fix:** Use single shared `<style>` tag or CSS module.

### 14. `FaFileImport as FaImport` Misleading Alias
- **File:** `frontend-cfc/src/Pages/Admin/AdminEvents.jsx:24`
- **Status:** Still present — `FaFileImport` imported as `FaImport`.
- **Fix:** Use proper import icon.

### 15. No `province` Field in Public Donation Form
- **File:** `frontend-cfc/src/Components/PageComponents/Donate/DonateSection.jsx`
- **Status:** Still present — no province collection in form.

### 16. `FRONTEND_URL` Optional but Required for eSewa Redirects
- **File:** `backend-cfc/src/shared/configs/env.ts:27`
- **Status:** Still present — `.optional()` means empty string passes; eSewa redirect breaks.
- **Fix:** Make required.

### 17. Donation Stats Endpoint Ignores Province Filter
- **File:** `backend-cfc/src/modules/donations/donation.service.ts:154`
- **Status:** Still present — `getDonationStats` aggregation has no province param.
- **Fix:** Add province to aggregation pipeline.

### 18. Certificate Verify Endpoint — No Dedicated Rate Limiter
- **File:** `backend-cfc/src/modules/certificates/certificate.route.ts:20-24`
- **Status:** Still present — only global limiter (1000/hr).
- **Fix:** Add dedicated limiter (e.g. 20/min).

### 19. Two Frontend Routes for Certificate Verification
- **File:** `frontend-cfc/src/App.jsx:108-112`
- **Status:** Still present — both `/certificate-verification` and `/verify-certificate/:token?` render same page.
- **Fix:** Consolidate to one.

### 20. Volunteer Track Silent Fallback
- **File:** `frontend-cfc/src/Pages/InternshipApplication.jsx:47`
- **Status:** Still present — unknown `job.category` falls back to `TRACKS[0]` with only a `console.warn`.
- **Fix:** Show visible error to user.

### 22. Certificate Single-Issue Random ID Collision
- **File:** `backend-cfc/src/modules/certificates/certificate.model.ts:59-64`
- **Status:** Still present — 3 random bytes (`~16M` values) per date; collision gives confusing error.
- **Fix:** Add retry or longer random string.

### 23. No MongoDB Migration Framework
- **Status:** Still present — schema changes apply directly with no migration system.
- **Fix:** Use `migrate-mongo` or add `required: false` for new fields.

### 24. "Online Users" Metric Uses 2-Minute Window
- **File:** `backend-cfc/src/modules/admin/admin.service.ts:43-45`
- **Status:** Still present — 2-minute `lastActive` threshold. Not real-time, but reasonable.
- **Fix:** Reduce to 1 min or implement heartbeat.

### 25. Express JSON/URL Encoded Limit at 2MB (Should Be 1MB)
- **File:** `backend-cfc/src/app.ts:119-120`
- **Status:** Still present — lowered from 50MB to 2MB, still above recommended 1MB.
- **Fix:** Lower to `1mb`.

### 26. Heavy Frontend Libraries Not Lazy-Loaded
- **Files:** `frontend-cfc/package.json`
- **Status:** Still present — `jspdf`, `jspdf-autotable`, `jszip`, `docx-preview`, `papaparse`, `html-to-image` in initial bundle.
- **Fix:** Dynamically import within admin components.

---

## 🟢 Info / Minor

| Issue | File |
|-------|------|
| Province dropdown uses names like "Kathmandu" instead of official 7 provinces | `frontend-cfc/src/Pages/InternshipApplication.jsx:302` |
| `console.error` for legitimate error handling (acceptable, not a bug) | Various |
