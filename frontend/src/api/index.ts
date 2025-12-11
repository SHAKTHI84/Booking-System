import axios from 'axios';

const api = axios.create({
    // Fallback to Render URL if VITE_API_URL is missing in Netlify
    baseURL: import.meta.env.VITE_API_URL || 'https://booking-system-ajy9.onrender.com/api',
});

export default api;
