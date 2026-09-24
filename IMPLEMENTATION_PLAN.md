# Portfolio Implementation Plan

Monorepo: `backend-api` (Express + MongoDB) and `front-web` (Vite + React + Tailwind CSS v4).

## 1. Context & Goals

- Convert the current single-file Express API (`backend-api/index.js`) and the static-data Vite/React/Tailwind site (`front-web`) into a full-stack portfolio backed by the schema in `db.md`.
- Backend: **Express** + **Mongoose (MongoDB)** with a pluggable file driver (**Cloudinary** or **Local disk**), plus in-memory upload handling (`multer.memoryStorage()` for Cloudinary).
- Frontend: **Vite + React + Tailwind CSS v4** (already set up via `@tailwindcss/vite`).
- Preserve existing features: `/api/chat` (Groq RAG), `/api/contact`, `/api/subscribe`, and existing `portfolioData.js` as seed/fallback data.

## 2. Architecture Overview

```
backend-api/                  front-web/
├── index.js                  ├── src/
├── config/                   │   ├── api/           (axios client + endpoint modules)
│   ├── db.js                 │   ├── contexts/      (AuthContext, Toast)
│   ├── cloudinary.js         │   ├── pages/         (public + admin pages)
│   └── storage.js            │   ├── components/    (existing + shared UI primitives)
├── models/  (10 models)      │   ├── hooks/
├── controllers/              │   └── App.jsx        (router / app shell)
├── routes/
├── middlewares/
├── services/                 (email, chat, file, permission)
└── utils/
```

## 3. Data Model Mapping (from `db.md`)

One Mongoose model file per collection:

| Collection | Model | Key notes |
|---|---|---|
| Users | `User` | role enum (`owner, admin, member, user`), `permissions` map (`users/about/projects/requests/subscribers/blogs/plans → [READ, CREATE, UPDATE, DELETE]`), `source`, bcrypt hash, partial unique index on `email`/`phone` where `deletedAt: null` |
| About | `About` | singleton; embedded `contacts[]`, `skills[]` |
| Projects | `Project` | unique `slug`, `tags[]`, type enum (`product, case study, tutorial`), embedded `features/stacks/links[]` |
| Requests | `Request` | refs user/project, budget range, `timeline[]`, status, timestamps (`readAt`, `repliedAt`) |
| Subscribers | `Subscriber` | partial unique `email`, `unsubscribedAt` |
| Blogs | `Blog` | unique `slug`, type enum (`event, article, blog`), ref author, embedded `links[]`, calc `reading time` |
| Plans | `Plan` | `slug`, period enum, `parentPlan` self-ref, embedded `checklists[]`, `visibility[]` |
| Feedback | `Feedback` | polymorphic `parentEntity/parentId` |
| Reactions | `Reaction` | polymorphic parent, type enum (`like, dislike, love`), unique user+parent |
| Files | `File` | polymorphic parent, driver-agnostic `path/url`, metadata |

Common conventions:
- Soft delete via `deletedAt`; all queries filter `deletedAt: null` by default.
- Partial unique indexes: `{ email: 1 }` / `{ phone: 1 }` / `{ slug: 1 }` with `partialFilterExpression: { deletedAt: null }`.
- `timestamps: true` for `createdAt`/`updatedAt`.
- Ordered embedded lists (features, stacks, links, contacts, skills, checklists) sort by explicit `order` float.

## 4. Backend Implementation

### 4.1 Config & `.env`

