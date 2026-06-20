Based on the repository, **Final-Year-Project_Fidel-AI** (also known as **Fidel AI**) is a comprehensive, full-stack language learning platform. It's designed to be a complete ecosystem for language education, featuring a web frontend, a mobile app, and a powerful backend, all integrated with AI capabilities.

### 🎯 Core Purpose
Fidel AI aims to help users master new languages through a blend of **interactive lessons**, **AI-powered tutoring**, and **community engagement**. It's structured as a multi-platform application to serve learners on the web, on mobile, and to provide administrative tools for managing the platform.

### ✨ Key Features
The platform is packed with features that fall into several categories:

*   **Learning Management System (LMS)**: Offers structured language courses with multimedia content, tracks progress in reading, writing, speaking, and listening, and allows users to generate and share achievement certificates.
*   **AI-Powered Features**: Includes a chatbot for free-form language practice, real-time translation with pronunciation, smart feedback on exercises, and personalized learning paths that adapt to user performance.
*   **Content & Community Management**: Features a vocabulary builder, curated reading materials, YouTube video integration, learning groups (batches), community forums, peer feedback systems, and instructor management tools.
*   **Communication & Business Tools**: Offers real-time WebSocket-based chat, push notifications, secure payment processing, student enrollment management, class scheduling, and automated attendance tracking.

### 🏗️ Architecture & Technology Stack
Fidel AI is built with a modern, service-oriented architecture.

*   **Backend API**: Built with **FastAPI (Python 3.12+)** and uses **MySQL** with **SQLAlchemy ORM** for data persistence. It exposes a **GraphQL API** using the **Ariadne** library and handles authentication via **JWT**.
*   **AI Integration**: Leverages **LangChain** and **Ollama** for various AI features, including the chatbot, translation, and content generation.
*   **Web Frontend**: Built with **React 18**, using **Vite** as the build tool, **Tailwind CSS** for styling, and **Apollo Client** to communicate with the GraphQL API.
*   **Mobile App**: Developed with **React Native** and **Expo**, using **React Navigation** and **NativeWind** (Tailwind for React Native) for a consistent look and feel.
*   **Real-time Features**: Uses **WebSockets** with a broadcaster for real-time chat and notifications.

### 📁 Project Structure
The repository is organized into clear directories for each component:
*   `backend-api/`: The core FastAPI server.
*   `frontend-web/`: The React web application.
*   `mobile-app/`: The React Native mobile application.

### 🧪 Testing & Deployment
The project includes a comprehensive test suite with **over 141 passing tests** covering authentication, GraphQL resolvers, utilities, and integration. For deployment, it supports **Docker** containers and includes environment-specific configuration.

In short, **Fidel AI** is an ambitious, full-featured language learning platform that combines modern web and mobile technologies with AI to create a personalized and community-driven educational experience. You can see a live demo at [fidelai.vercel.app](https://fidelai.vercel.app).

### Links:
*   **Repositories**: https://github.com/yopeman/Final-Year-Project_Fidel-AI
*   **Website**: https://fidelai.vercel.app
