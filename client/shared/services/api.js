import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Queuing for multiple simultaneous 401 requests
let isRefreshing = false;
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
  login: (role, credentials) => {
    const roleMap = {
      student: "/masterstu/login",
      supervisor: "/supervisors/login",
      examiner: "/examiner/login",
      cgs: "/cgs/login"
    };

    if (!roleMap[role]) throw new Error("Invalid role selected");
    return api
    .post(roleMap[role], credentials)
    .then(res => res.data);
  },
  me: async () => {
    const res = await api.get("/me", me);
    return res.data;
  },

refresh: async () => {
    // Backend should set a new cookie if session expired
    return api.post("/refresh");
  },

  logout: async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/logout"); // backend clears cookie
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  },
};

// Axios response interceptor for automatic refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/refresh') &&
      !isLoggingOut
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await authService.refresh(); // refresh access token
        processQueue(); // resolve queued requests
        return api(originalRequest); // retry original request
      } catch (err) {
        processQueue(err); // reject queued requests
        await authService.logout(); // clear session
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;