- `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- `UPLOAD_DRIVER=local|cloudinary`
- `LOCAL_UPLOAD_DIR` (default `uploads/`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Existing SMTP/Groq settings stay.

### 4.2 Storage service

- `UPLOAD_DRIVER=cloudinary` → `multer.memoryStorage()` + `cloudinary.uploader.upload_stream`; store Cloudinary `secure_url`/`public_id` on the `File` record.
- `UPLOAD_DRIVER=local` → `multer.diskStorage()` into `LOCAL_UPLOAD_DIR`, served via `express.static`.
- Never persist raw buffers to Mongo.
- `File` model stays driver-agnostic (stores `path` and/or `url`), so switching drivers is env-only.

### 4.3 Middlewares

- `auth.middleware.js` — verify JWT, attach `req.user`.
- `authorize.middleware.js` — enforce the permission matrix from `User.permissions` for `resource` × `action` (with role defaults for `owner`).
- `upload.middleware.js` — multer setup (memory or disk) based on driver.
- `error.middleware.js` — centralized error + Mongoose validation error response.
- `pagination.middleware.js` — `page`, `limit`, `sort` from query.

### 4.4 Auth

- `POST /api/auth/register` (role defaults to `user`; only owner/admin can elevate roles)
- `POST /api/auth/login`
- `GET /api/auth/me`, `PATCH /api/auth/me`
- bcrypt password hashing; JWT access token.

### 4.5 REST endpoints

Public GETs are allowed for guests where visibility allows; mutations are gated by permissions.

| Resource | Endpoints |
|---|---|
| About | `GET /api/about`, `PUT /api/about` (singleton) |
| Projects | `GET /api/projects`, `GET /api/projects/:slug`, `POST/PATCH/DELETE /api/projects/:id` |
| Requests | `GET /api/requests` (mine), `GET /api/requests/all` (staff), `POST /api/requests`, `PATCH /api/requests/:id` (read/reply/assign/status) |
| Subscribers | `POST /api/subscribers`, `GET /api/subscribers` (staff), `POST /api/subscribers/:id/unsubscribe` |
| Blogs | `GET /api/blogs`, `GET /api/blogs/:slug`, `POST/PATCH/DELETE /api/blogs/:id` |
| Plans | `GET /api/plans`, `GET /api/plans/:slug`, `GET /api/plans/:slug/checklists`, `POST/PATCH/DELETE /api/plans/:id` |
| Feedback | `GET /api/feedback?entity=&parentId=`, `POST /api/feedback`, `PATCH/DELETE /api/feedback/:id` |
| Reactions | `GET /api/reactions?entity=&parentId=`, `POST /api/reactions` (toggle), `DELETE /api/reactions/:id` |
| Files | `POST /api/files` (multer), `GET /api/files?entity=&parentId=`, `DELETE /api/files/:id` |
| Misc | `/health`, `/api/chat`, `/api/contact`, `/api/subscribe` (kept) |

### 4.6 Feedback & Reactions

- Polymorphic lookup by `{ parentEntity, parentId }` (entity ∈ `about, project, blog, plan`; for reactions also `feedback`).
- Reactions: unique compound index `(parentEntity, parentId, user)`; re-posting toggles type.
- Feedback types: `feedback | comment | reply`.

### 4.7 Seed script

- `scripts/seed.js`: migrate `data/portfolioData.js`, `about-me/*.md`, and `front-web/public/projects/*/README.md` + images into Mongo `About`/`Project`/`File` + `User` (owner). Mirrors the current `scripts/compile-portfolio.js` output.

## 5. Frontend Implementation

### 5.1 Data layer

- `src/api/client.js` — Axios instance with base URL from env (`VITE_API_URL`), JWT interceptor injecting `Authorization` from `AuthContext`, and 401 refresh-to-login.
- Endpoint modules: `auth.js`, `about.js`, `projects.js`, `requests.js`, `subscribers.js`, `blogs.js`, `plans.js`, `feedback.js`, `reactions.js`, `files.js`.
- `src/contexts/AuthContext.jsx` — token persistence (`localStorage`), user/permissions, login/logout.

### 5.2 Routing

- Add `react-router-dom`; `App`/shell keeps existing `Navbar`, `Footer`, `ThemeToggle`.

### 5.3 Public pages

- Home (Hero + featured projects)
- About (About/Contacts/Skills from `/api/about`)
- Projects list + Project detail (by slug)
- Blogs list + Blog detail (by slug)
- Contact (posts a `Request`; keeps `/api/contact` email)
- Subscriber form (`/api/subscribers`)
- Chatbot (existing)
- Feedback/comments + reactions on Projects and Blogs

### 5.4 Admin pages (`/admin`, route-guarded by role/permission)

- Dashboard, Users, Projects, Blogs, Plans, Requests, Subscribers, About editor, Files manager — CRUD against the API.

### 5.5 Resilience

- If `/api` is unreachable, public pages fall back to existing `src/data/portfolioData.js` (offline/static mode) so the current site never breaks.

## 6. Implementation Phases

| # | Phase | Deliverable |
|---|---|---|
| 0 | Scaffolding & config | env, DB connection, storage driver, error handling |
| 1 | Models + indexes | all 10 Mongoose models per `db.md` |
| 2 | Auth + permissions | register/login/me, JWT, `authorize` middleware |
| 3 | Core CRUD APIs | about, projects, requests, subscribers, blogs, plans |
| 4 | File uploads | local + Cloudinary drivers, `File` model |
| 5 | Feedback & Reactions | polymorphic APIs |
| 6 | Seed script | migrate existing portfolio data & assets |
| 7 | Frontend data layer | axios client, AuthContext, routing |
| 8 | Public pages | home/about/projects/blogs/contact/subscribe/feedback |
| 9 | Admin dashboard | guarded CRUD UIs |
| 10 | Testing & polish | seed checks, lint (`npm run lint`), build, README update |

## 7. Dependencies to Add

- Backend: `mongoose`, `jsonwebtoken`, `bcryptjs`, `multer`, `cloudinary`, `express-rate-limit` (existing installed set is kept).
- Frontend: `react-router-dom`, `axios` (existing Vite/Tailwind/React 19 set is kept).

## 8. Risks / Notes

- React 19 + Tailwind v4 already present — keep versions aligned with Vite 8.
- All 10 collections are implemented at the model level; admin screens are built in priority order (Projects, Blogs, Requests, Subscribers, About, Plans, Users, Files).
- Keep `/api/chat`, `/api/contact`, `/api/subscribe` working during migration; `/api/subscribe` mirrors to the `Subscriber` model while retaining email send.