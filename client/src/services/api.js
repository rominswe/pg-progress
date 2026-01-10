import axios from "axios";
import { socket } from "./socket";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // 🔑 sends session cookie
  headers: { "Content-Type": "application/json" },
});

// ===================== CSRF INTERCEPTOR =====================
// Automatically attach CSRF token from cookie for mutating requests
api.interceptors.request.use(
  (config) => {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (csrfToken && config.method !== "get") {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===================== REQUEST QUEUE FOR 401 =====================
let failedQueue = [];
let isLoggingOut = false;

const processQueue = (error = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

export const setIsLoggingOut = (value) => {
  isLoggingOut = value;
};

// ===================== AUTH SERVICE =====================
export const authService = {
  login: async (role, credentials) => {
    const response = await api.post("/api/auth/login", {
      ...credentials,
      role_id: role,
    });

    const result = response.data;

    // connect WebSocket after successful login
    if (result.success && result.data) {
      socket.connect();
    }

    // fallback user object
    if (result.success && !result.data.email && credentials.email) {
      result.data = {
        ...result.data,
        email: credentials.email,
        role_id: role,
        mustChangePassword: result.data.mustChangePassword || false,
      };
    }

    return result;
  },

  me: async () => {
    const res = await api.get("/api/profile/me");
    return res.data;
  },

  logout: async () => {
    setIsLoggingOut(true);
    try {
      socket.disconnect(); // 🔌 disconnect WebSocket
      await api.post("/api/auth/logout"); // backend clears cookie
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  },
};

export default api;