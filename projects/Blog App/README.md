The **graph_blog** project is a comprehensive, educational collection of GraphQL server implementations. It's designed to demonstrate how to build a GraphQL API using three different technologies, all while maintaining a consistent schema and data model.

Here's a breakdown of the project:

### 🏗️ Core Concept: Three Servers, One Schema
The core idea is to show three distinct GraphQL server implementations that share the exact same functionality and data structure:

1.  **Apollo Server (Node.js)**: An implementation using Apollo Server 5 with a Sequelize ORM and an SQLite database.
2.  **Ariadne Server (Python)**: A Python implementation using the Ariadne library with SQLAlchemy.
3.  **Strawberry Server (Python)**: Another Python implementation, this time using the Strawberry GraphQL library with SQLAlchemy.

All three servers provide a complete CRUD API for the same data model.

### ✨ Key Features
*   **Complete GraphQL API**: Supports both queries and mutations for all operations.
*   **Soft Delete**: Records are marked as deleted instead of being permanently removed from the database.
*   **Relational Data**: The API manages `Users`, `Posts`, and `Comments` with proper relationships between them.
*   **Cross-Platform**: Offers implementations in both JavaScript/Node.js and Python.
*   **Consistent Schema**: A single, unified GraphQL schema is used across all three server implementations.
*   **Lightweight Database**: Uses SQLite, making it ideal for development and testing.

### 🛠️ Technology Stack
| Implementation | GraphQL Server | Database ORM | Runtime |
| :--- | :--- | :--- | :--- |
| **Apollo Server** | Apollo Server 5 | Sequelize | Node.js |
| **Ariadne Server** | Ariadne | SQLAlchemy | Python 3.12+ |
| **Strawberry Server** | Strawberry GraphQL | SQLAlchemy | Python 3.12+ |

In short, `graph_blog` is a practical, side-by-side comparison of popular GraphQL frameworks, making it an excellent resource for developers looking to understand the differences between Node.js and Python implementations for building a GraphQL API.

### Links:
*   **Repositories**: https://github.com/yopeman/graph_blog
*   **Website**: https://blog.vercel.app
