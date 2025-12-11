# Ticket Booking System (Modex Assessment)

A full-stack Ticket Booking System with high-concurrency seat handling, built with Node.js, Express, PostgreSQL, and React.


## 🚀 Features

### ✅ Core Booking Features
- **Visual Seat Selection**: Interactive grid for Movies, lower/upper berths for Buses, and time slots for Doctors.
- **Concurrency Protection**: **Pessimistic Locking** (`SELECT ... FOR UPDATE`) guarantees no double-booking even under heavy load.
- **Real-Time Availability**: Intelligent state management reveals booked/locked seats instantly.
- **Expiry System**: Unpaid seats held for 10 minutes are automatically released by a background cron job.

### 🛡️ Admin & Security
- **Role-Based Access Control**:
    - **User**: Search shows, view availability, book tickets.
    - **Admin**: Create new shows, manage inventory, view system stats.
- **JWT Authentication**: Secure login/registration flow with BCrypt password hashing.
- **Demo Mode**: One-click protected access for guest evaluation.

### 🎨 UI/UX
- **Glassmorphism Design**: Modern, translucent UI aesthetics.
- **Responsive Layout**: Fully optimized for Desktop, Tablet, and Mobile.
- **Dynamic Feedback**: Real-time error messages, loading states, and success notifications.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, CSS Modules, Axios, Lucide Icons
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Production), pg-mem (Test)
- **Deployment**: Render (Backend & DB), Netlify (Frontend)

## 📂 Project Structure

```bash
ticket-booking-system/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Request Handlers
│   │   ├── services/      # Business Logic (Locking here)
│   │   ├── db/            # Schema & Seed Scripts
│   │   ├── routes/        # API Routes
│   │   └── server.ts      # Entry Point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/         # Home, Admin, Booking
│   │   ├── context/       # Global State
```

## 🔑 Account Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `ss0068@srmist.edu.in` | `Hello@2002` | Create Shows, Reset Data |
| **User** | *(Register new)* | *(Any)* | Book Tickets |

> **Tip**: Use the **"Demo Mode"** button on the Login/Register page to instantly sign in as Admin.

## ⚙️ Local Setup

### 1. Backend
```bash
cd backend
# Create .env file with DATABASE_URL or set USE_MOCK_DB=true
npm install
npm run dev
# Server starts on port 5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# App opens at http://localhost:5173
```

## 🧠 System Architecture

- **Pessimistic Locking**: The system uses database-level row locking to handle concurrent requests. If two users try to book the same seat at the exact same millisecond, the database serializes these requests—one succeeds, the other receives a "Seat already taken" error.
- **Background Cleanup**: A `setInterval` worker runs every minute to free up seats that were "Held" but not "Confirmed" within 10 minutes.

## ☁️ Deployment

### Live Links
- **Frontend**: [https://booking-system-1.netlify.app](https://booking-system-1.netlify.app) (or your specific Netlify URL)
- **Backend**: [https://booking-system-ajy9.onrender.com](https://booking-system-ajy9.onrender.com)
- **Database**: PostgreSQL on Render

### Deployment Guide
For detailed steps on how this stack was deployed, refer to [DEPLOYMENT.md](./DEPLOYMENT.md).
