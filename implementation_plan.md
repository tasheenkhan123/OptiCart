# OptiCart Full-Stack Architecture Foundation

OptiCart is an AI-powered multi-merchant shopping and purchase-optimization agent designed to optimize shopping across multiple product categories (skincare, electronics, fashion, gaming, groceries, etc.) with 3 core strategies (*Best Value*, *Best for Your Brands*, and *Maximum Savings*).

This plan sets up a clean, scalable, git-friendly full-stack foundation without premature implementations of AI APIs, real merchant scrapers, or Razorpay checkout.

---

## Architecture Overview

```
OptiCart/
├── client/                     # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── assets/             # Brand logos & graphics
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Buttons, Badges, Cards, Inputs
│   │   │   ├── chat/           # Chat container, Message bubble, Strategy cards
│   │   │   └── layout/         # Header/Navbar, StatusIndicator
│   │   ├── pages/              # Landing / Main Chat Page
│   │   ├── services/           # Axios/Fetch API client & Health checker
│   │   ├── types/              # TypeScript definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind + Custom Design System
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # Environment configs & CORS options
│   │   ├── controllers/        # Request handlers (Health controller)
│   │   ├── routes/             # Route definitions (Health & API router)
│   │   ├── services/           # Placeholder service layers (AI, Merchant, Optimizer)
│   │   ├── data/               # Mock data directory for hackathon dataset
│   │   ├── middleware/         # Logging, Error handling, CORS
│   │   ├── utils/              # Response wrappers & loggers
│   │   └── server.ts           # Express server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── package.json                # Root workspaces / concurrent runner
├── .gitignore                  # Clean ignores for node_modules, .env, build dirs
└── README.md                   # Setup guide and architecture overview
```

---

## Proposed Changes

### 1. Root Workspace Configuration
- `package.json`: Root runner with scripts (`npm run dev`, `npm run dev:client`, `npm run dev:server`, `npm run build`, `npm run install:all`) using `concurrently`.
- `.gitignore`: Comprehensive gitignore preventing `.env`, `.env.local`, `node_modules`, `dist/`, `build/`, `*.log`, and OS artifacts.
- `README.md`: Complete documentation on setup, directory structure, environment variables, and starting both servers.

### 2. Backend (Server)
- Setup Express with TypeScript, CORS, dotenv, and helmet for security.
- Health Check Endpoint: `GET /api/health` returning system status, timestamp, service readiness, and version.
- Placeholder structure for upcoming modules:
  - `src/services/ai/` (Gemini integration placeholder)
  - `src/services/merchant/` (Multi-merchant aggregator placeholder)
  - `src/services/optimizer/` (Purchase strategy & basket optimization placeholder)
  - `src/data/` (Local mock merchant/product data placeholder)
- `.env.example` and `src/config/env.ts` for type-safe environment variable parsing.

### 3. Frontend (Client)
- Setup React 18 + Vite + TypeScript + Tailwind CSS + Lucide Icons.
- Design System:
  - Sleek modern dark/glassmorphic palette with vibrant indigo/violet/emerald accents.
  - Category tags (Electronics, Skincare, Gaming, Groceries, Fashion, Phones, etc.).
  - Strategy highlights preview (*Best Value*, *Best for Your Brands*, *Maximum Savings*).
  - Navigation bar with OptiCart branding and a live backend connectivity status pill.
  - Central conversational shopping hero prompt with input bar, starter prompts, and clean modular layout.
- API Client:
  - `src/services/api.ts` connecting to backend health check with automated retry and status banner.

---

## Verification Plan

### Automated / Command Line Checks
1. Backend build & startup: `npm run dev:server` -> check `http://localhost:5000/api/health` returns `{ status: "healthy", ... }`.
2. Frontend build & startup: `npm run dev:client` -> verify Vite compiles and dev server launches on `http://localhost:5173`.
3. Root concurrent command: `npm run dev` boots both client and server simultaneously.

### Manual Verification in Browser
- Open `http://localhost:5173` in browser.
- Verify:
  - OptiCart branding in header.
  - Backend Status pill indicates "Backend Connected (Healthy)".
  - Central AI conversation area is responsive, clean, and interactive.
  - Category selector & strategy chips are displayed cleanly.
