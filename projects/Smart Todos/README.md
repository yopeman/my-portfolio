The **smart-todo-app** is an ambitious, AI-powered project management platform designed to go far beyond a simple to-do list. It's a full-stack application that leverages AI to automate project creation and task updates, generate reports, and even enable voice interactions. It's built as a modern, collaborative workspace with role-based access control.

### Key Features & Business Rules
*   **AI-Powered Management**: The core differentiator is its deep integration of AI. The app can create and update projects and tasks based on user prompts. It can also automatically generate reports on project progress.
*   **Voice Interaction**: Users can communicate with the AI using Speech-to-Text (STT) and Text-to-Speech (TTS), allowing for a hands-free experience.
*   **Collaboration & Permissions**: The platform supports multi-user collaboration. Project owners can manage privileges for shared projects, assigning roles like `admin`, `editor`, or `viewer` to other users.
*   **Authentication**: It uses **OAuth 2.0** with Google as the provider for secure and streamlined user login.
*   **Notifications**: The system can send notifications to users.
*   **Decentralized System**: Interestingly, the project is designed without an admin role, emphasizing a user-driven model.

### Technology Stack
The project is built with a modern, full-stack architecture:

*   **Backend API**: Built with **Node.js**, **Express**, and **Apollo Server** using **TypeScript**. It exposes a **GraphQL API** for flexible data fetching.
*   **AI Engine**: Integrates **Ollama** for local LLM capabilities, combined with **LangChain** and **LangGraph** to orchestrate complex AI workflows.
*   **Database**: Uses **PostgreSQL** as the primary database with **Sequelize** as the ORM.
*   **Frontend (Web)**: Built with **React**, using **Apollo Client** for GraphQL communication and **Tailwind CSS** for styling.
*   **Mobile App**: A cross-platform mobile app built with **React Native** and **Expo**, using **NativeWind** (Tailwind for React Native).
*   **Other Services**: Uses **Node mailer** for emails and **Passport.js** with the Google OAuth 2.0 strategy for authentication.

### Database Schema
The data model is well-thought-out for a project management tool, featuring soft deletes (`is_deleted`, `deleted_at`) on all entities.

*   **Users**: Standard fields like `id`, `email`, `name`, `avatar`, plus OAuth provider details (`provider`, `provider_id`).
*   **Projects**: Includes an `owner_id`, `priority` (1-5), an **`urgent important matrix`** for task prioritization, `success_criteria`, `is_public`, `start_date`, `end_date`, and a `status` (`todo | in_progress | done`).
*   **Tasks**: Belongs to a `project_id` and has its own `title`, `description`, `status`, `order_weight`, and `due_date`.
*   **Subtasks**: Nested under `task_id`, with similar fields to tasks (`title`, `description`, `status`, etc.).
*   **Project Members**: A join table linking `project_id` and `user_id` with a specific `role` (`admin | editor | viewer`).
*   **Project History**: An audit log tracking changes (`create | update | delete | status change`) to `project` or `task` entities, including a `change_summary` and who made the change.
*   **AI Interaction**: Stores the `prompt`, `response`, and `action_type` (`create | edit | report`) for each AI interaction, linked to a `user_id` and optionally a `project_id`.

### Project Structure
The repository is organized into two main directories:

*   `backend/`: Houses the Node.js/Express/GraphQL server.
*   `front-web/`: Contains the React web application.

### Current State
*   **Status**: Actively developed, with the latest commit on **March 29, 2026**. It has a history of **60 commits**.
*   **Community**: Has **1 star** and **0 forks**.
*   **Languages**: Primarily written in **TypeScript (65.1%)** and **JavaScript (34.6%)**.
*   **Deployment**: No releases or packages have been published yet.

In short, **smart-todo-app** is a feature-rich, AI-centric project management tool that combines modern web and mobile technologies with a powerful GraphQL API. Its standout features are the deep AI integration for task and project management, voice interaction, and a robust collaboration model.

### Links:
*   **Repositories**: https://github.com/yopeman/smart-todo-app
*   **Website**: https://todo.vercel.app
