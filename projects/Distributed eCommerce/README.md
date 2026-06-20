The **Java-eCommerce-Console-App** is a client-server e-commerce system built entirely in Java, designed to run in a console environment. Instead of relying on a web browser, users interact with the application through the command line, while the backend handles data processing and storage.

Here's a detailed breakdown of the project:

### Core Purpose
The primary purpose of this project is to demonstrate a **distributed system** using Java's RMI (Remote Method Invocation) technology. It simulates a complete e-commerce experience where a central server manages all data, and multiple clients can connect to it to shop, manage their accounts, and more.

### Key Features
*   **User Management**: Supports user **signup** and **login** functionalities. New users are registered with a starting balance of 100.0.
*   **Product Catalog**: Allows for the creation, display, and deletion of products.
*   **Shopping Cart**: Users can add items to a cart, view its contents, remove items, and clear it entirely.
*   **Checkout**: A "Buy" function calculates the total cost and processes the purchase if the user has sufficient balance.
*   **Distributed Architecture**: The system is split into a server and client components, communicating via Java RMI.
*   **Graphical User Interface (GUI) Elements**: Although it's a console app, it uses `JOptionPane` for dialog boxes to get user input and display messages, providing a more interactive experience than a pure text-based interface.

### Architecture & Technology Stack
*   **Language**: **Java 97.4%** with a small amount of Shell scripting.
*   **Architecture**: A **client-server model** utilizing **Java RMI (Remote Method Invocation)** for communication between the client and the server.
*   **Persistence**: **SQLite** is used as the embedded database for storing user, product, and order data.
*   **Interface**: Uses a mix of **console-based text menus** and **Swing's `JOptionPane`** for a semi-GUI experience.

### Project Structure
The repository is organized into packages that reflect the application's modular design:
*   `Main.java`: The entry point for the client application, which initializes the database connection and launches the main menu.
*   `user/`: Handles all user-related operations, including signup and login.
*   `product/`: Manages the product catalog, allowing for adding, displaying, and deleting products.
*   `cart/`: Implements the shopping cart logic, including adding, removing, and purchasing items.
*   `database/`: Contains the core database client (`DB_Client`) responsible for executing SQL queries and interacting with the SQLite database.
*   `menu/`: Manages the main menu and navigation for the client application.
*   `server/`: Contains the server-side code that runs the RMI registry and handles remote method calls from clients.

### Current State
*   **Status**: A completed project as of **December 5, 2024**, with the last commit on **December 28, 2024**.
*   **Activity**: The project has a modest history with **19 commits**.
*   **Community**: It has **1 star** and **1 watcher**.
*   **Documentation**: The README is minimal, containing only the project title and author.

### Links:
*   **Repositories**: https://github.com/yopeman/Java-eCommerce-Console-App
*   **Website**: https://java-ecommerce.vercel.app
