import api from "@/services/api";

/**
 * Admin Service handles all backend communication for administrative functions.
 */
export const adminService = {
    /**
     * Fetches all Post Graduate users with dynamic filtering.
     * @param {Object} params - Query parameters (dept, status, role).
     * @param {AbortSignal} signal - Optional signal to cancel request.
     * @returns {Promise<Object>} - The API response containing user data.
     */
    async getAllPGUsers(params = {}, signal = null) {
        try {
            const res = await api.get('/api/admin/all-pg-users', { params, signal });
            return res.data;
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return null;
            console.error("Error in getAllPGUsers:", err);
            throw err;
        }
    },

    async getSystemUserById(id) {
        try {
            const res = await api.get(`/api/admin/system-user/${id}`);
            return res.data;
        } catch (err) {
            console.error("Error in getSystemUserById:", err);
            throw err;
        }
    },

    async getDashboardStats() {
        try {
            const res = await api.get('/api/admin/dashboard-stats');
            return res.data;
        } catch (err) {
            console.error("Error in getDashboardStats:", err);
            throw err;
        }
    },

    async getUserDetails(id) {
        try {
            const res = await api.get(`/api/admin/user-details/${id}`);
            return res.data;
        } catch (err) {
            console.error("Error in getUserDetails:", err);
            throw err;
        }
    },

    async toggleUserStatus(userId, targetStatus) {
        try {
            const res = await api.put('/api/admin/manage/status/toggle', { userId, targetStatus });
            return res.data;
        } catch (err) {
            console.error("Error in toggleUserStatus:", err);
            throw err;
        }
    },

    async searchUser(role, type, query) {
        try {
            const res = await api.get(`/api/admin/search-info?role=${role}&type=${type}&query=${query}`);
            return res.data;
        } catch (err) {
            console.error("Error in searchUser:", err);
            throw err;
        }
    },

    // Assignment Management
    async requestAssignment(data) {
        try {
            const res = await api.post('/api/admin/assignments/request', data);
            return res.data;
        } catch (err) {
            console.error("Error in requestAssignment:", err);
            throw err;
        }
    },

    async approveAssignment(data) {
        try {
            const res = await api.post('/api/admin/assignments/approve', data);
            return res.data;
        } catch (err) {
            console.error("Error in approveAssignment:", err);
            throw err;
        }
    },

    async getAssignments(id, type) {
        try {
            const res = await api.get(`/api/admin/assignments/${id}?type=${type}&t=${Date.now()}`);
            return res.data;
        } catch (err) {
            console.error("Error in getAssignments:", err);
            throw err;
        }
    },

    async searchUserForAssignment(query, type) {
        try {
            const res = await api.get(`/api/admin/assignments/search?query=${query}&type=${type}`);
            return res.data;
        } catch (err) {
            console.error("Error in searchUserForAssignment:", err);
            throw err;
        }
    },

    async getPendingAssignments() {
        try {
            const res = await api.get('/api/admin/assignments/pending');
            return res.data;
        } catch (err) {
            console.error("Error in getPendingAssignments:", err);
            throw err;
        }
    },

    async getAssignableRoles() {
        try {
            const res = await api.get('/api/admin/roles/assignable');
            return res.data;
        } catch (err) {
            console.error("Error in getAssignableRoles:", err);
            throw err;
        }
    },

    async rejectAssignment(assignment_id, remarks) {
        try {
            const res = await api.post('/api/admin/assignments/reject', { assignment_id, remarks });
            return res.data;
        } catch (err) {
            console.error("Error in rejectAssignment:", err);
            throw err;
        }
    },

    async getAssignmentStats(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const res = await api.get(`/api/admin/assignments/stats?${queryString}`);
            return res.data;
        } catch (err) {
            console.error("Error in getAssignmentStats:", err);
            throw err;
        }
    },

    async getExecutivePendingAssignments() {
        try {
            const res = await api.get('/api/admin/assignments/pending/executive');
            return res.data;
        } catch (err) {
            console.error("Error in getExecutivePendingAssignments:", err);
            throw err;
        }
    },

    async deleteAssignment(id) {
        try {
            const res = await api.delete(`/api/admin/assignments/${id}`);
            return res.data;
        } catch (err) {
            console.error("Error in deleteAssignment:", err);
            throw err;
        }
    }
};

export default adminService;
