import { Op } from "sequelize";
import {
    progress_updates,
    pgstudinfo,
    documents_uploads,
    pgstaffinfo,
    defense_evaluations,
    milestone_deadlines,
    role_assignment,
    program_info,
    sequelize
} from "../config/config.js";
import notificationService from "./notificationService.js";
import roleAssignmentService from "./roleAssignmentService.js";

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
        const update = await progress_updates.create({
            ...data,
            status: "Pending Review",
            submission_date: new Date(),
        });

        // Notify assigned supervisors
        try {
            const student = await pgstudinfo.findByPk(data.pg_student_id);
            const studentName = student ? `${student.FirstName} ${student.LastName}` : "A student";

            const assignments = await role_assignment.findAll({
                where: { pg_student_id: data.pg_student_id, status: 'Approved' }
            });

            for (const assignment of assignments) {
                await notificationService.createNotification({
                    userId: assignment.pg_staff_id,
                    roleId: 'SUV',
                    title: 'New Progress Update',
                    message: `${studentName} has submitted a new progress update: "${data.title}".`,
                    type: 'PROGRESS_SUBMITTED',
                    link: `/supervisor/evaluate`
                });
            }
        } catch (err) {
            console.error("Failed to send notification for progress update:", err);
        }

        return update;
    }

    async getUpdatesByStudent(studentId, userId, roleId) {
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

        // Access Control
        if (userId && (roleId === 'SUV' || roleId === 'EXA')) {
            const allowedTypes = roleId === 'EXA'
                ? ['Viva Voce Examiner']
                : ['Main Supervisor', 'Co-Supervisor'];

            const assignedIds = await roleAssignmentService.getAssignedStudentIds(userId, allowedTypes);
            if (!assignedIds.includes(student.pgstud_id)) {
                const error = new Error("Access denied: Not assigned to this student");
                error.status = 403;
                throw error;
            }
        }

        return progress_updates.findAll({
            where: { pg_student_id: student.pgstud_id },
            order: [['submission_date', 'DESC']]
        });
    }

    async getPendingProgressUpdates(userId, roleId) {
        const whereClause = {
            status: { [Op.in]: ["Pending Review", "Pending"] }
        };

        if (roleId === 'SUV' || roleId === 'EXA') {
            const allowedTypes = roleId === 'EXA'
                ? ['Viva Voce Examiner']
                : ['Main Supervisor', 'Co-Supervisor'];

            const assignedIds = await roleAssignmentService.getAssignedStudentIds(userId, allowedTypes);
            if (assignedIds.length === 0) return [];
            whereClause.pg_student_id = { [Op.in]: assignedIds };
        }

        return progress_updates.findAll({
            where: whereClause,
            include: [{
                model: pgstudinfo,
                as: 'pg_student',
                attributes: ['pgstud_id', 'FirstName', 'LastName', 'EmailId', 'Prog_Code']
            }],
            order: [['submission_date', 'DESC']]
        });
    }

    async reviewProgressUpdate(updateId, { supervisor_feedback, status, userId, roleId }) {
        const update = await progress_updates.findByPk(updateId);
        if (!update) {
            const error = new Error("Progress update not found");
            error.status = 404;
            throw error;
        }

        if (roleId === 'SUV' || roleId === 'EXA') {
            const allowedTypes = roleId === 'EXA'
                ? ['Viva Voce Examiner']
                : ['Main Supervisor', 'Co-Supervisor'];

            const assignedIds = await roleAssignmentService.getAssignedStudentIds(userId, allowedTypes);
            if (!assignedIds.includes(update.pg_student_id)) {
                const error = new Error("Access denied: You are not assigned to this student.");
                error.status = 403;
                throw error;
            }
        }

        const result = await update.update({
            supervisor_feedback,
            status: status || 'Reviewed',
            reviewed_at: new Date()
        });

        // Notify student
        const staff = await pgstaffinfo.findByPk(userId);
        const staffName = staff ? `${staff.Honorific_Titles || ''} ${staff.FirstName} ${staff.LastName}`.trim() : "A supervisor";

        await notificationService.createNotification({
            userId: update.pg_student_id,
            roleId: 'STU',
            title: 'Progress Update Reviewed',
            message: `Your progress update "${update.title}" has been reviewed by ${staffName}.`,
            type: 'PROGRESS_REVIEWED',
            link: `/student/progress`
        });

        return result;
    }

    async getStudentsForUser(userId, roleId, depCode = null) {
        const whereClause = { Status: { [Op.in]: ['Active', 'Pending'] } };

        if (roleId === 'SUV' || roleId === 'EXA') {
            const allowedTypes = roleId === 'EXA'
                ? ['Viva Voce Examiner']
                : ['Main Supervisor', 'Co-Supervisor'];

            const assignedIds = await roleAssignmentService.getAssignedStudentIds(userId, allowedTypes);
            if (assignedIds.length === 0) return [];
            whereClause.pgstud_id = { [Op.in]: assignedIds };
        } else {
            // Only use Dep_Code for Admins/Staff if provided
            if (depCode) {
                whereClause.Dep_Code = depCode;
            }
        }

        return pgstudinfo.findAll({
            where: whereClause,
            include: [{
                model: progress_updates,
                as: 'progress_updates',
                limit: 1,
                order: [['submission_date', 'DESC']]
            }, {
                model: documents_uploads,
                as: 'documents_uploads',
                attributes: ['document_type', 'status']
            }, {
                model: role_assignment,
                as: 'role_assignments',
                include: [{
                    model: pgstaffinfo,
                    as: 'pg_staff',
                    attributes: ['FirstName', 'LastName', 'Honorific_Titles']
                }],
                where: { status: 'Approved' },
                required: false
            }, {
                model: program_info,
                as: 'Prog_Code_program_info',
                attributes: ['prog_name']
            }]
        });
    }

    async getStudentDetailViewData(studentId) {
        const student = await pgstudinfo.findByPk(studentId, {
            include: [
                { model: progress_updates, as: 'progress_updates', order: [['submission_date', 'DESC']] },
                { model: documents_uploads, as: 'documents_uploads', order: [['uploaded_at', 'DESC']] },
                { model: milestone_deadlines, as: 'milestone_deadlines', order: [['deadline_date', 'ASC']] },
                { model: program_info, as: 'Prog_Code_program_info', attributes: ['prog_name'] }
            ]
        });

        if (!student) {
            const error = new Error("Student not found");
            error.status = 404;
            throw error;
        }

        // Get assigned supervisors
        const assignments = await roleAssignmentService.getAssignedStaff(studentId);

        return {
            student,
            assignments
        };
    }

    async updateMilestoneDeadline(data) {
        const { pg_student_id, milestone_name, deadline_date, reason, updated_by } = data;

        // Check if exists
        let deadline = await milestone_deadlines.findOne({
            where: { pgstudent_id: pg_student_id, milestone_name }
        });

        if (deadline) {
            await deadline.update({
                deadline_date,
                reason,
                updated_by,
                updated_at: new Date()
            });
        } else {
            deadline = await milestone_deadlines.create({
                pgstudent_id: pg_student_id,
                milestone_name,
                deadline_date,
                reason,
                updated_by
            });
        }

        // Notify student
        await notificationService.createNotification({
            userId: pg_student_id,
            roleId: 'STU',
            title: 'Deadline Adjusted',
            message: `Your deadline for "${milestone_name}" has been adjusted to ${new Date(deadline_date).toLocaleDateString()}. Reason: ${reason}`,
            type: 'DEADLINE_ADJUSTED'
        });

        return deadline;
    }

    async manualCompleteMilestone(studentId, milestoneName, staffId) {
        // We "complete" a milestone by creating a dummy entry in documents_uploads with status 'Completed'
        const completion = await documents_uploads.create({
            pg_student_id: studentId,
            document_name: `[Manual Entry] ${milestoneName}`,
            document_type: milestoneName,
            file_path: 'MANUAL_COMPLETION',
            file_size_kb: 0,
            status: 'Completed',
            uploaded_at: new Date()
        });

        // Notify student
        await notificationService.createNotification({
            userId: studentId,
            roleId: 'STU',
            title: 'Milestone Flagged as Completed',
            message: `Your "${milestoneName}" milestone has been manually flagged as "Completed" by CGS staff.`,
            type: 'MILESTONE_COMPLETED'
        });

        return completion;
    }
}

export default new EvaluationService();
