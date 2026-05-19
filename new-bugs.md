# New Bugs — Issues Found During Codebase Audit

> **Audit date:** 2026-05-19  
> **Updated:** 2026-05-19 (round 2 fixes applied)  
> **Audit scope:** Donation, Certificate, Internship backend modules + all frontend admin pages + service worker + hooks  
> **Pre-existing issues** (duplicate AppError, dual auth, superadmin recovery, WebAuthn memory store, no tests, Socket.IO dead weight, no migrations, online user staleness) are in `need-fixing.md`

---

## ✅ Fixed So Far (30 bugs resolved)

| # | Severity | Bug | Files Changed | Fix |
|---|----------|-----|---------------|-----|
| 1 | 🔴 | Permission format mismatch (underscore vs colon) | `AuthContext.jsx` | Normalizes `_` → `:` in `hasPermission()` |
| 3 | 🔴 | Donation permissions don't exist | `permissions.ts` | Added `DONATION_*` permissions + assigned to EB/CR/GM |
| 4 | 🔴 | eSewa secret key committed | `.env.example` | Replaced with placeholder |
| 5 | 🟠 | "Card" not in backend enum | `donation.interface/model/validation.ts` | Added `"Card"` to all three layers |
| 6 | 🟠 | Donation pages link to wrong route | `DonationSuccess.jsx`, `DonationFailure.jsx` | Changed `/donate` → `/donate-us` |
| 7 | 🟠 | `toast.error()` error object as options | `AdminDonations.jsx` | Proper error message formatting |
| 8 | 🟠 | Certificate single-issue missing `province` | `certificate.validation.ts` | Added `province` field |
| 9 | 🟠 | `parseArray()` corrupts dots+commas | `Internships.jsx` | Changed `if` → `else if` |
| 10 | 🟠 | Empty `applicationDeadline` → Invalid Date | `AdminInternships.jsx` | Added empty string filter |
| 11 | 🟠 | `fileType` enum missing `"doc"` | `application.model.ts` | Added `"doc"` to enum |
| 12 | 🟠 | SW icon paths double `icons/` (404) | `public/sw.js` | Fixed paths |
| 13 | 🟠 | `useImageCompressor` cleanup never fires | `useImageCompressor.js` | `useState` → `useEffect` |
| 14 | 🟠 | Import after component definitions | `AdminEvents.jsx` | Moved import to top |
| — | 🟠 | Admin Resources returns empty array | `admin.service.ts`, `resource.service.ts` | Uncommented Resource import; wired `case "resources"` |
| 15 | 🟡 | Duplicate alumni entries | `teamData.js` | ALUMNI array now empty |
| 16 | 🟡 | All team social links point to placeholder | `teamData.js` | Cleared to empty strings |
| 17 | 🟡 | Placeholder alumni names | `teamData.js` | ALUMNI array now empty |
| 18 | 🟡 | Certificate verification error hardcoded | `CertificateVerification.jsx` | Shows actual API error message + renders it in error UI |
| 22 | 🟡 | Dead `DonationSucess.jsx` (typo filename) | `DonationSucess.jsx` | **Deleted** |
| 23 | 🟡 | Unused `Donation.avif` asset | `Donation.avif` | **Deleted** |
| 26 | 🟡 | Internship no duplicate detection | `application.service.ts` | Added existing application check |
| 27 | 🟡 | `contactNumber` no format validation | `application.validation.ts` | Added Nepal phone regex |
| 28 | 🟡 | Internship form missing `province` | `InternshipApplication.jsx` | Added province dropdown |
| 29 | 🟡 | DocxViewer no error handling | `DocxViewer.jsx` | try-catch with error UI |
| 30 | 🟡 | console.log debugging leftovers | `Provinces.jsx` (13), `ProvinceDetails.jsx` (3), `CoreTeam.jsx` (1), `AdminEvents.jsx` (1), `pushNotification.js` (1) | Removed all |
| 31 | 🟡 | Commented-out JSX | `Home.jsx`, `DonateUs.jsx`, `Banner.jsx`, `InternshipApplication.jsx`, `Internships.jsx` | Removed dead code |
| 33 | 🟡 | Duplicate icon import (`FaRegTrashAlt`) | `AdminWalkthroughs.jsx` | Removed duplicate |
| 34 | 🟡 | Unused `useRef` import | `ResumePreview.jsx` | Removed from import |
| 35 | 🟡 | AuthContext loading state not used | `AuthContext.jsx` | Default `true`, set `false` in finally |
| 36 | 🟡 | Banner nested paths display incorrectly | `Banner.jsx` | Handles `/` → ` - `, capitalizes words |

