import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Queuing for multiple simultaneous 401 requests
let failedQueue = [];
let isLoggingOut = false;

const processQueue = (error = null) => {
 failedQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

export const setIsLoggingOut = (value) => {
  isLoggingOut = value;
};

// Auth service
export const authService = {
  login: async (role, credentials) => {
    const data = await api
      .post("/api/auth/login", { ...credentials, role_id: role })
            
      if (!data.user && credentials.email) {
      data.user = {
        email: credentials.email,
        role_id: role,
        mustChangePassword: data.mustChangePassword || false,
      };
    }

    return data.data;
  },
  
  // Get currently logged-in user
  me: async () => {
    const res = await api.get("/api/profile/me");
    return res.data;
  },

  logout: async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/api/auth/logout"); // backend clears cookie
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  },
};

export default api;