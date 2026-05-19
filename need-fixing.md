# Need Fixing — Critical Issues Across the Project

> **Priority:** 🔴 Critical > 🟠 High > 🟡 Medium  
> **Source:** Codebase audit during documentation phase for `AI_CONTEXT.md`, `docs/EDGE_CASES.md`

---

## 🔴 Critical — Fix ASAP

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

### 9. No MongoDB Migration Framework
- **Files:** All Mongoose models (`*.model.ts`)
- **Problem:** Schema changes apply directly with no migration system. Adding a `required` field to an existing schema crashes on documents that lack that field.
- **Impact:** Breaking production on schema changes. No rollback capability.
- **Fix:** Use `migrate-mongo` or write a simple migration script pattern. Add `required: false` for new fields on existing collections, with a data migration step.

### 10. "Online Users" Metric Is 5 Minutes Stale
- **File:** `backend-cfc/src/modules/dashboard/dashboard.service.ts`
- **Problem:** "Online users" count is based on `lastActive` timestamp with a 5-minute threshold. This is not real-time.
- **Impact:** Misleading for admin monitoring and decision-making.
- **Fix:** Reduce threshold to 1-2 minutes or implement a heartbeart mechanism. Add a note in the UI that this is "active in last N minutes."

### 11. VAPID Public Key Hardcoded in Frontend Source
- **File:** `frontend-cfc/src/Components/PageComponents/Profile/NotificationSettings.jsx` (line 8)
- **Problem:** The `VITE_VAPID_PUBLIC_KEY` env var is never set. The code falls back to a hardcoded string in source. If the backend VAPID keys are regenerated, push notifications silently break with no error.
- **Impact:** After key rotation, all push subscriptions fail. Users get no notification, and there's no indication of why.
- **Fix:** Set `VITE_VAPID_PUBLIC_KEY` in `frontend-cfc/.env` (and Vercel env vars). Remove the hardcoded fallback — fail loudly if the env var is missing.

---

## See Also
- `docs/EDGE_CASES.md` — Additional edge cases, design quirks, and non-obvious behaviors
- `AI_CONTEXT.md` — Project context for AI/LLM assistants (includes gotchas section)
