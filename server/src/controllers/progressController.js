import EvaluationService from "../services/evaluationService.js";
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
            if (["SUV", "CGSADM", "CGSS"].includes(role_id)) {
                studentId = req.query.student_id;
                if (!studentId) return sendError(res, "Student ID required for supervisors", 400);
            } else {
                return sendError(res, "Access denied", 403);
            }
        }

        const updates = await EvaluationService.getUpdatesByStudent(studentId);
        sendSuccess(res, "Updates fetched successfully", { updates });
    } catch (err) {
        sendError(res, "Failed to fetch updates", 500);
    }
};

export const getPendingEvaluations = async (req, res) => {
    try {
        if (!["SUV", "CGSADM", "CGSS"].includes(req.user.role_id)) return sendError(res, "Access denied", 403);

        const pendingUpdates = await EvaluationService.getPendingProgressUpdates();
        const formatted = pendingUpdates.map(update => ({
            id: update.update_id,
            student_id: update.pg_student_id,
            fullName: update.pg_student ? `${update.pg_student.FirstName} ${update.pg_student.LastName}` : 'Unknown',
            studentId: update.pg_student_id,
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
        if (!["SUV", "CGSADM", "CGSS"].includes(req.user.role_id)) return sendError(res, "Access denied", 403);

        const { update_id, supervisor_feedback, status } = req.body;
        if (!update_id) return sendError(res, "Update ID is required", 400);

        const update = await EvaluationService.reviewProgressUpdate(update_id, {
            supervisor_feedback,
            status
        });

        sendSuccess(res, "Update reviewed successfully", { update });
    } catch (err) {
        sendError(res, err.message || "Failed to review update", err.status || 500);
    }
};

export const getMyStudents = async (req, res) => {
    try {
        const { role_id, Dep_Code } = req.user;
        if (!["SUV", "CGSADM", "CGSS"].includes(role_id)) return sendError(res, "Access denied", 403);

        const students = await EvaluationService.getActiveStudentsInDepartment(Dep_Code || 'CGS');
        sendSuccess(res, "Students fetched successfully", { students: formatStudents(students) });
    } catch (err) {
        sendError(res, "Failed to fetch students", 500);
    }
};

const formatStudents = (students) => {
    return students.map(student => {
        const lastUpdate = student.progress_updates?.[0];
        const uploads = student.documents_uploads || [];
        const milestones = ['Research Proposal', 'Literature Review', 'Methodology', 'Data Analysis', 'Final Thesis'];

        const validUploads = new Set(uploads.filter(u => u.status !== 'Rejected').map(u => u.document_type));
        let completedCount = 0;
        milestones.forEach(m => { if (validUploads.has(m)) completedCount++; });

        return {
            id: student.pgstud_id,
            name: `${student.FirstName} ${student.LastName}`,
            email: student.EmailId,
            progress: Math.round((completedCount / milestones.length) * 100),
            lastSubmissionDate: lastUpdate ? lastUpdate.submission_date : student.RegDate,
            researchTitle: "",
            program: student.Prog_Code
        };
    });
};
