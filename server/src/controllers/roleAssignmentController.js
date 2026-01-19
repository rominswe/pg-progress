/* ========================= IMPORTS ========================= */
import RoleAssignmentService from "../services/roleAssignmentService.js";
import { program_info, sequelize } from "../config/config.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { mapUserForUI } from "../utils/userMapper.js";
import notificationService from "../services/notificationService.js";

/* ========================= CONTROLLERS ========================= */

/**
 * Request a new assignment
 */
export const requestAssignment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            student_id,
            staff_id,
            staff_type,
            assignment_type
        } = req.body;

        let normalizedRole = staff_type;
        if (staff_type === 'Supervisor') normalizedRole = 'SUV';
        if (staff_type === 'Examiner') normalizedRole = 'EXA';

        const requestedBy = req.user.emp_id || req.user.id;

        if (!student_id || !staff_id || !normalizedRole) {
            return sendError(res, "Missing required assignment data.", 400);
        }

        const student = await RoleAssignmentService.searchUser(student_id, 'student');
        if (!student || student.Status !== "Active") {
            return sendError(res, "Student not found or inactive.", 400);
        }

        const staff = await RoleAssignmentService.fetchStaffWithRole(staff_id, normalizedRole);
        if (!staff || staff.Status !== "Active") {
            return sendError(res, "Staff member not found, inactive, or lacks the required role.", 400);
        }

        if (await RoleAssignmentService.isDuplicate(student_id, staff_id, normalizedRole)) {
            return sendError(res, "Assignment already exists or pending approval.", 409);
        }

        const final_assignment_type = assignment_type && assignment_type !== 'Examiner'
            ? assignment_type
            : (normalizedRole === 'SUV' ? 'Main Supervisor' : 'Final Thesis Examiner');

        const limitCheck = await RoleAssignmentService.checkAssignmentLimit(student_id, staff_id, final_assignment_type);
        if (!limitCheck.allowed) return sendError(res, limitCheck.message, 400);

        const assignment = await RoleAssignmentService.createAssignment({
            pg_student_id: student.pgstud_id,
            pg_staff_id: staff.pgstaff_id,
            pg_staff_type: normalizedRole,
            assignment_type: final_assignment_type,
            requested_by: requestedBy,
        }, transaction);

        await transaction.commit();

        // Notify Staff
        await notificationService.createNotification({
            userId: staff.pgstaff_id,
            roleId: normalizedRole,
            title: 'New Assignment Request',
            message: `You have been requested as a ${final_assignment_type} for a student.`,
            type: 'ASSIGNMENT_REQUEST',
            link: `/${staff_type.toLowerCase()}/assignments`
        });

        return sendSuccess(res, "Assignment requested successfully.", assignment, 201);
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("[REQUEST_ASSIGNMENT_ERROR]", err);
        return sendError(res, err.message || "Server error.", 500);
    }
};

/**
 * Approve Assignment
 */
export const approveAssignment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { assignment_id } = req.body;
        const { role_id, role_level } = req.user;

        const isAdmin = role_id === 'CGSADM';
        const isDirector = role_id === 'CGSS' && role_level === 'Director';

        if (!isAdmin && !isDirector) {
            return sendError(res, "Unauthorized. Only Directors or Admins can approve.", 403);
        }

        const assignment = await RoleAssignmentService.getAssignmentById(assignment_id, transaction);
        if (!assignment || assignment.status !== 'Pending') {
            await transaction.rollback();
            return sendError(res, "Pending assignment not found.", 404);
        }

        const requester = await RoleAssignmentService.getRequesterDetails(assignment.requested_by, transaction);
        if (!requester && !isAdmin) {
            await transaction.rollback();
            return sendError(res, "Assignment must be requested by a CGS Executive.", 403);
        }

        await assignment.update({
            status: 'Approved',
            approved_by: req.user.emp_id || req.user.id,
            approval_date: new Date(),
        }, { transaction });

        await transaction.commit();

        // Notify Student and Staff
        await notificationService.createNotification({
            userId: assignment.pg_student_id,
            roleId: 'STU',
            title: 'Assignment Approved',
            message: `Your ${assignment.assignment_type} assignment has been approved.`,
            type: 'ASSIGNMENT_APPROVED',
            link: `/student/assignments`
        });

        await notificationService.createNotification({
            userId: assignment.pg_staff_id,
            roleId: assignment.pg_staff_type,
            title: 'Assignment Confirmed',
            message: `Your assignment as ${assignment.assignment_type} has been finalized.`,
            type: 'ASSIGNMENT_APPROVED',
            link: `/${assignment.pg_staff_type === 'SUV' ? 'supervisor' : 'examiner'}/assignments`
        });

        return sendSuccess(res, "Assignment approved.", assignment);
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("[APPROVE_ERROR]", err);
        return sendError(res, err.message, 500);
    }
};

/**
 * Reject Assignment
 */
