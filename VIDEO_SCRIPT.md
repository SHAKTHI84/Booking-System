# Ticket Booking System - Video Guide Script

## Intro (0:00 - 0:30)
- **Visual**: Show the Homepage with the "Upcoming Events" list.
- **Script**: "Hi, this is the Ticket Booking System built for the Modex Assessment. It's a full-stack application using Node.js, Express, PostgreSQL, and React. It features a premium Glassmorphism UI and robust backend concurrency handling."

## Deployment & Setup (0:30 - 1:30)
- **Visual**: Show VS Code Folder Structure.
- **Script**: 
    - "Here's the project structure. We have a distinct `backend` and `frontend` folder."
    - "The Backend is structured with Controllers, Services, and a DB layer. We use `src/db/schema.sql` and `seed.ts` to auto-populate the database."
    - "Deployment is simple. The Backend uses a standard `npm run build` and environment variables for the Database URL. The Frontend is a Vite app deployable to Vercel."

## Feature Walkthrough (1:30 - 3:30)
- **Visual**: Navigate to Admin Dashboard.
- **Script**: "Let's create a new Bus Trip. I enter the name 'Bangalore to Mysore', select type 'BUS', and set the time." -> Click Create.
- **Visual**: Go to Home -> See the new card appear.
- **Script**: "It appears instantly on the homepage."
- **Visual**: Click "Book Now".
- **Script**: "Here is the Booking Page. You can see the seat grid. Available seats are transparent, I can select them (turning blue)."
- **Visual**: Open a second browser window (Incognito) side-by-side.
- **Script**: "Now, let's test concurrency. I have User A on the left and User B on the right."
- **Action**: User A Selects 'L1' and clicks 'Proceed to Pay'.
- **Visual**: Seat turns 'Yellow' (Pending) for User A. Seat turns 'Red' (Taken) for User B immediately (due to polling).
- **Script**: "User A has held the seat. It is now locked in the database. User B cannot select it."
- **Action**: User A clicks 'Confirm Payment'.
- **Visual**: User A redirected to Home. User B sees the seat turn Dark/Booked.

## Code Deep Dive (3:30 - 4:30)
- **Visual**: Show `backend/src/services/bookingService.ts`.
- **Script**: "The core logic is here. We use `SELECT ... FOR UPDATE` inside a transaction. This locks the specific seat rows at the database level, preventing race conditions. We also check for `expires_at` to automatically release seats if the user doesn't confirm in 2 minutes."

## Conclusion
- **Script**: "This architecture ensures data integrity and a smooth user experience. Thanks for watching!"
