# Ticket Booking System (Modex Assessment)

A full-stack Ticket Booking System with high-concurrency seat handling, built with Node.js, Express, PostgreSQL, and React.

> [!NOTE]
> **Demo Mode Enabled**: By default, this project uses an **In-Memory Database Connection (pg-mem)** so you can run it immediately without installing PostgreSQL.
> To use a real database, set `USE_MOCK_DB=false` in `backend/.env`.

## 🚀 Features

- **Admin Dashboard**: Create Shows, Bus Trips, and Doctor Appointments.
- **Visual Seat Booking**: Interactive seat grid with real-time status.
- **Concurrency Handling**: row-level locking (`SELECT ... FOR UPDATE`) prevents double bookings.
- **Booking Flow**: 
    1. Select Seats (Local State)
    2. Hold Seats (Server-side Lock + Expiry)
    3. Confirm Booking (Finalize)
- **Automatic Expiry**: Expired pending bookings are released automatically.
- **Premium UI**: Glassmorphism design with React + Vite.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL (pg), Swagger
- **Frontend**: React, TypeScript, Vite, Axios, Lucide Icons
- **Database**: PostgreSQL (or pg-mem for local demo)

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

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)

### 1. Database Setup
**No installation required for Demo Mode.**
(Optional: If using real Postgres, create a DB named `ticket_system` and update `.env`)

### 2. Backend Setup
```bash
cd backend
npm install
# Start Server (Auto-seeds in-memory DB)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Concurrency Explanation
The system uses **Pessimistic Locking** via PostgreSQL.
When a user attempts to "Hold" a seat:
1. A transaction begins.
2. `SELECT ... FOR UPDATE` locks the specific seat rows.
3. If seats are `AVAILABLE` (or expired), they are updated to `PENDING` with a timestamp.
4. Transaction commits.
This ensures that even if 100 users click "Book" continuously, only one will succeed in acquiring the lock and updating the status.

*Note: In Demo Mode (In-Memory), concurrency is handled by the single-threaded nature of the Node.js event loop + async execution serialization, effectively mimicking safe execution.*

## 🧪 Testing
- **Swagger Docs**: Visit `http://localhost:5000/api-docs`
- **Manual**: Open two browser windows. Try to book the same seat simultaneously. One will fail.

## 📦 Deployment
### Backend (Render/Railway)
- Set `DATABASE_URL` env var.
- Set `USE_MOCK_DB=false`.
- Build Command: `npm run build`
- Start Command: `npm start`

### Frontend (Vercel)
- Set `VITE_API_URL` to your backend URL.
- Build Command: `npm run build`
- Output Directory: `dist`
