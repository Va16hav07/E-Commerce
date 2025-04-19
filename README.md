# E-Commerce

This repository contains an E-Commerce application.

## Setup

Follow these steps to set up and run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/E-Commerce.git
   cd E-Commerce
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy the environment example file to create your own `.env` file:
     ```bash
     cp $env-example.sh .env
     ```
   - Fill in the required environment variables in the `.env` file:
     - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
     - `VITE_API_URL`: The backend API URL (default: http://localhost:5000)
     - `VITE_REDIRECT_URI`: The OAuth redirect URI (default: http://localhost:5173/auth/callback)
     - `VITE_USE_SERVER_OAUTH`: Whether to use server-side OAuth (default: true)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the local development server (typically http://localhost:5173)

## Backend API

This frontend application connects to a backend API service located at http://localhost:5000. Make sure the backend server is running before starting the frontend application.

The backend API provides all the necessary endpoints for user authentication, product management, and order processing.

## Technologies

- Frontend: React with Vite
- Backend: API running on port 5000
- Authentication: Google OAuth

