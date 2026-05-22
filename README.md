# Roxiler Store Rating Platform Setup Instructions

This is a full-stack application built with Express, PostgreSQL (Prisma ORM), and React (Vite). It includes a fully responsive and modern UI.

## Prerequisites
1. **Node.js** installed (v16+).
2. **PostgreSQL** running locally on port `5432` with username `postgres` and password `postgres`.
   - *If your database configuration is different, please edit `backend/.env` with your correct database URL.*
3. A database named `roxiler` created in your PostgreSQL instance.

## Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd e:\Roxiler\backend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Push the Prisma schema to the database to create tables:
   ```bash
   npx prisma db push
   ```
4. Start the backend server:
   ```bash
   node src/index.js
   ```
   The backend will run on `http://localhost:5000`.

## Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd e:\Roxiler\frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

## Testing the Application

### 1. Register a System Administrator
To test the admin functionality, you can manually insert an admin into the database using Prisma Studio, or change the default role in `backend/src/controllers/authController.js` temporarily to `'ADMIN'` and register a new user, then change it back.
Alternatively, run this command in your backend terminal:
```bash
npx prisma studio
```
This will open a web interface where you can easily edit a user's role to `ADMIN`.

### 2. Register Normal Users & Store Owners
You can register users via the frontend. The Admin dashboard has a facility to add Store Owners and link stores to them.

## Features Implemented
- **Premium UI/UX:** A visually appealing glassmorphic/dark-mode layout.
- **Authentication:** JWT-based login and registration.
- **Role-Based Access Control:** Distinct views and APIs for `ADMIN`, `NORMAL`, and `STORE_OWNER`.
- **Admin Dashboard:** Displays statistics, list of users, and stores with sorting and filtering.
- **User Dashboard:** Users can browse stores, search, and submit 1-5 star ratings seamlessly with a beautiful star-rating component.
- **Store Owner Dashboard:** Owners can see their average rating and a list of users who reviewed their store.
- **Data Validation:** Backend validations enforce 20-60 char names, complex passwords, and 400 char max addresses.
