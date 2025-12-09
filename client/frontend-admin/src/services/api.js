import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (role, credentials) => {
    const roleMap = {
    student: "/masterstu/login",
    supervisor: "/supervisors/login",
    cgs: "/cgsadmin/login"
    };

    if (!roleMap[role]) {
      throw new Error("Invalid role selected");
    }
    return api.post(roleMap[role], credentials).then(res => {
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("role", res.data.role);
      return res.data;
    });
    
  },

  refreshToken: async () => {
    const token = localStorage.getItem("refreshToken");
    if (!token) return null;
    const res = await api.post("/auth/refresh", { token });
    localStorage.setItem("token", res.data.accessToken);
    return res.data.accessToken;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
  }
};

export default api;