import EvaluationService from "../services/evaluationService.js";
import MilestoneService from "../services/milestoneService.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const createUpdate = async (req, res) => {
    try {
        const userId = req.user.pgstud_id || req.user.id;
        if (req.user.role_id !== 'STU') return sendError(res, "Only students can post progress updates", 403);

        const { title, description, achievements, challenges, nextSteps } = req.body;
        if (!title || !achievements || !nextSteps) return sendError(res, "Title, Achievements, and Next Steps are required", 400);

        const documentPath = req.file ? req.file.path : null;

        const newUpdate = await EvaluationService.createProgressUpdate({
            pg_student_id: userId,
            title,
            description,
            achievements,
            challenges,
            next_steps: nextSteps,
            document_path: documentPath
        });

        sendSuccess(res, "Progress update created successfully", { update: newUpdate }, 201);
    } catch (err) {
        console.error("Create Update Error:", err);
        sendError(res, "Failed to create update", 500);
    }
};

export const getUpdates = async (req, res) => {
    try {
        const userId = req.user.pgstud_id || req.user.id;
        const { role_id } = req.user;

        let studentId = userId;
        if (role_id !== 'STU') {
            // For staff, we allow fetching by student_id query param, OR fetch all associated with them if not provided (handled in service)
            // But the original logic required student_id for supervisors.
            // We'll keep the logic but pass role/user context to service for filtering.
            if (["SUV", "CGSADM", "CGSS", "EXA"].includes(role_id)) {
                studentId = req.query.student_id;
                // We don't force student_id here if we want to fetch "all my students' updates", but service signature `getUpdatesByStudent` implies single student.
                // If studentId is missing, we might want to return 400 or handle "all" in service.
                // The current implementation returns 400. We will stick to that for this specific endpoint.
                if (!studentId) return sendError(res, "Student ID required for supervisors", 400);
            } else {
                return sendError(res, "Access denied", 403);
            }
        }

        const updates = await EvaluationService.getUpdatesByStudent(studentId, req.user.id, role_id);
        sendSuccess(res, "Updates fetched successfully", { updates });
    } catch (err) {
        sendError(res, "Failed to fetch updates", 500);
    }
};

export const getPendingEvaluations = async (req, res) => {
    try {
        if (!["SUV", "CGSADM", "CGSS", "EXA"].includes(req.user.role_id)) return sendError(res, "Access denied", 403);

        const pendingUpdates = await EvaluationService.getPendingProgressUpdates(req.user.id, req.user.role_id);
        const formatted = pendingUpdates.map(update => ({
            id: update.update_id,
            student_id: update.pg_student_id,
            fullName: update.pg_student ? `${update.pg_student.FirstName} ${update.pg_student.LastName}` : 'Unknown',
            studentId: update.pg_student?.stu_id || update.pg_student_id,
            title: update.title,
            description: update.description,
            achievements: update.achievements,
            challenges: update.challenges,
            nextSteps: update.next_steps,
            documentPath: update.document_path,
            submittedDate: update.submission_date,
            status: update.status,
            program: update.pg_student?.Prog_Code || 'N/A'
        }));

        sendSuccess(res, "Pending evaluations fetched successfully", { evaluations: formatted });
    } catch (err) {
        sendError(res, "Failed to fetch pending evaluations", 500);
    }
};

export const reviewUpdate = async (req, res) => {
    try {
        if (!["SUV", "CGSADM", "CGSS", "EXA"].includes(req.user.role_id)) return sendError(res, "Access denied", 403);

        const { update_id, supervisor_feedback, status } = req.body;
        if (!update_id) return sendError(res, "Update ID is required", 400);

        const update = await EvaluationService.reviewProgressUpdate(update_id, {
            supervisor_feedback,
            status,
            userId: req.user.id,
            roleId: req.user.role_id
        });

        sendSuccess(res, "Update reviewed successfully", { update });
    } catch (err) {
        sendError(res, err.message || "Failed to review update", err.status || 500);
    }
};

