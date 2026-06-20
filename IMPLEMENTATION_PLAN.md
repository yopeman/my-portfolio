# Yohanes Debebe's Portfolio Implementation Plan

This plan details the implementation of a modern, premium portfolio website for Yohanes Debebe, featuring:
1. A clean, responsive React & Tailwind CSS frontend (`front-web`).
2. A tri-state theme system (Light, Dark, and Night/OLED Black).
3. A floating AI Chatbot widget that acts as Yohanes' digital assistant.
4. An Express.js backend (`backend-api`) to send emails via `nodemailer` (for contact and subscription forms) and power the chatbot using LangChain and Ollama (model `qwen2.5:0.5b`).

---

## User Review Required

We need your confirmation/input on the following key decisions:
1. **Tailwind CSS version**: Do you prefer Tailwind CSS v3 (standard config file) or Tailwind CSS v4 (new CSS-first engine)? We recommend Tailwind CSS v4 for better performance and alignment with modern CSS standards.
2. **Email credentials setup**: For `nodemailer` in the backend, you will need to add SMTP credentials (host, port, user, password) to `/backend-api/.env`. Do you have a Gmail App Password or custom SMTP credentials ready?
3. **Ollama model installation**: The chatbot expects `qwen2.5:0.5b` to be running on your local Ollama instance (`ollama run qwen2.5:0.5b`). Please ensure Ollama is installed and running on port `11434` (default).

---

## Open Questions

> [!IMPORTANT]
> - Which version of Tailwind CSS should we configure for `front-web` (v3 or v4)?
> - Do you want the email contact form data sent using a specific email service provider (like Gmail, SendGrid, etc.), or should we write a generic SMTP configuration?

---

## Proposed Changes

