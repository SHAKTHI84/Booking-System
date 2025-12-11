# Full Development Log: Ticket Booking System

**Confidential: For Personal Study Only.**

## Phase 1: Project Initialization & Architecture
1.  **Setup**: Initialized a Monorepo structure (`backend` and `frontend` folders).
2.  **Tech Choices**:
    -   **Backend**: Node.js + Express (standard REST API), TypeScript (type safety).
    -   **Frontend**: React + Vite (fast build), TypeScript.
    -   **Database Strategy**: Started with **In-Memory Mock DB** (`pg-mem`) to allow rapid development without needing a local Postgres installation.

## Phase 2: Backend Core (The Engine)
3.  **Data Models**: Designed `Shows`, `Seats`, and `Bookings` schema.
4.  **Concurrency Logic (Crucial)**:
    -   Implemented **Pessimistic Locking** (`SELECT ... FOR UPDATE`).
    -   *Why?* To prevent "Double Booking". If two users click a seat at the same time, the database forces them to queue. One wins, one fails.
5.  **API Routes**: Created endpoints for `GET /shows`, `POST /bookings/hold`, `POST /bookings/confirm`.
6.  **Expiry System**: Wrote a background `setInterval` job to auto-release seats that were "Held" but not paid for within 10 minutes.

## Phase 3: Frontend Implementation (The Interface)
7.  **State Management**: Built `GlobalContext` to manage `user` state and `loading` flags across the app.
8.  **Routing**: Set up `react-router-dom` for Home, Booking, and Admin pages.
9.  **Seat Grid UI**:
    -   Built a dynamic grid renderer.
    -   **Innovation**: It adapts layout based on show type (Movie = Grid, Bus = Sleeper Layout).
10. **Admin Dashboard**: Created a protected interface to add new shows.

## Phase 4: Authentication & Security
11. **User Model**: Added `Users` table with `role` (ADMIN/USER).
12. **Secure Passwords**: Used `bcryptjs` to hash passwords before storing them.
13. **JWT Tokens**: Implemented JSON Web Tokens for stateless authentication.
14. **Protected Routes**: Created Higher-Order Components (`ProtectedAdmin`, `ProtectedUser`) to block unauthorized access to pages.
15. **Demo Mode**: Added a "One Click Login" for Admins to easily test the app.

## Phase 5: Going Live (Real Database Migration)
16. **Render PostgreSQL**: Created a real database on Render.
17. **Connection Logic**: Updated `db/index.ts` to switch between `pg-mem` (Mock) and `Pool` (Real) based on `USE_MOCK_DB` env var.
18. **Seeding**: Wrote scripts to auto-populate the real DB with initial movies ("Avengers", "Leo") on first startup.

## Phase 6: The "Missing Seats" Debugging Saga
19. **The Bug**: Users reported that newly created shows (e.g., "hello") had 0 seats.
20. **Investigation**:
    -   Discovered that the "Create Show" API created the *Event* but didn't trigger the *Seat Generation* loop.
    -   Discovered that legacy shows created before the fix were permanently broken.
21. **The Fixes**:
    -   **Fix 1**: Updated `showService.ts` to generate seats immediately upon show creation.
    -   **Fix 2**: Built an **Emergency Repair Tool** (`/emergency-fix`).
    -   **Fix 3**: Tried multiple Debug Routes (`/api/debug`), but faced 404 routing issues due to Express Router ordering.
    -   **Final Solution**: Hardcoded `app.get('/emergency-fix')` directly in `server.ts` to bypass all routing complexity. It worked perfectly.

## Phase 7: Deployment & UI Polish
22. **Backend**: Deployed to **Render**.
23. **Frontend**: Deployed to **Netlify** (and prepared Render fallback).
24. **UI Refinements**:
    -   **Currency**: Changed `$` to `₹` and updated prices.
    -   **Identity**: Replaced user IDs with real Names (`Booking for: Rohith`).
    -   **Aesthetics**: 
        -   Redesigned the Cinema Screen with 3D CSS transforms.
        -   Styled the Logout button to be distinct.
    -   **UX**: Added "Show Password" toggle on registration.

## Phase 8: Final Delivery
25. **Documentation**:
    -   Detailed `README.md` with Admin credentials.
    -   `SYSTEM_DESIGN.md` with schema diagrams.
    -   `DEPLOYMENT.md` for clear hosting instructions.
26. **Report**: Generated this private log for study.

**Project Status: 100% Complete.**
