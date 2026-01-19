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

/* ===================== ERROR INTERCEPTOR ===================== */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;
    if (response) {
      // 401: Unauthorized -> Auto Logout
      if (response.status === 401) {
        if (!window.location.pathname.includes('/login')) {
          console.warn("Unauthorized! Redirecting to login...");
          // Disconnect socket if connected
          if (socket.connected) socket.disconnect();

          await authService.logout().catch(() => { }); // Attempt cleaner logout
          window.location.href = '/login';
        }
      }

      // 403: Forbidden -> Optional: Show a toast? 
      // Usually handled by key components, but we could emit an event.
    }
    return Promise.reject(error);
  }
);

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

/* ===================== DOCUMENT SERVICE ===================== */
export const documentService = {
  upload: async (formData) => {
    const res = await api.post("/api/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  getMyDocuments: async () => {
    const res = await api.get("/api/documents/my-documents");
    return res.data;
  },
  getSupervisorDocuments: async () => {
    const res = await api.get("/api/documents/supervisor/list");
    return res.data;
  },
  review: async (data) => {
    const res = await api.post("/api/documents/review", data);
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await api.get("/api/documents/student/stats");
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/api/documents/${id}`);
    return res.data;
  }
};

/* ===================== PROGRESS SERVICE ===================== */
export const progressService = {
  // Fetch logs
  getUpdates: async (studentId = null) => {
    // Optional studentId for supervisors
    const url = studentId ? `/api/progress?student_id=${studentId}` : '/api/progress';
    const res = await api.get(url);
    return res.data;
  },

  // Create new log (with optional file upload)
  createUpdate: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('achievements', data.achievements);
    formData.append('challenges', data.challenges || '');
    formData.append('nextSteps', data.nextSteps);

    // Add document if present
    if (data.document) {
      formData.append('document', data.document);
    }

    const res = await api.post("/api/progress", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Fetch pending evaluations (for supervisors)
  getPendingEvaluations: async () => {
    const res = await api.get("/api/progress/pending-evaluations");
    return res.data;
  },

  // Review a progress update (for supervisors)
  reviewProgressUpdate: async (data) => {
    const res = await api.post("/api/progress/review", data);
    return res.data;
  },

  // Fetch all students assigned to supervisor
  getMyStudents: async () => {
    const res = await api.get("/api/progress/my-students");
    return res.data;
  }
};

/* ===================== SERVICE REQUEST SERVICE ===================== */
export const serviceRequestService = {
  create: async (data) => {
    const res = await api.post("/api/service-requests", data);
    return res.data;
  },
  getAll: async (status) => {
    const url = status ? `/api/service-requests?status=${status}` : '/api/service-requests';
    const res = await api.get(url);
    return res.data;
  },
  updateStatus: async (id, status, comments) => {
    const res = await api.put(`/api/service-requests/${id}`, { status, comments });
    return res.data;
  }
};

/* ===================== EVALUATION SERVICE ===================== */
export const evaluationService = {
  // Submit a new defense evaluation
  submitEvaluation: async (data) => {
    const res = await api.post("/api/evaluations", data);
    return res.data;
  },

  // Get evaluations for a specific student (for feedback page)
  getStudentEvaluations: async (studentId) => {
    const res = await api.get(`/api/evaluations/student/${studentId}`);
    return res.data;
  },

  // Get all evaluations (for supervisors/admin)
  getAllEvaluations: async () => {
    const res = await api.get("/api/evaluations");
    return res.data;
  },
  // Find student by ID
  getStudentById: async (id) => {
    const res = await api.get(`/api/evaluations/find-student/${id}`);
    return res.data;
  }
};

/* ===================== DEFENSE EVALUATION SERVICE ===================== */
export const defenseEvaluationService = {
  submitEvaluation: async (data) => {
    const res = await api.post("/api/defense-evaluations", data);
    return res.data;
  },
  getEvaluations: async (studentId) => {
    const res = await api.get(`/api/defense-evaluations/student/${studentId}`);
    return res.data;
  }
};

/* ===================== DASHBOARD SERVICE ===================== */
export const dashboardService = {
  getSupervisorStats: async () => {
    const res = await api.get("/api/dashboard/supervisor/stats");
    return res.data;
  },
  getExaminerStudents: async () => {
    const res = await api.get("/api/dashboard/examiner/students");
    return res.data;
  }
};

/* ===================== NOTIFICATION SERVICE ===================== */
export const notificationService = {
  getNotifications: async () => {
    const res = await api.get("/api/notifications");
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.put(`/api/notifications/${id}/read`);
    return res.data;
  }
};

export default api;
