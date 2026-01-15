import axios from "axios";
import { socket } from "./socket";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // 🔑 send session cookie
  headers: { "Content-Type": "application/json" },
});

// Queuing for multiple simultaneous 401 requests
let failedQueue = [];
let isLoggingOut = false;

const processQueue = (error = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

export const setIsLoggingOut = (value) => {
  isLoggingOut = value;
};

// Auth service
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

  // Get currently logged-in user
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

export const documentService = {
  upload: async (formData) => {
    return api.post("/api/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
    return api.post("/api/documents/review", data);
  },
  getDashboardStats: async () => {
    const res = await api.get("/api/documents/student/stats");
    return res.data;
  },
  delete: async (id) => {
    return api.delete(`/api/documents/${id}`);
  }
};

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
export const serviceRequestService = {
  create: async (data) => {
    return api.post("/api/service-requests", data);
  },
  getAll: async (status) => {
    const url = status ? `/api/service-requests?status=${status}` : '/api/service-requests';
    return api.get(url);
  },
  updateStatus: async (id, status, comments) => {
    return api.put(`/api/service-requests/${id}`, { status, comments });
  }
};

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

export default api;