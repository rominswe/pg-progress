import { progress_updates, pgstudinfo, pgstaffinfo, documents_uploads } from "../config/config.js";
import { Op } from 'sequelize';
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const createUpdate = async (req, res) => {
    try {
        const userId = req.user.pgstud_id || req.user.id;

        if (req.user.role_id !== 'STU') {
            return sendError(res, "Only students can post progress updates", 403);
        }

        const { title, description, achievements, challenges, nextSteps } = req.body;

        if (!title || !achievements || !nextSteps) {
            return sendError(res, "Title, Achievements, and Next Steps are required", 400);
        }

        const documentPath = req.file ? req.file.path : null;

        const newUpdate = await progress_updates.create({
            student_id: userId,
            title,
            description,
            achievements,
            challenges,
            next_steps: nextSteps,
            document_path: documentPath,
            status: "Pending Review"
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

        if (req.user.role_id !== 'STU') {
            if (["SUV", "CGSADM", "CGSS"].includes(req.user.role_id)) {
                const { student_id } = req.query;
                if (!student_id) return sendError(res, "Student ID required for supervisors", 400);

                const updates = await progress_updates.findAll({
                    where: { student_id },
                    order: [['submission_date', 'DESC'], ['created_at', 'DESC']]
                });
                return sendSuccess(res, "Updates fetched successfully", { updates });
            }
            return sendError(res, "Access denied", 403);
        }

        const updates = await progress_updates.findAll({
            where: { student_id: userId },
            order: [['submission_date', 'DESC'], ['created_at', 'DESC']]
        });

        sendSuccess(res, "Updates fetched successfully", { updates });

    } catch (err) {
        console.error("Fetch Updates Error:", err);
        sendError(res, "Failed to fetch updates", 500);
    }
};

export const getPendingEvaluations = async (req, res) => {
    try {
        if (!["SUV", "CGSADM", "CGSS"].includes(req.user.role_id)) {
            return sendError(res, "Access denied", 403);
        }

        const pendingUpdates = await progress_updates.findAll({
            where: {
                status: {
                    [Op.in]: ["Pending Review", "Pending"]
                }
            },
            include: [{
                model: pgstudinfo,
                as: 'student',
                attributes: ['pgstud_id', 'FirstName', 'LastName', 'EmailId', 'Prog_Code']
            }],
            order: [['submission_date', 'DESC']]
        });

        const formatted = pendingUpdates.map(update => ({
            id: update.update_id,
            student_id: update.student_id,
            fullName: update.student ? `${update.student.FirstName} ${update.student.LastName}` : 'Unknown',
            studentId: update.student_id,
            title: update.title,
            description: update.description,
            achievements: update.achievements,
            challenges: update.challenges,
            nextSteps: update.next_steps,
            documentPath: update.document_path,
            submittedDate: update.submission_date,
            status: update.status,
            program: update.student?.Prog_Code || 'N/A'
        }));

        sendSuccess(res, "Pending evaluations fetched successfully", { evaluations: formatted });
    } catch (err) {
        console.error("Fetch Pending Evaluations Error:", err);
        sendError(res, "Failed to fetch pending evaluations", 500);
    }
};

export const reviewUpdate = async (req, res) => {
    try {
        if (!["SUV", "CGSADM", "CGSS"].includes(req.user.role_id)) {
            return sendError(res, "Access denied", 403);
        }

        const { update_id, supervisor_feedback, status } = req.body;

        if (!update_id) {
            return sendError(res, "Update ID is required", 400);
        }

        const update = await progress_updates.findByPk(update_id);
        if (!update) return sendError(res, "Progress update not found", 404);

        await update.update({
            supervisor_feedback,
            status: status || 'Reviewed',
            reviewed_at: new Date()
        });

        sendSuccess(res, "Update reviewed successfully", { update });
    } catch (err) {
        console.error("Review Update Error:", err);
        sendError(res, "Failed to review update", 500);
    }
};

export const getMyStudents = async (req, res) => {
    try {
        const { role_id, Dep_Code } = req.user;
        if (!["SUV", "CGSADM", "CGSS"].includes(role_id)) {
            return sendError(res, "Access denied", 403);
        }

        const depCode = Dep_Code || 'CGS';

        const students = await pgstudinfo.findAll({
            where: { Dep_Code: depCode, Status: 'Active' },
            include: [{
                model: progress_updates,
                as: 'progress_updates',
                limit: 1,
                order: [['submission_date', 'DESC']]
            }, {
                model: documents_uploads,
                as: 'documents_uploads',
                attributes: ['document_type', 'status']
            }]
        });

        sendSuccess(res, "Students fetched successfully", { students: formatStudents(students) });
    } catch (err) {
        console.error("Fetch My Students Error:", err);
        sendError(res, "Failed to fetch students", 500);
    }
};

const formatStudents = (students) => {
    return students.map(student => {
        const lastUpdate = student.progress_updates?.[0];
        const uploads = student.documents_uploads || [];

        const milestones = [
            'Research Proposal',
            'Literature Review',
            'Methodology',
            'Data Analysis',
            'Final Thesis'
        ];

        const validUploads = new Set(
            uploads
                .filter(u => u.status !== 'Rejected')
                .map(u => u.document_type)
        );

        let completedCount = 0;
        milestones.forEach(m => {
            if (validUploads.has(m)) completedCount++;
        });

        const progress = Math.round((completedCount / milestones.length) * 100);

        return {
            id: student.pgstud_id,
            name: `${student.FirstName} ${student.LastName}`,
            email: student.EmailId,
            progress: progress,
            lastSubmissionDate: lastUpdate ? lastUpdate.submission_date : student.RegDate,
            researchTitle: "",
            program: student.Prog_Code
        };
    });
};
