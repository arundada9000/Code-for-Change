# Contributing Guide — Code for Change Nepal

> First, thank you for contributing! This guide will help you understand our workflow, coding standards, and how to make contributions effectively.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Branch Strategy](#branch-strategy)
5. [Commit Conventions](#commit-conventions)
6. [Pull Request Process](#pull-request-process)
7. [Coding Standards](#coding-standards)
8. [Module Creation Guide](#module-creation-guide)
9. [Testing](#testing)

---

## Code of Conduct

- **Be respectful** — We're all here to build something great
- **Be constructive** — Critique code, not people
- **Be collaborative** — Ask questions, offer help, share knowledge
- **No egos** — The best solution wins, regardless of who proposes it

---

## Getting Started

```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/CFC-Official-Website.git
cd CFC-Official-Website

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/CFC-Official-Website.git

# 4. Create a feature branch
git checkout -b feat/your-feature-name

# 5. Set up the project
# See docs/SETUP.md for detailed setup instructions
```

---

## Development Workflow

```
1. Find an issue or feature → assign yourself or comment
2. Create a branch from main
3. Write code + test locally
4. Commit with conventional commit message
5. Push to your fork
6. Open a PR against main
7. Address review feedback
8. Merge (squash)
9. Delete the branch
```

### Before Starting Work

- [ ] Read `docs/SETUP.md` — project setup
- [ ] Read `docs/ARCHITECTURE.md` — understand the system
- [ ] Read `docs/API.md` — understand existing endpoints
- [ ] Read `docs/EDGE_CASES.md` — avoid common pitfalls
- [ ] Check existing PRs and issues to avoid duplication

---

## Branch Strategy

We follow a simplified Git Flow:

| Branch | Purpose | Base Branch | Naming Convention |
|--------|---------|-------------|-------------------|
| `main` | Production-ready code | — | Protected, requires PR |
| `feat/*` | New features | `main` | `feat/biometric-login` |
| `fix/*` | Bug fixes | `main` | `fix/login-crash` |
| `refactor/*` | Code improvements | `main` | `refactor/auth-middleware` |
| `docs/*` | Documentation changes | `main` | `docs/api-reference` |

### Branch Naming Rules

- Use lowercase with hyphens
- Start with a type prefix: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`
- Be descriptive but concise: `feat/resume-pdf-export` not `fix/something`

---

## Commit Conventions

We use **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Usage | Example |
|------|-------|---------|
| `feat` | New feature | `feat(events): add event registration link` |
| `fix` | Bug fix | `fix(auth): handle expired JWT gracefully` |
| `docs` | Documentation | `docs(api): add donation endpoints` |
| `refactor` | Code change (no feature/bug) | `refactor(user): extract permission logic` |
| `style` | Formatting only | `style: remove trailing whitespace` |
| `perf` | Performance improvement | `perf: lazy load admin pages` |
| `chore` | Maintenance | `chore: update dependencies` |

### Examples

```
feat(certificates): add bulk certificate issuance

- Accept array of recipients in single request
- Generate QR codes for each certificate
- Return summary of issued certificates

Closes #42
```

```
fix(auth): prevent account enumeration on password reset

Always return success regardless of whether email exists.
This prevents attackers from discovering registered emails.
```

---

## Pull Request Process

### Opening a PR

1. **Title:** Follow conventional commit format (e.g., `feat(module): description`)
2. **Description:** Include:
   - What does this PR do?
   - Why is it needed? (link to issue if applicable)
   - How was it tested?
   - Screenshots for UI changes
3. **Checklist:** Verify your code passes lint and build

### PR Review Checklist

For reviewers:

- [ ] Code follows the project's patterns and conventions
- [ ] No unnecessary dependencies added
- [ ] Error handling is consistent with the existing approach
- [ ] Validation (Zod) is in place for new endpoints
- [ ] Rate limiting is considered for new public endpoints
- [ ] Permissions are verified for new admin endpoints
- [ ] No sensitive data leaked in responses
- [ ] TypeScript types are correct and complete
- [ ] MongoDB indexes are added for new query patterns
- [ ] Cloudinary folder is specified for new upload types
- [ ] `app.ts` has the new route registered
- [ ] Tests exist (if applicable)

### Merging

- PRs require at least **1 approval**
- Use **Squash and Merge** to keep history clean
- The commit message should summarize the entire PR

---

## Coding Standards

### General

- **2-space indentation** (TypeScript/JavaScript)
- **Semicolons** required
- **Single quotes** preferred
- **No unused variables** — checked by TypeScript + ESLint
- **Async/await** over raw promises
- **Descriptive variable names** — avoid abbreviations

### Backend (TypeScript)

```typescript
// ✅ Good
import { Router } from "express";
import { UserTable } from "../user/user.model.js";

export const getUserById = async (id: string): Promise<IUser | null> => {
  return UserTable.findById(id);
};

// ❌ Bad
const get_user = async (id: string) => {
  return UserTable.findById(id);
};
```

### Module Structure

Every new feature module follows this pattern:

```
modules/{feature}/
├── {feature}.interface.ts     — Types and interfaces
├── {feature}.model.ts         — Mongoose schema
├── {feature}.validation.ts    — Zod schemas
├── {feature}.service.ts       — Business logic
├── {feature}.controller.ts    — Request handlers
└── {feature}.route.ts         — Route definitions
```

### Import Extensions

All local imports must include `.js` extension:

```typescript
// ✅ Correct (TypeScript requires this for ESM with Node)
import { ENV } from "../../shared/configs/env.js";

// ❌ Wrong — will break at runtime
import { ENV } from "../../shared/configs/env";
```

### Error Handling

```typescript
// ✅ Use asyncHandler wrapper
export const getItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await service.getItem(req.params.id);
  if (!item) throw new AppError("Item not found", 404);
  successResponse(res, item, "Item retrieved");
});

// ❌ Don't use try-catch in controllers (asyncHandler does it)
export const getItem = async (req: Request, res: Response) => {
  try {
    // ...
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Response Format

```typescript
// ✅ Use helper functions
successResponse(res, data, "Success message", 200);
// If error:
throw new AppError("Something went wrong", 400);
```

### Validation

```typescript
// ✅ Use Zod schemas with validate middleware
export const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  email: z.string().email(),
});

router.post("/items", authenticate, validate(createSchema), controller.createItem);
```

### Frontend (React)

```jsx
// ✅ Use functional components with hooks
export function EventCard({ event }) {
  const { user } = useAuth();
  return (
    <div className="rounded-lg shadow-md">
      <h3>{event.title}</h3>
    </div>
  );
}

// ✅ Lazy load admin pages
const AdminPage = lazy(() => import("./Pages/Admin/Page"));

// ✅ Use Tailwind classes, not custom CSS
// ❌ Avoid: style={{ color: 'red' }}
```

### API Integration

```typescript
// ✅ Use the shared API service (Axios instance)
import API from "../Services/api";

const response = await API.get("/events");
const response = await API.post("/auth/login", { email, password });

// ❌ Don't create new Axios instances
```

---

## Module Creation Guide

Creating a new backend module? Follow these steps:

### Step 1: Create directory and files

```bash
mkdir backend-cfc/src/modules/{feature}/
touch backend-cfc/src/modules/{feature}/{feature}.{interface,model,validation,service,controller,route}.ts
```

### Step 2: Define the Interface

```typescript
// {feature}.interface.ts
import { Document } from "mongoose";

export interface IYourFeature extends Document {
  title: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Step 3: Create the Mongoose Model

```typescript
// {feature}.model.ts
import { Schema, model } from "mongoose";
import { IYourFeature } from "./{feature}.interface.js";

const schema = new Schema<IYourFeature>(
  { title: { type: String, required: true }, description: { type: String }, isActive: { type: Boolean, default: true } },
  { timestamps: true }
);

export const YourFeature = model<IYourFeature>("YourFeature", schema);
```

### Step 4: Add Zod Validation

```typescript
// {feature}.validation.ts
import { z } from "zod";
export const createSchema = z.object({ title: z.string().min(1), description: z.string().optional() });
```

### Step 5: Write the Service

```typescript
// {feature}.service.ts
export class YourFeatureService {
  async getAll() { return YourFeature.find(); }
  async create(data: any) { return YourFeature.create(data); }
}
```

### Step 6: Create the Controller

```typescript
// {feature}.controller.ts
export class YourFeatureController {
  getAll = asyncHandler(async (req, res) => {
    const items = await service.getAll();
    successResponse(res, items);
  });
}
```

### Step 7: Define Routes

```typescript
// {feature}.route.ts
router.get("/features", controller.getAll);
router.post("/features", authenticate, requireAnyPermission(PERMISSIONS.YOUR_CREATE), validate(createSchema), controller.create);
```

### Step 8: Register in app.ts

```typescript
import yourRoutes from "./modules/{feature}/{feature}.route.js";
app.use("/api", yourRoutes);
```

### Step 9: Add to permissions.ts

If the module needs permissions:
```typescript
YOUR_CREATE: "your:create",
YOUR_VIEW: "your:view",
// ... add to ROLE_PERMISSIONS mapping
```

---

## Testing

### Current State

The project does not currently have automated tests. This is a known gap.

### Manual Testing Checklist

For any code change, manually verify:

1. **Backend:** Test the endpoint with curl or Postman
2. **Frontend:** Test the UI in Chrome and Firefox
3. **Mobile:** Check responsive behavior
4. **Auth:** Test both authenticated and unauthenticated scenarios
5. **Error states:** Submit invalid data, check error messages
6. **Edge cases:** Empty results, large payloads, missing fields

### Future Test Framework

When adding tests, we'll use:
- **Backend:** Jest + Supertest for API tests
- **Frontend:** Vitest + React Testing Library for component tests
- **E2E:** Playwright for full flow tests

---

## Common Pitfalls

| Pitfall | How to Avoid |
|---------|-------------|
| Forgetting `.js` extension in imports | Always use `.js` extension for local TypeScript imports |
| Missing `authenticate` middleware | Every admin/protected route needs it |
| Forgetting rate limiters | New public endpoints should consider rate limiting |
| Hardcoding sensitive data | Never commit real passwords, API keys, or secrets |
| Missing error handling | Wrap async route handlers with `asyncHandler` |
| Not checking file size | Multer's 5MB limit is there for a reason |
| Modifying superadmin checks | The `sajhilodigital@gmail.com` protection is intentional |
| Skipping CORS updates | Add new production domains to the CORS allowlist |