export const getMyStudents = async (req, res) => {
    try {
        const { role_id, Dep_Code, id: userId } = req.user;
        if (!["SUV", "CGSADM", "CGSS", "EXA"].includes(role_id)) return sendError(res, "Access denied", 403);

        const students = await EvaluationService.getStudentsForUser(userId, role_id, Dep_Code);
        const templates = await MilestoneService.getTemplates();
        sendSuccess(res, "Students fetched successfully", { students: formatStudents(students, templates) });
    } catch (err) {
        sendError(res, "Failed to fetch students", 500);
    }
};

export const getStudentDetailView = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await EvaluationService.getStudentDetailViewData(id);
        sendSuccess(res, "Student details fetched successfully", data);
    } catch (err) {
        sendError(res, err.message || "Failed to fetch student details", err.status || 500);
    }
};

export const updateMilestoneDeadline = async (req, res) => {
    try {
        const { pg_student_id, milestone_name, deadline_date, reason } = req.body;
        const updated_by = req.user.id;

        if (!pg_student_id || !milestone_name || !deadline_date) {
            return sendError(res, "Missing required fields", 400);
        }

        const deadline = await EvaluationService.updateMilestoneDeadline({
            pg_student_id,
            milestone_name,
            deadline_date,
            reason,
            updated_by
        });

        sendSuccess(res, "Deadline updated successfully", { deadline });
    } catch (err) {
        sendError(res, err.message || "Failed to update deadline", err.status || 500);
    }
};

export const manualCompleteMilestone = async (req, res) => {
    try {
        const { pg_student_id, milestone_name } = req.body;
        const staffId = req.user.id;

        if (!pg_student_id || !milestone_name) {
            return sendError(res, "Missing student ID or milestone name", 400);
        }

        const completion = await EvaluationService.manualCompleteMilestone(pg_student_id, milestone_name, staffId);
        sendSuccess(res, "Milestone marked as completed", { completion });
    } catch (err) {
        sendError(res, err.message || "Failed to update milestone", err.status || 500);
    }
};

const formatStudents = (students, templates = []) => {
    return students.map(student => {
        const lastUpdate = student.progress_updates?.[0];
        const uploads = student.documents_uploads || [];

        // Define milestones from templates
        const milestoneTypes = templates.map(t => t.document_type || t.name);

        // Fallback for safety if no templates
        const finalMilestones = milestoneTypes.length > 0
            ? milestoneTypes
            : ['Research Proposal', 'Literature Review', 'Methodology', 'Data Analysis', 'Final Thesis'];

        const validUploads = new Set(uploads.filter(u => u.status === 'Approved' || u.status === 'Completed').map(u => u.document_type));
        let completedCount = 0;
        finalMilestones.forEach(m => { if (validUploads.has(m)) completedCount++; });

        const researchProposal = uploads.find(u => u.document_type === 'Research Proposal');
        const researchTitle = researchProposal ? researchProposal.document_name : "N/A";

        // Extract supervisor name (prioritize Main Supervisor)
        const mainSupervisor = student.role_assignments?.find(a => a.assignment_type === 'Main Supervisor')?.pg_staff;
        const supervisorName = mainSupervisor
            ? `${mainSupervisor.Honorific_Titles || ''} ${mainSupervisor.FirstName} ${mainSupervisor.LastName}`.trim()
            : (student.role_assignments?.[0]?.pg_staff
                ? `${student.role_assignments[0].pg_staff.Honorific_Titles || ''} ${student.role_assignments[0].pg_staff.FirstName} ${student.role_assignments[0].pg_staff.LastName}`.trim()
                : "N/A");

        return {
            id: student.stu_id || student.pgstud_id,
            name: `${student.FirstName} ${student.LastName}`,
            email: student.EmailId,
            progress: Math.round((completedCount / finalMilestones.length) * 100),
            lastSubmissionDate: lastUpdate ? lastUpdate.submission_date : student.RegDate,
            researchTitle: researchTitle,
            program: student.Prog_Code_program_info?.prog_name || student.Prog_Code,
            supervisor: supervisorName
        };
    });
};
