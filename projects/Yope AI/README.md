**Yope AI** is a web-based intelligent assistant designed to help with daily tasks like scheduling, finding information, and having casual conversations. It's built as a full-stack application combining a Python backend with a JavaScript frontend.

### 🎯 Core Purpose
The project aims to provide a friendly, AI-powered companion that streamlines productivity through natural language interactions. It can offer personalized recommendations, manage appointments, retrieve information quickly, and engage in casual conversation.

### ✨ Key Features
*   **User Authentication**: The application supports user registration, login, logout, and password change functionality, with session management.
*   **AI-Powered Chat**: Users can start new chat sessions or continue existing ones. The AI generates responses using the Google Gemini API.
*   **Conversation History**: Each user's chat sessions and individual messages are stored in a MySQL database, allowing for context-aware conversations.
*   **Markdown Support**: AI responses are rendered with Markdown support, making the output more readable.

### 🛠️ Technology Stack
*   **Backend**: **Python** with the **Flask** framework, using **Flask-CORS** for cross-origin requests.
*   **Database**: **MySQL** for storing user accounts and chat history.
*   **Frontend**: **AngularJS** combined with **HTML**, **CSS**, and **JavaScript**.
*   **AI Integration**: Uses the **Google Gemini API** (`gemini-2.0-flash` model) via the `google-generativeai` library.
*   **Additional Libraries**: `markdown` for rendering AI responses.

### 📁 Project Structure
*   `main.py`: The core Flask application that defines all API routes and page endpoints.
*   `yope_ai.py`: Contains the `YopeAI` class responsible for database operations (user management, chat storage) and orchestrating AI responses.
*   `text_generate_ai.py`: Handles the actual AI text generation using the Gemini API, including error logging.
*   `templates/`: Contains the HTML views (e.g., `home.htm`, `account.htm`, `chat.htm`).
*   `static/`: Houses static assets like CSS, JavaScript, and AngularJS files.
*   `error_log.log`: A log file for recording errors during AI generation.

In short, **Yope AI** is a straightforward web application that demonstrates how to build a chat interface powered by the Google Gemini API, complete with user authentication and conversation persistence.

### Links:
*   **Repositories**: https://github.com/yopeman/YopeAI
*   **Website**: https://yopeai.vercel.app
