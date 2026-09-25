# Portfolio Monorepo

Personal portfolio monorepo: a full-stack web site (Vite + React), an Express + MongoDB API, an Expo app, and per-project pages/assets.

**Overview**

- **Purpose:** Source for a portfolio site and companion apps showcasing projects and skills.
- **Architecture:** `front-web` (React 19 / Tailwind v4 / Vite) talks to `backend-api` (Express 5 + Mongoose) which persists to MongoDB. See `IMPLEMENTATION_PLAN.md` for the phased build (all 10 phases complete) and `db.md` for the 10-collection schema.

**Repository Structure**

- [about-me](about-me) — Markdown content and assets used across builds.
- [backend-api](backend-api) — Express + MongoDB API (`models`, `controllers`, `routes`, `services`, `middlewares`, `utils`, `config`).
- [front-app](front-app) — Expo / React Native application (mobile) and example app.
- [front-web](front-web) — Vite + React web frontend (production site) with public pages and a guarded `/admin` dashboard (projects, blogs, requests, subscribers, users, about, plans, files).
- [projects](projects) — Individual project folders and README files.
- [scripts](scripts) — Utility scripts (e.g., `compile-portfolio.js`).

**Prerequisites**

- Node.js (v16+ recommended)
- MongoDB running locally (default `mongodb://127.0.0.1:27017/portfolio`), or set `MONGODB_URI`
- npm

**Run Backend (development)**

```bash
cd backend-api
npm install
cp .env.example .env   # fill in secrets (JWT_SECRET required)
npm run seed           # idempotent: creates owner + about + 13 projects + files
npm start              # http://localhost:5000
```

The API serves `/api/about`, `/api/projects`, `/api/blogs`, `/api/plans`, `/api/requests`, `/api/subscribers`, `/api/auth`, `/api/users`, `/api/files`, `/api/feedback`, `/api/reactions`, plus `/api/contact`, `/api/subscribe`, `/api/chat`.

Default seeded owner login: `owner@test.com` / `ownerpass123` (overridable via `SEED_OWNER_*` in `.env`).

**Run Frontend (web, development)**

```bash
cd front-web
npm install
npm run dev            # http://localhost:5173
```

By default the frontend calls `http://localhost:5000`. Override with `VITE_API_URL` if the API runs elsewhere.

Sign in as the owner (or any user with a staff role) and open `/admin` for the CRUD dashboard.

**Run Front App (Expo)**

```bash
cd front-app
npm install
npx expo start
```

**Build & checks (production)**

```bash
cd front-web
npm run lint           # eslint (expects 0 errors)
npm run build          # vite production build to dist/
```

Backend: deploy `backend-api` to your Node host or serverless platform. Set `UPLOAD_DRIVER` to `local` (default) or `cloudinary` (needs `CLOUDINARY_*`).

**Data & Assets**

- MongoDB is the source of truth once seeded; `scripts/seed.js` migrates existing portfolio data and assets (idempotent).
- Static fallbacks still ship in [front-web/src/data/portfolioData.js](front-web/src/data/portfolioData.js) for offline/guest rendering.

**Scripts**

- `backend-api` `npm run seed` — idempotent migration of portfolio data into MongoDB.
- `scripts/compile-portfolio.js` — helper script to prepare or compile portfolio data.

**License**

This repository does not include a LICENSE file. Add one (e.g., MIT) if you want to make licensing explicit.