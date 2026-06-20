The `entrance_exam_app` is a backend-focused, AI-powered platform designed to help students prepare for entrance exams. It's built to be a smart study assistant, capable of ingesting educational materials and using them to generate practice exams, grade answers, and provide interactive help.

### 🎯 Core Purpose
The main goal is to provide an intelligent tutoring system. It allows users to upload study materials (like PDFs or documents), which the system then analyzes. Based on this content, it can automatically generate practice exams, evaluate a student's answers, and even offer an AI chat feature for interactive learning.

### ✨ Key Features
*   **AI-Generated Exams**: The core feature is its ability to automatically create practice exams and quizzes from uploaded study materials, pulling questions directly from the provided content.
*   **Automated Answer Evaluation**: Once a student submits their answers, the system uses AI to evaluate them and provide feedback.
*   **Interactive AI Chat**: Students can start a chat session to ask questions about the exam material or get clarifications, making learning more interactive.
*   **Document Ingestion**: The platform can process various file types, including PDFs, Word documents, PowerPoint presentations, Excel sheets, and images. It extracts text and even images from these files to build a comprehensive knowledge base.

### 🏗️ Architecture & Technology Stack
The project is structured as a robust backend API service.

*   **Backend Framework**: Built with **FastAPI**, a modern Python web framework.
*   **Database**: Uses a combination of a **relational database** (likely SQLite or PostgreSQL, based on SQLAlchemy) for user and profile data, and **Qdrant**, a vector database, for storing and searching the embedded content from study materials.
*   **AI & Machine Learning**: Heavily relies on **LangChain** and **Google's Generative AI** to power its core functions like exam generation, answer evaluation, and the chat interface. It also uses **EasyOCR** for extracting text from images.
*   **Data Processing**: The project includes utilities to extract data from a wide range of file formats, making it versatile for handling different types of study materials.

### 📁 Project Structure
The backend is organized into a clear MVC-like structure:
*   `app/`: The main application directory.
*   `app/config/`: Holds configuration files for the database, AI models, and settings.
*   `app/controller/`: Contains the business logic for different features like exams, quizzes, and chat.
*   `app/model/`: Defines the data models for users, profiles, chats, and more.
*   `app/router/`: Defines the API endpoints (e.g., `/exams`, `/quizzes`, `/chats`).
*   `app/util/`: Houses helper functions for AI tasks, file processing, and embedding.

In short, `entrance_exam_app` is a sophisticated backend service that leverages modern AI and vector database technologies to create a personalized and interactive exam preparation tool.

### Links:
*   **Repositories**: https://github.com/yopeman/entrance_exam_app
*   **Website**: https://entrance.vercel.app
