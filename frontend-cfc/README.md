# Code for Change Nepal - Frontend Client

The official frontend application and administrative dashboard for [codeforchangenepal.com](https://codeforchangenepal.com/), delivering a fast, responsive, and seamless experience.

## Key Features

- **Modern Ecosystem**: Built upon React 19 and Vite 7, ensuring exceptionally fast hot-module replacement (HMR) and optimized build outputs.
- **Dynamic Styling**: Features an aesthetically modern UI, built utility-first with **Tailwind CSS v4** allowing custom themes, glassmorphism impacts, and rich responsive typography.
- **Seamless Navigation**: Managed by **React Router v7** using nested routing matrices.
- **Performance Optimized**:
  - Administrative routes (~17 unique pages) are entirely **Lazy-Loaded** (`React.lazy` & `Suspense`) so normal visitors do not load heavy admin panel JavaScript bundles.
- **Advanced State Management**: Custom Context Providers (e.g., `AuthContext`) for globally maintaining user sessions, JWT states, and decoding RBAC hierarchy seamlessly across child components.
- **Data Fetching integration**: A highly customized `Axios` application instance that intercepts 401s, handles global error triggers securely, and dynamically embeds server responses into `react-hot-toast` notifications.
- **Developer Console**: Full terminal emulator in the browser console (`initConsoleGreeting`) with music player, province navigation, easter eggs (matrix rain, romantic effect), and developer card.
- **Context Menu**: Right-click anywhere opens a terminal-themed context menu (`ContextMenu.jsx`) for quick navigation, music toggle, and easter egg triggers.

---

## Architecture & Working Mechanism

### 1. Route Layout Structuring

The application fundamentally splits users into three contexts:

1. **`MainLayout`**: The public-facing site displaying dynamic components (Events, Blogs, Donate, Provinces). Includes a shared Navbar and Footer.
2. **`AuthLayout`**: Focused minimal layout intended solely for onboarding, logging in, registration, or password resetting.
3. **`AdminLayout`**: Protected route strictly accessible by `gm`, `cr`, `eb`, or `admin` roles, enforcing side-bar tracking and data-heavy table management.

### 2. Private & Role-based Routing (`PrivateRoute.jsx`)

Components attempting to reach protected areas intercept through `PrivateRoute`. It verifies authentication state from `AuthContext` and uses backend-assigned parameters to block unauthorized internal users from loading pages logically above their paygrade (e.g., blocking standard `gm` from accessing the complete Admin User Management listing).

### 3. API Interceptions (`Services/api.jsx`)

All backend communications abstract via this file. It automatically scopes responses and detects authentication crashes. If the backend throws an unauthorized/logout event, the interceptor forces cleanup on the frontend to prevent phantom sessions.

---

## 📁 Core Directory Structure

```text
src/
├── App.jsx                   # Master configuration of routing and lazy-loading boundaries
├── main.jsx                  # React DOM Injector and highest-level context wrappers
├── Components/
│   ├── Common/               # PrivateRoutes, Loaders, and global Modals
│   ├── UI/                   # Reusable UI Blocks (Cards, Carousels, Tables, ContextMenu)
├── Context/
│   └── AuthContext.jsx       # The brain of user sessions and hierarchy logic
├── Hooks/
│   └── useScrollToTop.jsx    # Core UI manipulation hooks
├── Layout/
│   ├── MainLayout.jsx        # Public Website Layout
│   ├── AuthLayout.jsx        # Login/Signup Layout
│   └── AdminLayout.jsx       # Dashboard Sidebar Layout
├── Pages/
│   ├── Admin/                # (Lazy-Loaded) Dashboard data tables and content managers
│   ├── Auth/                 # Registration, OTP logic, Passwords
│   └── [...Public Pages]     # Blogs, Provinces, Events, Contact, 404
├── utils/
│   └── consoleGreeting.js    # Browser console terminal — music player, easter eggs, navigation
└── Services/
    └── api.jsx               # Axios connection handlers
```

---

## Technology Stack

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS v4
- **Network Requests:** Axios
- **Notifications:** React Hot Toast
- **Icons & Graphics:** React Icons
- **Extra Tools:** jspdf (printing receipts/certificates), html5-qrcode

---

## Local Development Setup

Follow these steps to safely run the frontend locally:

### 1. Install Dependencies

The project uses `pnpm` as its primary package manager.

```bash
# Navigate to frontend directory
cd frontend-cfc

# Install packages
npm install
```

### 2. Configure Environment Options

Create a `.env` file in the root of the frontend folder.

```bash
# Set backend endpoint (Vite specific variable)
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Server

```bash
# Start Vite development server (usually runs on localhost:5173)
npm run dev

# Build the optimized production bundle
npm run build

# Preview the built production bundle locally
npm start
```

## Best Practices Applied

- Strict catch-all `404` pages ensuring dead-links don't silently loop back to the homepage.
- The repository only stores package metadata, not redundant linting caches or `.env` credential leaks.
- Consistent component abstraction limits React render-tree cascading.

---

<div align="center">
  <a href="https://sajilodigital.com.np" target="_blank">
    <img src="./public/sajilodigital.png" alt="Sajilo Digital" width="200" />
  </a>
  <br />
  <p><b>Developed & Maintained by <a href="https://sajilodigital.com.np" target="_blank">Sajilo Digital</a></b></p>
</div>
