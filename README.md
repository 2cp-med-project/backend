# Backend Source Directory

This directory contains the core source code for the backend API, including:

- **`app.js`**: Main entry point for the Express application.
- **`config/`**: Database connection setup.
- **`middleware/`**: Custom Express middleware.
- **`modules/`**: Contains modularized API features (e.g., authentication, users, chat, AI).
- **`routes.js`**: Aggregates all module-specific routes.
- **`utils/`**: Utility functions.

## Running the Application

To start the Docker container in the background, run the following command:

for development build:
```bash
docker compose up backend-dev
```

for production build:
```bash
docker compose up backend-prod --build
```
