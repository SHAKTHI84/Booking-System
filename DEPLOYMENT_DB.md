# 🐘 Deployment Part 3: Permanent Database (Optional)

Currently, your app uses an **In-Memory Database** (ideal for demos).
If you want your data to persist even after the server restarts, follow these steps to connect a free **PostgreSQL Database** on Render.

## 1. Create a Database on Render
1.  Go to your [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** -> **PostgreSQL**.
3.  **Name**: `booking-db` (or anything you like).
4.  **Region**: Same as your Web Service (e.g., Singapore/Ohio).
5.  **Plan**: Select **Free**.
6.  Click **Create Database**.

## 2. Get the Connection String
1.  Wait for the database to become "Available" (takes ~1-2 mins).
2.  Scroll down to **Internal Connection URL**.
3.  Copy the URL (starts with `postgres://...`).

## 3. Connect Your Backend
1.  Go to your **Web Service** (`ticket-system-api` or whatever you named it) in Render.
2.  Click **Environment**.
3.  **Delete** the variable `USE_MOCK_DB` (or set it to `false`).
4.  **Add** a new variable:
    - **Key**: `DATABASE_URL`
    - **Value**: Paste the `Internal Connection URL` you copied.
5.  Click **Save Changes**.

## 4. That's it! 🚀
Render will automatically restart your server.
- The new code we added will detect the real database.
- It will automatically create the tables (`shows`, `seats`).
- It will automatically insert the sample data (Avengers, etc.).

Now your events and bookings are permanent!