export const rejectAssignment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { assignment_id, remarks } = req.body;

        if (!remarks || remarks.length < 10) {
            await transaction.rollback();
            return sendError(res, "Rejection reason must be at least 10 characters.", 400);
        }

        const { role_id, role_level } = req.user;
        const isAdmin = role_id === 'CGSADM';
        const isDirector = role_id === 'CGSS' && role_level === 'Director';

        if (!isAdmin && !isDirector) {
            await transaction.rollback();
            return sendError(res, "Unauthorized. Only Directors or Admins can reject.", 403);
        }

        const assignment = await RoleAssignmentService.getAssignmentById(assignment_id, transaction);
        if (!assignment || assignment.status !== 'Pending') {
            await transaction.rollback();
            return sendError(res, "Pending assignment not found.", 404);
        }

        await assignment.update({
            status: 'Rejected',
            remarks: remarks,
            approved_by: req.user.emp_id || req.user.id,
            approval_date: new Date(),
        }, { transaction });

        await transaction.commit();

        // Notify Requester
        await notificationService.createNotification({
            userId: assignment.requested_by,
            roleId: 'CGSS', // Executives are under CGSS
            title: 'Assignment Rejected',
            message: `The assignment request for student "${assignment.pg_student_id}" was rejected: ${remarks}`,
            type: 'ASSIGNMENT_REJECTED',
            link: `/cgs/assignments/pending`
        });

        return sendSuccess(res, "Assignment rejected.", assignment);
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("[REJECT_ERROR]", err);
        return sendError(res, err.message, 500);
    }
};

/**
 * Delete Assignment
 */
export const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_id } = req.user;

        if (!['CGSADM', 'CGSS'].includes(role_id)) {
            return sendError(res, "Unauthorized to delete assignments.", 403);
        }

        const assignment = await RoleAssignmentService.getAssignmentById(id);
        if (!assignment) {
            return sendError(res, "Assignment record not found.", 404);
        }

        await assignment.destroy();
        return sendSuccess(res, "Assignment deleted successfully.");
    } catch (err) {
        console.error("[DELETE_ASSIGNMENT_ERROR]", err);
        return sendError(res, err.message || "Failed to delete assignment.", 500);
    }
};

/**
 * Get All Pending Assignments
 */
export const getAllPendingAssignments = async (req, res) => {
    try {
        const result = await RoleAssignmentService.getAllPendingWithDetails();
        return sendSuccess(res, "Pending assignments fetched.", result);
    } catch (err) {
        console.error("[GET_PENDING_ERROR]", err);
        return sendError(res, err.message, 500);
    }
};

/**
 * Get Assignment Stats
 */
export const getAssignmentStats = async (req, res) => {
    try {
        const { type, depCode, progCode, searchQuery, statusFilter } = req.query;
        let results = [];

        if (type === 'student') {
            const students = await RoleAssignmentService.getStudentStats(depCode, progCode, searchQuery);
            results = students.map(s => {
                const data = s.get();
                return {
                    id: data.pgstud_id,
                    identifier: data.stu_id,
                    fullName: `${data.FirstName} ${data.LastName}`,
                    email: data.EmailId,
                    role: data.role_level,
                    department: data.Prog_Code_program_info?.prog_name || data.Dep_Code,
                    userType: 'student',
                    totalApproved: parseInt(data.totalApproved) || 0,
                    totalPending: parseInt(data.totalPending) || 0,
                    totalRejected: parseInt(data.totalRejected) || 0
                };
            });
        } else {
            const staffs = await RoleAssignmentService.getStaffStats(depCode, searchQuery);
            results = staffs.map(s => {
                const data = s.get();
                return {
                    id: data.pgstaff_id,
                    identifier: data.emp_id,
                    fullName: `${data.FirstName} ${data.LastName}`,
                    email: data.EmailId,
                    role: data.pgstaff_roles?.[0]?.role_level || 'Staff',
                    department: data.Dep_Code_tbldepartment?.DepartmentName || data.Dep_Code,
                    userType: 'staff',
                    totalApproved: parseInt(data.totalApproved) || 0,
                    totalPending: parseInt(data.totalPending) || 0,
                    totalRejected: parseInt(data.totalRejected) || 0
                };
            });
        }

        if (statusFilter && statusFilter !== 'All') {
            results = results.filter(r => {
                if (statusFilter === 'Pending') return r.totalPending > 0;
                if (statusFilter === 'Approved') return r.totalApproved > 0;
                if (statusFilter === 'Rejected') return r.totalRejected > 0;
                return true;
            });
        }

        return sendSuccess(res, "Assignment statistics fetched.", results);
    } catch (err) {
        console.error("[GET_STATS_ERROR]", err);
        return sendError(res, err.message, 500);
    }
};

/**
 * Get Assignments
 */
export const getAssignments = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        if (!id || !type) return sendError(res, "ID and Type required.", 400);

        const result = await RoleAssignmentService.getAssignmentsByType(id, type);
        return sendSuccess(res, "Assignments fetched.", result);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

/**
 * Get Assignment Types
 */
export const getAssignmentTypes = async (req, res) => {
    try {
        const types = [
            'Main Supervisor',
            'Co-Supervisor',
            'Proposal Defense Examiner',
            'Final Thesis Examiner',
            'Viva Voce Examiner'
        ];
        return sendSuccess(res, "Assignment types fetched.", types);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

/**
 * Director View
 */
export const getPendingExecutiveAssignments = async (req, res) => {
    return getAllPendingAssignments(req, res);
};

/**
 * Smart Search
 */
export const searchUserForAssignment = async (req, res) => {
    try {
        const { query, type } = req.query;
        if (!query) return sendError(res, "Search query is required.", 400);

        const user = await RoleAssignmentService.searchUser(query, type);
        if (!user) {
            return sendError(res, `No active ${type} found with the provided ID or Email.`, 404);
        }

        let uiUser;
        if (type === 'student') {
            const prog = await program_info.findByPk(user.Prog_Code);
            uiUser = await mapUserForUI(user, [], prog);
        } else {
            uiUser = await mapUserForUI(user, user.pgstaff_roles || []);
        }

        return sendSuccess(res, "User found for assignment.", uiUser);
    } catch (err) {
        console.error("[SEARCH_ASSIGNMENT_ERROR]", err);
        return sendError(res, err.message || "Search failed.", 500);
    }
};
