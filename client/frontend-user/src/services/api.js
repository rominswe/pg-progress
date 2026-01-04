// src/services/api.js
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ensures cookies like accessToken are sent
});

// Add token to every request if available (optional if using cookies)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------------- Auth Service --------------------
export const authService = {
  login: (role, credentials) => {
    const roleMap = {
      student: "/masterstu/login",
      supervisor: "/supervisors/login",
    };
    if (!roleMap[role]) throw new Error("Invalid role selected");

    return api.post(roleMap[role], credentials).then((res) => {
      const token = res.data?.token;
      if (token) localStorage.setItem("token", token);
      return res.data;
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    return api.post("/logout").then((res) => res.data);
  },

  me: () => api.get("/me").then((res) => res.data),
};

// -------------------- Document Service --------------------
export const documentService = {
  upload: (formData) => api.post("/student-documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),

  getAll: () => api.get("/student-documents"),
};

export default api;