We will build the application in two modules: the React frontend in [front-web](file:///home/yope/.projects/code/portfolio/front-web) and the Express backend in [backend-api](file:///home/yope/.projects/code/portfolio/backend-api).

### Frontend: [front-web](file:///home/yope/.projects/code/portfolio/front-web)

We will install Tailwind CSS and other helpful UI packages (like `lucide-react` for icons, `markdown-to-jsx` for rendering markdown project write-ups and chatbot responses).

#### [MODIFY] [package.json](file:///home/yope/.projects/code/portfolio/front-web/package.json)
- Add Tailwind CSS and its Vite plugin (or configuration).
- Add dependencies: `lucide-react`, `canvas-confetti` (for interactive submission celebrations), and `markdown-to-jsx`.

#### [MODIFY] [index.html](file:///home/yope/.projects/code/portfolio/front-web/index.html)
- Add inline script to detect color scheme from `localStorage` or `prefers-color-scheme` to prevent Flash of Unstyled Content (FOUC).
- Inject modern typography fonts (e.g., *Plus Jakarta Sans* or *Outfit* from Google Fonts).

#### [MODIFY] [src/index.css](file:///home/yope/.projects/code/portfolio/front-web/src/index.css)
- Set up the design system using CSS variables supporting three themes:
  - **Light mode**: Clean, light gray/indigo accents (`color-scheme: light`).
  - **Dark mode**: Sophisticated dark gray/violet accents (`color-scheme: dark`).
  - **Night mode**: Jet black (OLED) background with vibrant purple/neon accents (`color-scheme: dark`, background `#000000`).
- Define premium styles: backdrop-filter glassmorphism, glowing borders, custom scrollbar styling, hover transitions, and chatbot typing bubble animations.

#### [NEW] [src/components/ThemeToggle.jsx](file:///home/yope/.projects/code/portfolio/front-web/src/components/ThemeToggle.jsx)
- A tri-state toggle selector that cycles through `light` -> `dark` -> `night` modes.
- Persists user preferences to `localStorage` and appends `theme-light`, `theme-dark`, or `theme-night` to the `document.documentElement` class list.

#### [NEW] [src/components/Chatbot.jsx](file:///home/yope/.projects/code/portfolio/front-web/src/components/Chatbot.jsx)
- Floating widget in the bottom-right corner.
- Offers clickable quick-questions (e.g., "What are Yohanes' technical skills?", "Tell me about the Yope AI project").
- Displays custom message bubbles with streaming-like text animations.
- Connects to backend `/api/chat` endpoint and supports conversation history in state.

#### [NEW] [src/components/Projects.jsx](file:///home/yope/.projects/code/portfolio/front-web/src/components/Projects.jsx)
- Interactive grid of the 11 projects parsed from the local directories.
- Click-to-open detailed project viewer (modal) with:
  - Slide/carousel showing project screenshots in `projects/[name]/assets/`.
  - Rich project readme description rendered dynamically with Markdown parser.
  - Project meta info (tags/stack, repo links, website links).

#### [MODIFY] [src/App.jsx](file:///home/yope/.projects/code/portfolio/front-web/src/App.jsx)
- Assemble page sections into a cohesive, single-page application layout:
  - **Navbar**: Logo, navigation links, and theme toggle.
  - **Hero**: Introduce Yohanes with a premium typing effect, highlight statistics (CGPA, degree year), and feature a call to action.
  - **About Me**: Brief bio, embedding the Youtube video link as a playable component.
  - **Skills**: categorized listing of languages, frameworks, DBs, and tools with beautiful progress/badge indicators.
  - **Projects**: The interactive projects grid.
  - **Contact & Subscription Form**: Integrates with the backend nodemailer service, handling loading states and success/error animations.

---

### Backend: [backend-api](file:///home/yope/.projects/code/portfolio/backend-api)

We will configure an Express.js server, loading biography data from `about-me/` and projects metadata from `projects/` at startup to contextualize the LangChain + Ollama model.

#### [MODIFY] [package.json](file:///home/yope/.projects/code/portfolio/backend-api/package.json)
- Add dependencies: `express`, `cors`, `dotenv`, `nodemailer`, `@langchain/ollama`, `@langchain/core`.
- Add `npm run dev` script using `node --watch` (available in Node.js 18+ / 20+).

#### [NEW] [index.js](file:///home/yope/.projects/code/portfolio/backend-api/index.js)
- Express entrypoint initializing middleware (`cors`, `express.json`).
- Reads all files inside `/about-me/` and `/projects/` on startup. Combines them into a concise, contextual profile database.
- Registers routes:
  1. `POST /api/contact`: sends details (Name, Email, Message) using nodemailer SMTP transporter.
  2. `POST /api/subscribe`: sends subscribe confirmation.
  3. `POST /api/chat`: receives user message and conversation history. Invokes LangChain `ChatOllama` with the local model `qwen2.5:0.5b`. Uses a system template containing Yohanes' bio and project summaries, prompting the AI to stay in character.

#### [MODIFY] [.env](file:///home/yope/.projects/code/portfolio/backend-api/.env)
- Environment keys setup:
  - `PORT=5000`
  - `OLLAMA_BASE_URL=http://localhost:11434`
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_USER=your-email@gmail.com`
  - `SMTP_PASS=your-app-password`
  - `RECEIVER_EMAIL=yopeman318@gmail.com`

---

## Verification Plan

### Automated Tests
- Run `npm run build` on `front-web` to verify standard JSX/JS syntax and bundle output structure.
- Run static checks and eslint on frontend code.

### Manual Verification
1. **Theme Switcher**: Ensure light, dark, and night modes load correct colors and backgrounds (especially OLED black for night mode) and sync with local storage on page refresh.
2. **Contact & Newsletter Form**: Verify that submit operations show loading spinners, success message, and successfully dispatch emails through Nodemailer logs.
3. **Chatbot widget**: Verify chatbot triggers connection to Ollama model. Try queries like "What did Yohanes study?" and "What is Yope AI project?" to check if it correctly retrieves background details from context files.
