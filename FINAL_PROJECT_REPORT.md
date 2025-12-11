# Final Project Report: Ticket Booking System

## A. Deployment Explanation (Step-by-Step)

### 1. Project Setup
- **Folder Structure**: Monorepo approach.
    - `backend/`: Node.js/Express API.
    - `frontend/`: React/Vite SPA.
    - `root`: Shared configs and documentation.
- **Dependencies**: Managed via `package.json` in each folder.
    - Backend: `express`, `pg`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`.
    - Frontend: `react`, `react-router-dom`, `axios`, `lucide-react`.
- **Environment Variables**:
    - `DATABASE_URL`: Connection string for PostgreSQL (Render).
    - `VITE_API_URL`: Backend API URL (for Frontend).
    - `JWT_SECRET`: Secret for signing tokens.

### 2. Backend Deployment (Render)
- **Platform**: Render.com (Web Service).
- **Build Command**: `npm install && npm run build` (Installs dependencies and compiles TypeScript to `dist/`).
- **Start Command**: `npm start` (Runs `node dist/server.js`).
- **Database**: 
    - Created a **PostgreSQL** instance on Render.
    - Connected via `DATABASE_URL` env var.
    - The app automatically detects the Real DB vs Mock DB and creates tables (`users`, `shows`, `seats`) on startup if they don't exist.
- **Testing**:
    - Verified `/health` endpoint returns 200 OK.
    - Verified `/api/shows` returns JSON data.

### 3. Frontend Deployment (Netlify)
- **Platform**: Netlify (Static Site Hosting).
- **Build Process**:
    - Command: `npm run build` (Uses Vite to build optimized assets to `dist/`).
    - Publish Directory: `dist`.
- **Environment Context**:
    - The frontend calls the backend URL. This is hardcoded as a fallback in `api/index.ts` (`https://booking-system-ajy9.onrender.com/api`) but can be overriden by `VITE_API_URL`.
- **SPA Routing**:
    - Created `netlify.toml` with a redirect rule (`/*` -> `/index.html`) to ensure React Router works on page refresh.

### 4. Validation
- **Live URLs**:
    - Frontend: [Netlify Link] (e.g., https://booking-system-1.netlify.app)
    - Backend: https://booking-system-ajy9.onrender.com
- **Verified Flows**:
    - Registered a new user -> Success.
    - Login as Admin -> Success.
    - Created a Show (Admin) -> DB updated.
    - Booked a Seat (User) -> Live update on grid.

---

## B. Full Product Explanation

### 1. Product Objective
**Goal**: Build a high-concurrency ticket booking system (like BookMyShow/RedBus) that handles seat inventory accurately without overbooking.
**End Users**:
- **Customers**: Looking to book movies, bus trips, or appointments.
- **Admins**: Managing shows and viewing booking stats.

### 2. Architecture Overview
- **Tech Stack**: PERN (Postgres, Express, React, Node.js).
- **Architecture**: Client-Server Architecture (REST API).
    - **Frontend**: Stateless React UI. Manages auth state (JWT) locally.
    - **Backend**: Stateless Express API. Handles business logic and DB transactions.
    - **Database**: ACID-compliant PostgreSQL. Reliability is key for bookings.
- **Why this Stack?**:
    - TypeScript ensures type safety across full stack.
    - Postgres provides row-level locking (`SELECT ... FOR UPDATE`) which is essential for preventing race conditions in bookings.

### 3. Feature-by-Feature Demo

#### A. User Flows
- **Registration/Login**: Users sign up with Name/Email. Passwords are hashed (Bcrypt).
- **Booking Flow**:
    1.  User selects "Avengers".
    2.  User clicks seats (Local selection like `A1`, `A2`).
    3.  User clicks "Pay".
    4.  **Backend Lock**: Server attempts to lock these rows. If successful, they turn `PENDING`. If another user grabbed them 1ms ago, it returns error.
    5.  User confirms -> Status becomes `BOOKED`.

#### B. Admin Flows
- **Dashboard**: View all shows.
- **Create Show**: Admin creates "Bus to Bangalore". System **automatically generates** appropriate seat layout (Lower/Upper berths) instantly.
- **Repair Tool**: Built a custom "Emergency Fix" tool to backfill missing seats for legacy data.

#### C. API Interactions
- All calls use `axios` with Interceptors (attaching `Authorization: Bearer token`).
- Standardized Error Handling: Backend returns `{ error: "Message" }`, Frontend displays detailed alert.

### 4. Innovation & Thought Process

#### Unique Features Built:
1.  **Universal Seat Generator**:
    - I didn't just hardcode numbers. I built a dynamic generator that changes layout based on show type (`MOVIE` vs `BUS` vs `DOCTOR`).
2.  **Robust Concurrency Control**:
    - Instead of naive checks (`if seat.status == open`), I implemented **Pessimistic Locking** using SQL transactions. This guarantees data integrity even if 1000 users click the same seat simultaneously.
3.  **Self-Healing Infrastructure**:
    - Created an `/emergency-fix` route directly in the server entry point. This allows fixing "missing data" issues in Production without needing SSH access or database GUI tools.
4.  **Automated Cleanup**:
    - Background worker automatically releases "Held" seats after 10 minutes if payment isn't confirmed.

#### Challenges Solved:
- **Challenge**: Netlify Free Tier Paused Site.
    - **Solution**: Adjusted deployment strategy to move Frontend to Render (or new Netlify account) and provided clear documentation for both.
- **Challenge**: "Missing Seats" on Legacy Data.
    - **Solution**: Wrote a diagnostic script (`diagnose_seats.js`) that runs against the Production API to identify and fix data inconsistencies remotely.

### 5. Testing & Debugging
- **Manual Verification**: Opened 2 browsers (Incognito vs Normal), logged in as different users, and tried to book the same seat. Result: One succeeded, one got "Seat Locked".
- **Scripted Diagnosis**: Used custom Node.js scripts to probe the API health and DB state.
- **Visual Feedback**: Added dynamic UI components (Loading Spinners, Toast Errors) to ensure users know exactly what's happening.