---

## 🔴 Critical — Still Broken

### 2. eSewa Payment Flow Is Completely Disconnected from Frontend

- **File:** `frontend-cfc/src/Components/PageComponents/Donate/DonateSection.jsx:63-108`
- **Problem:** The donation form **always** POSTs to `/donations` (creates a manual "Pending" record) regardless of the selected payment method. When a user selects "eSewa," they expect to be redirected to the eSewa payment gateway to actually pay. Instead, they get a toast: "Your donation request has been recorded."
- The `/donations/initiate-esewa` backend endpoint exists but is **never called** from the frontend.
- **Impact:** eSewa is listed as a payment option but does nothing. Users think they paid but no transaction occurred. Real donations are lost.
- **Fix:** When `paymentMethod === "eSewa"`, call `POST /donations/initiate-esewa` and redirect the user to the eSewa gateway URL returned by the backend.

---

## 🟡 Medium — Still Open

### 19. No Backend File Size Limit on Internship Resume Uploads

- **File:** `backend-cfc/src/modules/internships/application.route.ts:30`
- **Problem:** Frontend enforces 5MB, but backend multer has no `limits` config.
- **Fix:** Add `limits: { fileSize: 5 * 1024 * 1024 }` to `upload.single("resume")`.

### 20. eSewa Signature Verification Message Format May Be Incorrect

- **File:** `backend-cfc/src/modules/donations/donation.service.ts:67-69`
- **Problem:** The signature message includes ALL fields including `signed_field_names` itself. May fail verification for legitimate payments.

### 21. eSewa Verify Endpoint Has No Rate Limiter

- **File:** `backend-cfc/src/modules/donations/donation.route.ts:86`
- **Problem:** `GET /donations/verify-esewa` is unauthenticated and has no rate limiting.
- **Fix:** Add a rate limiter (e.g. 10/15min).

### 24. External QR API Dependency — Unnecessary Network Call

- **File:** `frontend-cfc/src/Pages/Admin/Certificate.jsx:155-156`
- **Problem:** PDF QR generation uses `https://api.qrserver.com/...`, but `react-qr-code` is already imported for on-screen QR.
- **Fix:** Use `react-qr-code` or a local QR library for PDFs too.

### 25. Certificate Duplicate-Detection Logic Duplicated Between Single and Bulk

- **File:** `backend-cfc/src/modules/certificates/certificate.service.ts:44-61,108-122`
- **Problem:** Same date-range duplicate check is copy-pasted between `issueCertificate` and `bulkIssue`.
- **Fix:** Extract into a shared helper method.

### 32. Duplicate Constants Between Certificate.jsx and BulkCertificateModal.jsx

- **Files:** `frontend-cfc/src/Pages/Admin/Certificate.jsx` + `BulkCertificateModal.jsx`
- **Problem:** Both define identical copies of `PROVINCES`, `PROVINCE_REGIONS`, `TEMPLATE_DEFAULTS`, CSS classes.
- **Fix:** Extract shared constants to a separate file.

### 37. `VITE_API_BASE_URL` Fallback to localhost in Production

- **File:** `frontend-cfc/src/Services/api.jsx:4`
- **Problem:** If `VITE_API_BASE_URL` is not set, it falls back to `http://localhost:5000/api`.
- **Impact:** Production build silently fails connecting to API.

### 38. Skeleton Component Injects Duplicate Style Tags

- **File:** `frontend-cfc/src/Components/Loading/Skeleton.jsx:28`
- **Problem:** Every skeleton instance injects a `<style>` tag with duplicate `@keyframes cfcShimmer`.
- **Fix:** Use a shared `<style>` tag or CSS module.

### 39. Confusing `FaDownload as FaImport` Alias

- **File:** `frontend-cfc/src/Pages/Admin/AdminEvents.jsx:24`
- **Problem:** `FaDownload` imported twice — once as itself, once aliased as `FaImport`.
- **Fix:** Use a proper import icon.

