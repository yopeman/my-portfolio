The **AI-Powered Learning Platform (AiPLP)** is a comprehensive, full-stack educational ecosystem designed to integrate AI into the learning experience. It serves multiple user roles with distinct interfaces, including students, teaching assistants, and administrators.

Here's a breakdown of its main components and features:

### 🏗️ Core Architecture & Components
The platform is made up of five main applications:

1.  **Express Backend Server** (`Express/`): A Node.js/Express API server handling all backend operations. Key responsibilities include:
    *   **Authentication & Authorization**: Uses JWT with role-based access control (admin, assistant, student).
    *   **Database**: Uses MySQL with Sequelize ORM to manage users, courses, subscriptions, payments, and more.
    *   **AI Integration**: Leverages OpenAI and Google GenAI to generate educational content and answer questions.
    *   **Other Functions**: Handles payment processing (via Chapa), a certification system with quiz generation, and file management.

2.  **Expo Mobile App** (`Expo/`): A React Native app for students on both iOS and Android. It features:
    *   **Learning Interface**: For browsing fields, courses, and topics.
    *   **Interactive AI**: An AI-powered Q&A system.
    *   **Other Features**: In-app payments, quizzes with downloadable certificates, dark/light mode, and offline caching.

3.  **Admin Dashboard** (`React/admin-dashboard/`): A React web app for administrators to manage users, content, teaching assistants, payments, feedback, and view analytics.

4.  **Assistant Dashboard** (`React/assistant-dashboard/`): A React web app for teaching assistants to create and manage courses, chapters, and topics for their assigned fields.

5.  **Landing Page** (`React/landing-page`): A marketing site with a hero section, feature showcases, and calls-to-action.

### ✨ Key Features
*   **Multi-Role System**: Distinct interfaces and permissions for students, assistants, and administrators.
*   **AI-Powered Content**: Automatic generation of educational materials and Q&A responses.
*   **Freemium Model**: Free access to some topics, with premium content available for purchase.
*   **Certification System**: AI-generated quizzes with downloadable certificates.
*   **Payment Integration**: Secure payments via the Chapa gateway.
*   **Real-Time Learning**: Interactive Q&A with an AI tutor.
*   **Progress Tracking & Analytics**: Tools for monitoring learning progress and detailed admin metrics.

### 🛠️ Technology Stack
*   **Backend**: Node.js, Express, Sequelize (ORM).
*   **Frontend (Web)**: React.
*   **Mobile**: React Native (Expo).
*   **Database**: MySQL.
*   **AI**: OpenAI, Google GenAI.
*   **Payments**: Chapa payment gateway.

In short, AiPLP is a full-featured, AI-driven learning management system with dedicated interfaces for different user types, integrating content generation, payment processing, and certification into a single platform.

### Links:
*   **Repositories**: https://github.com/yopeman/AI_Powered_Learning_Platform
*   **Website**: https://aiplp.vercel.app
