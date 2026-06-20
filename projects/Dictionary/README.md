Based on the repository, the **Dictionary-App-By-Flask-API-and-Angular** is a straightforward, full-stack web application for managing a bilingual English-Amharic dictionary.

### 🎯 Core Purpose
The project is a practical exercise in building an **end-to-end dictionary application**. It serves as a simple translator and dictionary manager, allowing users to look up word translations and perform basic CRUD (Create, Read, Update, Delete) operations on the dictionary database.

### 🏗️ Architecture
The application is split into two main parts:

*   **Backend (Flask API)**: A Python Flask server that provides a RESTful API. It handles all the business logic and database interactions.
*   **Frontend (AngularJS Client)**: A web-based user interface built with AngularJS (version 1.8.2). It consumes the backend API to provide a user-friendly interface for interacting with the dictionary.

### ✨ Key Features
The frontend consists of two main pages, offering distinct functionalities:

*   **`index.htm` - The Translator**: This is the main interface for end-users. It allows users to translate words between **English** and **Amharic** and displays the results.
*   **`dash.htm` - The Dashboard**: This is an administrative panel for managing the dictionary. It provides a complete set of management tools:
    *   **Search**: Look up words in the dictionary.
    *   **View**: See a list of all words with their IDs, English, and Amharic translations.
    *   **Add**: Insert new word pairs into the dictionary.
    *   **Edit**: Modify existing entries.
    *   **Delete**: Remove individual words or clear the entire dictionary.

### 🛠️ Technology Stack
*   **Backend**: Python with the Flask framework and Flask-CORS for handling cross-origin requests.
*   **Database**: SQLite3 (stored in `word.db`).
*   **Frontend**: AngularJS (version 1.8.2), HTML, and JavaScript.

### 📁 Project Structure
The repository is neatly organized:
*   `main.py`: The main Flask application file defining all API routes.
*   `word.py`: A helper class that handles all direct interactions with the SQLite database.
*   `word.db`: The SQLite database file.
*   `client/`: The directory containing the AngularJS frontend files.
*   `__pycache__/`: A directory for Python bytecode cache files.

In short, this is a functional but basic dictionary app built with Flask and AngularJS, created as a learning project to demonstrate a full-stack application.

### Links:
*   **Repositories**: https://github.com/yopeman/Dictionary-App-By-Flask-API-and-Angular
*   **Website**: https://dictionary.vercel.app
