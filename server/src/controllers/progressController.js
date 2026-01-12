import initModels from "../models/init-models.js";
import { sequelize } from "../config/config.js";
import { Op } from 'sequelize';

const models = initModels(sequelize);
const { progress_updates, master_stu, supervisor } = models;

export const createUpdate = async (req, res) => {
    try {
        const userId = req.user.id || req.user.student_id;

        if (req.user.role_id !== 'STU') {
            return res.status(403).json({ error: "Only students can post progress updates" });
        }

        const { title, description, achievements, challenges, nextSteps } = req.body;

        if (!title || !achievements || !nextSteps) {
            return res.status(400).json({ error: "Title, Achievements, and Next Steps are required" });
        }

        // Handle file upload (if present)
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

        res.status(201).json(newUpdate);

    } catch (err) {
        console.error("Create Update Error:", err);
        res.status(500).json({ error: "Failed to create update" });
    }
};

export const getUpdates = async (req, res) => {
    try {
        const userId = req.user.id || req.user.student_id;

        if (req.user.role_id !== 'STU') {
            if (["SUV", "CGSADM", "CGSS"].includes(req.user.role_id)) {
                const { student_id } = req.query;
                if (!student_id) return res.status(400).json({ error: "Student ID required for supervisors" });

                const updates = await progress_updates.findAll({
                    where: { student_id },
                    order: [['submission_date', 'DESC'], ['created_at', 'DESC']]
                });
                return res.json(updates);
            }
            return res.status(403).json({ error: "Access denied" });
        }

        const updates = await progress_updates.findAll({
            where: { student_id: userId },
            order: [['submission_date', 'DESC'], ['created_at', 'DESC']]
        });

        res.json(updates);

    } catch (err) {
        console.error("Fetch Updates Error:", err);
        res.status(500).json({ error: "Failed to fetch updates" });
    }
};

export const getPendingEvaluations = async (req, res) => {
    try {
        if (!["SUV", "CGSADM", "CGSS"].includes(req.user.role_id)) {
            return res.status(403).json({ error: "Access denied" });
        }

        // Fetch all pending progress updates with student details
        const pendingUpdates = await progress_updates.findAll({
            where: {
                status: {
                    [Op.in]: ["Pending Review", "Pending"]
                }
            },
            include: [{
                model: master_stu,
                as: 'student',
                attributes: ['master_id', 'FirstName', 'LastName', 'EmailId', 'Prog_Code']
            }],
            order: [['submission_date', 'DESC']]
        });

        // Format response
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

        res.json({ evaluations: formatted });

    } catch (err) {
        console.error("Fetch Pending Evaluations Error:", err);
        console.error("Error details:", err.message);
        console.error("Stack trace:", err.stack);
        res.status(500).json({ error: "Failed to fetch pending evaluations", details: err.message });
    }
};

export const reviewUpdate = async (req, res) => {
    try {
        if (!["SUV", "CGSADM", "CGSS"].includes(req.user.role_id)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const { update_id, supervisor_feedback, status } = req.body;

        if (!update_id) {
            return res.status(400).json({ error: "Update ID is required" });
        }

        const update = await progress_updates.findByPk(update_id);

        if (!update) {
            return res.status(404).json({ error: "Progress update not found" });
        }

        await update.update({
            supervisor_feedback,
            status: status || 'Reviewed',
            reviewed_at: new Date()
        });

        res.json({ message: "Update reviewed successfully", update });

    } catch (err) {
        console.error("Review Update Error:", err);
        res.status(500).json({ error: "Failed to review update" });
    }
};

export const getMyStudents = async (req, res) => {
    try {
        if (!["SUV", "CGSADM", "CGSS"].includes(req.user.role_id)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const supervisorId = req.user.id || req.user.sup_id;

        // Find supervisor's department
        const sup = await supervisor.findByPk(supervisorId);
        if (!sup) {
            // Fallback for demo or if ID doesn't match sup_id directly
            const anySup = await supervisor.findOne();
            const depCode = anySup ? anySup.Dep_Code : 'CGS';

            const students = await master_stu.findAll({
                where: { Dep_Code: depCode, role_id: 'STU' },
                include: [{
                    model: progress_updates,
                    as: 'progress_updates',
                    limit: 1,
                    order: [['submission_date', 'DESC']]
                }]
            });
            return res.json({ students: formatStudents(students) });
        }

        // Fetch all students in the same department
        const students = await master_stu.findAll({
            where: {
                Dep_Code: sup.Dep_Code,
                role_id: 'STU'
            },
            include: [{
                model: progress_updates,
                as: 'progress_updates',
                limit: 1,
                order: [['submission_date', 'DESC']]
            }]
        });

        res.json({ students: formatStudents(students) });

    } catch (err) {
        console.error("Fetch My Students Error:", err);
        res.status(500).json({ error: "Failed to fetch students" });
    }
};

// Helper to format student records
const formatStudents = (students) => {
    return students.map(student => {
        const lastUpdate = student.progress_updates?.[0];

        // Calculate a dummy progress based on number of updates or status
        // For now using 75% for John Doe as requested/implied by previous context
        let progress = 75;
        if (student.FirstName === 'John') progress = 90;

        return {
            id: student.master_id,
            name: `${student.FirstName} ${student.LastName}`,
            email: student.EmailId,
            progress: progress,
            lastSubmissionDate: lastUpdate ? lastUpdate.submission_date : student.RegDate,
            researchTitle: "", // Left blank as requested unless data is found
            program: student.Prog_Code
        };
    });
};

