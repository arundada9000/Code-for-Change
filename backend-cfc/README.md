# Code for Change Nepal - Backend API

The enterprise-level backend service for [codeforchangenepal.com](https://codeforchangenepal.com/), powering the main website and administrative dashboard.

## Key Features

- **Modern Stack**: Built with Express 5, TypeScript, and Mongoose for robust backend operations.
- **Advanced Security & Authentication**:
  - Secure stateless JWT authentication via `httpOnly` secure cookies with `sameSite: strict`.
  - Comprehensive Role-Based Access Control (RBAC) supporting hierarchical roles (GM, CR, EB, Admin) and discrete granular permissions (e.g., `manage_events`, `manage_users`).
  - Strict input validation and sanitization using **Zod** schema parser.
  - Hardened endpoints using Helmet, CORS, Rate Limiting, HPP, and NoSQL injection protection.
- **Dynamic Content Management**: Supports uploading and managing images and digital assets seamlessly via Cloudinary integration and `multer`.
- **Global Error Handling**: Centralized error management system using a custom `AppError` class and asynchronous route handlers.

---

## Architecture & Working Mechanism

The backend uses a strict **Domain-Driven Module Architecture** separating concerns logically.

### 1. Request Lifecycle

Client Request ➡️ Global Middlewares (CORS, Rate Limit) ➡️ Auth/Role Middleware (if protected) ➡️ Zod Validation ➡️ Controller ➡️ Service (Business Logic) ➡️ MongoDB ➡️ Response Formatter

### 2. Authentication Flow (`/src/modules/auth`)

- **Login**: Verifies credentials securely via `bcryptjs`, tracks login history (IP & device), generates a signed JWT payload, and sets an `httpOnly` cookie.
- **Registration**: Ensures users are strictly assigned the base `gm` (General Member) role initially to prevent privilege escalation.
- **Password Reset**: Utilizes time-limited signed tokens sent via email SMTP to recover accounts securely without leaking user existence info.

### 3. Role-Based Access Control (RBAC)

- Checked via `role.middleware.ts` which decodes the JWT and validates the user's role against required roles or specific permissions stored in `permissions.ts`.
- **Hierarchy Mapping**: Centralized in `configs/permissions.ts` where permissions cascade based on roles.

### 4. Database Schema (`/src/modules/*/` )

Each module (e.g., user, event, blog, donation, contact) has a dedicated folder containing its `model`, `interface`, `route`, `service`, and `controller`. Mongoose strictly enforces database schema constraints and nested relationships.

---

## 📁 Core Directory Structure

```text
src/
├── app.ts                    # Global Express app setups and middlewares
├── shared/
│   ├── configs/              # Zod Environment validation and permissions map
│   ├── middlewares/          # Global Auth, Role, Validation, and Multer middlewares
│   └── utils/                # JWT parsing, password hashing, Cloudinary utils, Error handling
├── modules/
│   ├── auth/                 # Login, Registration, OTP, Password Reset
│   ├── user/                 # Profile updates, Role & Permission management
│   ├── admin/                # Administrative controls
│   ├── events/               # Event planning and registrations
│   ├── blogs/                # News and articles management
│   ├── donations/            # Financial donation tracking
│   ├── internships/          # Custom Internship applications processing
│   └── [impact, gallery, certificates...]
```

---

## Technology Stack

- **Runtime Environment:** Node.js
- **Framework:** Express 5.0
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Validation:** Zod
- **Authentication:** jsonwebtoken (JWT), bcryptjs
- **File Management:** Cloudinary, Multer

---

## Local Development Setup

Follow these steps to safely run the backend locally:

### 1. Install Dependencies

The project uses `pnpm` as its primary package manager.

```bash
# Navigate to backend directory
cd backend-cfc

# Install packages
pnpm install
```

### 2. Configure Environment Options

Create a `.env` file referencing the `.env.example`.

```bash
# Example required fields
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/codeforchange

# JWT Secret keys
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d

# External services
SMTP_HOST=smtp.gmail.com
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Server

```bash
# Start in development environment with hot-reload (ts-node-dev)
pnpm dev

# Build the TypeScript project for production
pnpm build

# Start the built version
pnpm start
```

## Best Practices Applied

- Passwords are strictly one-way hashed.
- Secret tokens never exist in logs or frontend responses.
- API validation ensures no unexpected payload arguments crash the application.
- Redundant dependencies have been audited out to keep module footprints small.

---

<div align="center">
  <a href="https://sajilodigital.com.np" target="_blank">
    <img src="../frontend-cfc/public/sajilodigital.png" alt="Sajilo Digital" width="200" />
  </a>
  <br />
  <p><b>Developed & Maintained by <a href="https://sajilodigital.com.np" target="_blank">Sajilo Digital</a></b></p>
</div>