### 40. No `province` Field in Public Donation Form

- **File:** `frontend-cfc/src/Components/PageComponents/Donate/DonateSection.jsx`
- **Problem:** Public donation form doesn't collect province for demographic data.

### 41. `FRONTEND_URL` Optional but Required for eSewa Redirects

- **File:** `backend-cfc/src/shared/configs/env.ts:27` + `donation.service.ts:47`
- **Problem:** `FRONTEND_URL` is optional with a default, but eSewa redirect URLs depend on it.
- **Fix:** Make `FRONTEND_URL` required in dev/prod.

### 42. Donation Stats Endpoint Doesn't Support Province Filtering

- **File:** `backend-cfc/src/modules/donations/donation.service.ts:154`
- **Fix:** Add province filter to `getDonationStats`.

### 43. Certificate Verify Endpoint — Only Global Rate Limiter

- **File:** `backend-cfc/src/modules/certificates/certificate.route.ts:20-24`
- **Problem:** Public verify endpoint has no dedicated rate limiter (only 1000/hr global).
- **Fix:** Add a dedicated limiter (e.g. 20/min).

### 44. Two Frontend Routes for Same Verification Page

- **File:** `frontend-cfc/src/App.jsx:99-106`
- **Problem:** Both `/certificate-verification/:token?` and `/verify-certificate/:token` point to the same page.
- **Fix:** Consolidate to one route.

### 45. Public Donation Form Missing Province (Duplicate of #40)

- **File:** `frontend-cfc/src/Components/PageComponents/Donate/DonateSection.jsx`
- Same as #40 above.

### 46. `Breadcrumbs` Unused Import in DonateUs.jsx

- **File:** `frontend-cfc/src/Pages/DonateUs.jsx`
- **Status:** ✅ Fixed (removed in round 2)

### 47. `console.log` in pushNotification.js

- **File:** `frontend-cfc/src/utils/pushNotification.js:29`
- **Status:** ✅ Fixed (removed in round 2)

### 48. Volunteer Track Silent Fallback

- **File:** `frontend-cfc/src/Pages/InternshipApplication.jsx:47`
- **Problem:** If `job.category` doesn't match any `TRACKS`, falls back to `TRACKS[0]` silently.
- **Fix:** Show a warning or fall back gracefully.

### 49. Fragile Route Ordering in app.ts

- **File:** `backend-cfc/src/app.ts:180-181`
- **Problem:** If `applicationRoutes` and `internshipRoutes` are reordered, protected endpoints become public.

### 50. Certificate Single-Issue Random ID Collision

- **File:** `backend-cfc/src/modules/certificates/certificate.model.ts:59-64`
- **Problem:** 1M:1 odds/day for certificateId collision; gives misleading error.
- **Fix:** Add retry logic or use a longer random string.

---

## 🆕 Newly Introduced (Minor)

### 51. Unused `Breadcrumbs` Import in Internships.jsx

- **File:** `frontend-cfc/src/Pages/Internships.jsx:4`
- **Problem:** The commented-out JSX that used `Breadcrumbs` was removed, but the import at line 4 was left behind. The component is never rendered.
- **Introduced in:** Round 2 fixes (commented-out JSX cleanup)
- **Fix:** Remove `import Breadcrumbs from "../Components/UI/Breadcrumbs"`.

---

## 🟢 Info / Minor — Still Open

| # | Issue | File |
|---|-------|------|
| — | Province dropdown uses city/district names instead of official 7 provinces (consistent with rest of project, not a bug per se) | `InternshipApplication.jsx:302` |
| — | `console.error` for legitimate error logging (acceptable, not a bug) | Various |

---

## Summary

| Severity | Original | Fixed (Round 1) | Fixed (Round 2) | Still Open |
|----------|----------|----------------|----------------|------------|
| 🔴 Critical | 4 | 3 | 0 | 1 |
| 🟠 High | 10 | 10 | 0 | 0 |
| 🟡 Medium | 27 | 0 | 15 | 12 |
| 🟢 Minor | 10 | 0 | 2 | 8 |
| 🆕 New | — | — | 1 | 1 |
| **Total** | **51** | **13** | **18** | **22** |
