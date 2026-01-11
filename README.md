# SpotIt Backend

SpotIt is a civic engagement platform that empowers citizens to report issues in their community. This is the Node.js backend API that powers the mobile and web applications.

## Features
- **Authentication**: Email/Password and Google OAuth.
- **Role-Based Access Control**: Users, Workers, and Admins.
- **Reporting System**: Users can submit reports with location and images.
- **Task Management**: Workers can view and resolve assigned tasks.
- **Rewards System**: Users earn points for approved reports and can redeem them for rewards.
- **Admin Dashboard**: Comprehensive management of reports, users, workers, and rewards.
- **Notifications**: Real-time updates via Firebase Cloud Messaging (FCM).

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Sequelize ORM)
- **Monitoring**: Swagger UI for API Documentation

## Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running
- A Google Cloud Project (for OAuth) - Optional for local dev if skipping Google login
- An SMTP Server (e.g., Gmail App Password) - Optional for local dev

## Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd spotit-backend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Copy the example environment file to `.env`:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and fill in your details:
    - **Database**: Ensure `DB_NAME` exists in postgres or will be created.
    - **Auth**: Set a secure `JWT_SECRET`.
    - **Email**: Add SMTP credentials for email notifications.
    - **Admin**: Set the default admin email and password for the seeder.

## Database Setup

1.  **Create the Database** (if not letting Sequelize do it automatically):
    ```sql
    CREATE DATABASE spotit_db;
    ```
    *Note: The application is configured to sync tables automatically on start (`sequelize.sync({ alter: true })`).*

2.  **Seed the Admin User**
    To create the initial admin account (as configured in `.env`):
    ```bash
    npm run seed:admin
    ```
    *(Ensure you add `"seed:admin": "node src/seeders/admin.seeder.js"` to your package.json scripts or run the node command directly)*

## Running the Server

-   **Development Mode** (with nodemon):
    ```bash
    npm run dev
    ```

-   **Production Mode**:
    ```bash
    npm start
    ```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Documentation

The API is fully documented using Swagger. Once the server is running, visit:

**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

## Project Structure

-   `src/models`: Sequelize database models (User, Report, Reward, etc.)
-   `src/controllers`: Request handlers grouped by domain (auth, admin, mobile, worker).
-   `src/routes`: API route definitions.
-   `src/middleware`: Auth and validation middleware.
-   `src/config`: Database and Swagger configuration.
-   `src/services`: Helper services (Email, AI, etc.).
