# Deployment Guide: Netlify & Render

This guide helps you deploy the Ticket Booking System.

**Architecture Note:**
- **Frontend** (React) -> Deploys perfectly on **Netlify**.
- **Backend** (Node.js/Express) -> Best deployed on **Render** or **Railway**.
  *(Netlify is designed for static sites and serverless functions, not long-running Express servers like this one).*

---

## 🚀 Part 1: Deploy Backend (Render)
*Do this first so you get the API URL.*

1.  **Push Code to GitHub**: Make sure your project is in a public repository.
2.  Sign up at [render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repo.
5.  **Settings**:
    - **Root Directory**: `backend`
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`
    - **Environment Variables**:
        - `NODE_ENV`: `production`
        - `USE_MOCK_DB`: `true` (Or `false` + `DATABASE_URL` if using real Postgres)
6.  Click **Deploy**.
7.  **Copy the URL** (e.g., `https://ticket-system-api.onrender.com`).

---

## 🌐 Part 2: Deploy Frontend (Netlify)

1.  **Preparation**:
    - I have already added a `public/_redirects` file to your project. This ensures pages like `/admin` don't give 404 on refresh.
    - Push these changes to GitHub.

2.  **Deploy**:
    - Sign up at [netlify.com](https://netlify.com).
    - Click **Add new site** -> **Import from existing project**.
    - Connect **GitHub**.
    - Pick your repository.
3.  Click **New +** ->
