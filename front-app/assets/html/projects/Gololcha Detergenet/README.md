Based on the repository, the **Gololcha-Detergent-Backend** project is the backend API for an e-commerce platform specifically for a detergent brand called "Gololcha Detergent".

### Core Purpose
The primary goal of this project is to provide a RESTful API to power an online store. It handles all the server-side logic for user management, product inventory, order processing, payments, and notifications.

### Key Features
The API is built around managing the core entities of an e-commerce platform:

*   **User Management**: Handles user registration and authentication, with two roles: `admin` and regular `user`.
*   **Product Catalog**: Manages detergent products with details like `name`, `description`, `type` (e.g., Liquid, Powder), `price`, `brand`, and an `image_url`.
*   **Order Processing**: Allows users to place orders, specifying the `product_id`, `quantity`, and tracking the order `status` (`pending`, `shipped`, `delivered`).
*   **Payment Handling**: Manages payments linked to orders, tracking the `amount` and `status` (`pending`, `completed`, `failed`).
*   **Notifications**: A system to send notifications to users.

### Technology Stack
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database ORM**: Sequelize
*   **Database**: (Implied) SQL-based (MySQL, PostgreSQL, or SQLite), as it uses Sequelize
*   **Language**: JavaScript (100%)

### Project Structure
The project follows a standard Model-View-Controller (MVC) architecture for a Node.js API:
*   `app.js`: The main application entry point that sets up the Express server, middleware, and routes.
*   `models/`: Contains Sequelize model definitions for `User`, `Product`, `Order`, `Payment`, and `Notification`.
*   `controllers/`: (Implied) Contains the business logic for handling API requests.
*   `routes/`: Defines the API endpoints for users, products, orders, payments, and notifications.
*   `middlewares/`: Houses custom middleware, such as an error handler.
*   `schema.md`: A brief document outlining the database schema.

In short, this is a foundational backend API for a detergent e-commerce store, built with Node.js and Express.

### Links:
*   **Repositories**: https://github.com/yopeman/Gololcha-Detergent-Backend
*   **Website**: https://gode.vercel.app
