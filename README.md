# Portfolio Monorepo

This repository is a personal portfolio monorepo containing a web site, an Expo app, a backend API, and several project pages and assets.

**Overview**

- **Purpose:** Source for a portfolio site and companion apps showcasing projects and skills.
- **Contents:** Static web frontend, mobile app, a small Node.js API, project folders, and build scripts.

**Repository Structure**

- [about-me](about-me) — Markdown content and assets used across builds.
- [backend-api](backend-api) — Minimal Node.js backend serving portfolio data and APIs.
- [front-app](front-app) — Expo / React Native application (mobile) and example app.
- [front-web](front-web) — Vite + React web frontend (production site).
- [projects](projects) — Individual project folders and README files.
- [scripts](scripts) — Utility scripts (e.g., `compile-portfolio.js`).

**Quick Start (Prerequisites)**

- Node.js (v16+ recommended)
- npm or yarn
- For `front-app`: Expo CLI (`npm install -g expo-cli`) or use `npx expo`

**Run Backend (development)**

```bash
cd backend-api
npm install
npm start
```

The backend reads sample data from [backend-api/data/portfolioData.js](backend-api/data/portfolioData.js).

**Run Frontend (web, development)**

```bash
cd front-web
npm install
npm run dev
```

Open the local dev server (usually http://localhost:5173) to view the site.

**Run Front App (Expo)**

```bash
cd front-app
npm install
npx expo start
```

Follow the Expo instructions to run on a simulator or a physical device.

**Build (production)**

- Front-web:

```bash
cd front-web
npm run build
```

- Front-app: follow Expo build/eas instructions if producing a native binary.
- Backend: deploy `backend-api` to your Node host or serverless platform.

**Data & Assets**

- Primary portfolio data sources:
  - [backend-api/data/portfolioData.js](backend-api/data/portfolioData.js)
  - [front-web/src/data/portfolioData.js](front-web/src/data/portfolioData.js)
- Content in the `about-me` and `front-web/public/about` folders is used for static pages.

**Scripts**

- `scripts/compile-portfolio.js` — helper script to prepare or compile portfolio data for the site.

**Contributing**

- Open an issue or submit a pull request with changes.
- Run relevant apps locally to validate changes before submitting.

**License**

This repository does not include a LICENSE file. Add one (e.g., MIT) if you want to make licensing explicit.

---

If you want, I can: add a `LICENSE`, expand setup instructions with exact Node/npm versions, or add CI and deployment notes.