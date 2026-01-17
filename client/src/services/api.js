import axios from "axios";
import { socket } from "./socket";

const isDev = import.meta.env.DEV;
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isDev ? "" : (import.meta.env.API_BASE_URL || ""));

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🔑 cookie-based session
  headers: {
    "Content-Type": "application/json",
  },
});


/* ===================== CSRF ===================== */
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (csrfToken && config.method !== "get") {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

/* ===================== AUTH SERVICE ===================== */
export const authService = {
  async initCsrf() {
    await api.get("/api/csrf-token");
  },

  async login(role, credentials) {
    const res = await api.post("/api/auth/login", {
      ...credentials,
      role_id: role,
    });

    if (res.data?.success) {
      socket.connect(); // 🔌 connect only after login
    }

    return res.data;
  },

  async me() {
    const res = await api.get("/api/profile/me");
    return res.data;
  },

  async logout() {
    try {
      socket.disconnect();
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  },
};

export default api;
