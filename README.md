# OptiCart 🛒⚡

> **AI-Powered Multi-Merchant Shopping & Purchase-Optimization Agent**

OptiCart is an intelligent shopping agent that determines the smartest way for users to purchase products across multiple trusted merchants. Rather than just returning the cheapest item, OptiCart optimizes basket-level decisions based on user budget, preferred brands, delivery urgency, merchant reliability, product compatibility, and applicable Razorpay payment benefits.

---

## 🌟 Core Purchase Strategies

1. **Best Value**: Optimal balance between price, merchant trust score, rating, warranty, and overall performance.
2. **Best for Your Brands**: Prioritizes user-specified preferred brands and ecosystem compatibility while filtering out excluded brands.
3. **Maximum Savings**: Aggressively optimizes net checkout price combining lowest prices, multi-item basket optimization, and Razorpay card/UPI offers.

---

## 🏗 Project Architecture

```
OptiCart/
├── client/                     # Frontend (React 18 + Vite + TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Badges, Status Indicators, UI primitives
│   │   │   ├── chat/           # Conversational AI prompt hero, Category chips, Strategy cards
│   │   │   └── layout/         # Header/Navbar, Footer
│   │   ├── pages/              # Views (HomePage)
│   │   ├── services/           # Backend API client & health check
│   │   ├── types/              # TypeScript declarations
│   │   ├── App.tsx             # Root layout & connectivity management
│   │   ├── main.tsx            # React DOM mounting
│   │   └── index.css           # Tailwind + Glassmorphic Design System
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                     # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # Environment variables & CORS policy
│   │   ├── controllers/        # Request handlers (Health controller)
│   │   ├── routes/             # REST endpoints (/api/health, /api/...)
│   │   ├── services/           # Modular service layers
│   │   │   ├── ai/             # Gemini LLM intent parsing placeholder
│   │   │   ├── merchant/       # Multi-merchant catalog aggregator placeholder
│   │   │   └── optimizer/      # 3-Strategy optimization engine placeholder
│   │   ├── data/               # Category-independent mock products catalog
│   │   ├── middleware/         # Request logging & error handling
│   │   ├── types/              # Domain TypeScript types
│   │   ├── utils/              # Standardized API response formatters
│   │   └── server.ts           # Express server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── .gitignore                  # Git secrets & artifact rules
├── package.json                # Root scripts runner
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Install Dependencies
Run the installation command from the root directory to install dependencies for root, backend, and frontend:

```bash
npm run install:all
```

*(Alternatively, run `npm install` in the root, `cd server && npm install`, and `cd ../client && npm install`)*

### 2. Configure Environment Variables
Copy `.env.example` templates to `.env`:

```bash
# Server env
cp server/.env.example server/.env

# Client env
cp client/.env.example client/.env
```

Default local ports:
- **Backend API**: `http://localhost:5000`
- **Frontend Client**: `http://localhost:5173`

### 3. Run Development Servers
From the root directory, start both the backend server and frontend client concurrently:

```bash
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1: Backend Server
npm run dev:server

# Terminal 2: Frontend Client
npm run dev:client
```

---

## 📡 API Endpoints

### Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "success": true,
  "message": "OptiCart API service is operational",
  "data": {
    "status": "healthy",
    "service": "OptiCart Backend API",
    "version": "0.1.0",
    "timestamp": "2026-09-04T20:00:00.000Z",
    "uptimeSeconds": 42,
    "environment": "development"
  },
  "timestamp": "2026-09-04T20:00:00.000Z"
}
```

---

## 🔒 Security & Secrets Management
- All sensitive variables (`.env`, `*.env`) are strictly excluded in `.gitignore`.
- Express backend is secured with `helmet` headers and scoped `cors` origin rules.
