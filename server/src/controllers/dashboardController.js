import DashboardService from '../services/dashboardService.js';
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const getSupervisorStats = async (req, res) => {
    try {
        const stats = await DashboardService.getSupervisorStats(req.user.Dep_Code, req.user.id, req.user.role_id);
        sendSuccess(res, "Supervisor stats fetched successfully", stats);
    } catch (err) {
        console.error('Get Supervisor Stats Error:', err);
        sendError(res, 'Failed to fetch dashboard stats', 500);
    }
};

export const getExaminerStudents = async (req, res) => {
    try {
        const examinerId = req.user.pgstaff_id || req.user.id;

        const result = await DashboardService.getExaminerDashboardData(examinerId);
        sendSuccess(res, "Examiner students fetched successfully", { students: result });
    } catch (err) {
        console.error('Get Examiner Students Error:', err);
        sendError(res, 'Failed to fetch examiner dashboard', 500);
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const activities = await DashboardService.getRecentActivities(req.user.Dep_Code, req.user.role_id, req.user.id);
        sendSuccess(res, "Recent activity fetched successfully", activities);
    } catch (err) {
        console.error('Get Recent Activity Error:', err);
        sendError(res, 'Failed to fetch recent activity', 500);
    }
};
