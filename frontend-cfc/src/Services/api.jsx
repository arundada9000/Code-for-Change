import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL environment variable is not set");
}

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Sends HttpOnly cookies when same-origin
});

// Attach Bearer token as fallback for cross-origin deployments
// where HttpOnly cookies may not work (e.g. Vercel frontend + separate API host).
// The backend checks cookies first, then falls back to this header.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default API;
