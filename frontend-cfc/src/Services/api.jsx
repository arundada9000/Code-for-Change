import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

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

// Interceptor to handle errors globally if needed
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors (e.g. 401)
    if (error.response?.status === 401) {
      // Potentially clear local storage or redirect to login
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default API;
