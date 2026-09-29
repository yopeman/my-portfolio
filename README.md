# Portfolio Monorepo

Personal portfolio monorepo with a Vite + React website, Express + MongoDB API, and Expo companion app.

## Architecture

- `backend-api` — Express 5 + Mongoose API for portfolio content, authentication, files, feedback, and admin operations.
- `front-web` — Vite + React public site and guarded admin dashboard.
- `front-app` — Expo / React Native companion app.
- MongoDB is the sole source of truth for About, Projects, and file metadata.

## Prerequisites

- Node.js
- MongoDB running locally at `mongodb://127.0.0.1:27017/portfolio`, or configured through `MONGODB_URI`
- npm

## Backend

```bash
cd backend-api
npm install
cp .env.example .env
npm run seed
npm start
```

`npm run seed` only bootstraps the owner configured by `SEED_OWNER_*`. About and Projects must be created through the authenticated admin API or dashboard.

The API exposes `/api/about`, `/api/projects`, `/api/blogs`, `/api/plans`, `/api/requests`, `/api/subscribers`, `/api/auth`, `/api/users`, `/api/files`, `/api/feedback`, `/api/reactions`, `/api/contact`, `/api/subscribe`, `/api/ai`, and `/api/chat`.

`POST /api/ai/enhance` rewrites About, Project, or Blog form values with the LLM and returns the improved values. It never writes to the database — the admin dashboard applies the response to the form so you can review and undo it before saving. It requires the same `UPDATE` permission as editing that content, and `GROQ_API_KEY` must be set.

## Frontend

```bash
cd front-web
npm install
npm run dev
```

The frontend uses `http://localhost:5000` by default. Set `VITE_API_URL` when the API runs elsewhere.

## Expo App

```bash
cd front-app
npm install
npx expo start
```

## Checks

```bash
cd front-web
npm run lint
npm run build
```

The backend currently has no automated test, lint, or typecheck script.

## Data and Files

- Public content is loaded from MongoDB through the API; there are no static portfolio fallbacks.
- File metadata is stored in MongoDB. Uploaded binaries use the configured local or Cloudinary storage driver.
- The current public site has no About or Project images and does not expose resume or transcript links.
