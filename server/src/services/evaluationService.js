import { Op } from "sequelize";
import {
    progress_updates,
    pgstudinfo,
    documents_uploads,
    pgstaffinfo,
    defense_evaluations,
    sequelize
} from "../config/config.js";
import notificationService from "./notificationService.js";

class EvaluationService {
    // --- Defense Evaluations ---

    async createDefenseEvaluation(data) {
        // Validation: Student exists
        const student = await pgstudinfo.findByPk(data.pg_student_id);
        if (!student) {
            const error = new Error(`Student with ID "${data.pg_student_id}" does not exist.`);
            error.status = 404;
            throw error;
        }

        // Validation: If Final Thesis, check if submitted
        if (data.defense_type === 'Final Thesis') {
            const finalThesis = await documents_uploads.findOne({
                where: {
                    pg_student_id: data.pg_student_id,
                    document_type: 'Final Thesis'
                }
            });
            if (!finalThesis) {
                const error = new Error(`Student has not submitted their Final Thesis yet.`);
                error.status = 403;
                throw error;
            }
        }

        const evaluation = await defense_evaluations.create({
            ...data,
            evaluation_date: data.evaluation_date || new Date(),
        });

        // Side effect: Update document status if Final Thesis
        if (data.defense_type === 'Final Thesis') {
            const isPass = data.final_comments === 'Pass';
            const newStatus = isPass ? 'Completed' : 'Resubmit';
            await documents_uploads.update(
                { status: newStatus },
                { where: { pg_student_id: data.pg_student_id, document_type: 'Final Thesis' } }
            );
        }

        // Notify student
        const evaluator = await pgstaffinfo.findByPk(data.evaluator_id);
        const evaluatorName = evaluator ? `${evaluator.Honorific_Titles || ''} ${evaluator.FirstName} ${evaluator.LastName}`.trim() : "An evaluator";

        await notificationService.createNotification({
            userId: data.pg_student_id,
            roleId: 'STU',
            title: 'Defense Evaluation Submitted',
            message: `A ${data.defense_type} evaluation has been submitted by ${evaluatorName}.`,
            type: 'EVALUATION_SUBMITTED',
            link: `/student/evaluations`
        });

        return evaluation;
    }

    async getEvaluationsByStudent(studentId) {
        // Resolve student PK
        const student = await pgstudinfo.findOne({
            where: {
                [Op.or]: [
                    { pgstud_id: studentId },
                    { stu_id: studentId }
                ]
            }
        });

        if (!student) return [];

        return defense_evaluations.findAll({
            where: { pg_student_id: student.pgstud_id },
            order: [['evaluation_date', 'DESC']]
        });
    }

    async getAllEvaluations() {
        return defense_evaluations.findAll({
            include: [{
                model: pgstudinfo,
                as: 'pg_student',
                required: true,
                attributes: ['FirstName', 'LastName', 'EmailId']
            }],
            order: [['evaluation_date', 'DESC']]
        });
    }

    // --- Progress Updates ---

    async createProgressUpdate(data) {
        return progress_updates.create({
            ...data,
            status: "Pending Review",
            submission_date: new Date(),
        });
    }

    async getUpdatesByStudent(studentId) {
        // Resolve student PK if needed
        const student = await pgstudinfo.findOne({
            where: {
                [Op.or]: [
                    { pgstud_id: studentId },
                    { stu_id: studentId }
                ]
            }
        });

        if (!student) return [];

        return progress_updates.findAll({
            where: { pg_student_id: student.pgstud_id },
            order: [['submission_date', 'DESC']]
        });
    }

    async getPendingProgressUpdates() {
        return progress_updates.findAll({
            where: {
                status: { [Op.in]: ["Pending Review", "Pending"] }
            },
            include: [{
                model: pgstudinfo,
                as: 'pg_student',
                attributes: ['pgstud_id', 'FirstName', 'LastName', 'EmailId', 'Prog_Code']
            }],
            order: [['submission_date', 'DESC']]
        });
    }

    async reviewProgressUpdate(updateId, { supervisor_feedback, status }) {
        const update = await progress_updates.findByPk(updateId);
        if (!update) {
            const error = new Error("Progress update not found");
            error.status = 404;
            throw error;
        }

        const result = await update.update({
            supervisor_feedback,
            status: status || 'Reviewed',
            reviewed_at: new Date()
        });

        // Notify student
        await notificationService.createNotification({
            userId: update.pg_student_id,
            roleId: 'STU',
            title: 'Progress Update Reviewed',
            message: `Your progress update "${update.title}" has been reviewed.`,
            type: 'PROGRESS_REVIEWED',
            link: `/student/progress`
        });

        return result;
    }

    async getActiveStudentsInDepartment(depCode) {
        return pgstudinfo.findAll({
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
    }
}

export default new EvaluationService();
