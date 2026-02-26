import axios from "axios";
import toast from "react-hot-toast";
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const api = axios.create({
  baseURL: BACKEND_BASE_URL || "http://localhost:5000",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});



api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");

      // Optional message 
      toast.error("Session expired. Please login again");

      // Redirect to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
