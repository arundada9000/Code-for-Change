import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true, // Sends HttpOnly cookies automatically
});

// No Authorization header interceptor needed —
// the backend reads the JWT from the HttpOnly 'jwt' cookie.

// Interceptor to handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear cached user data on auth failure
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default API;
