import { Op } from "sequelize";
import {
    progress_updates,
    pgstudinfo,
    documents_uploads,
    pgstaffinfo,
    defense_evaluations,
    milestones,
    role_assignment,
    program_info,
    sequelize
} from "../config/config.js";
import notificationService from "./notificationService.js";
import roleAssignmentService from "./roleAssignmentService.js";
import milestoneService from "./milestoneService.js";

class EvaluationService {
    // --- Defense Evaluations ---

    async createDefenseEvaluation(data) {
        // Validation: Student exists (Supporting both PGID and STU_ID)
        let student = await pgstudinfo.findByPk(data.pg_student_id);

        if (!student) {
            student = await pgstudinfo.findOne({ where: { stu_id: data.pg_student_id } });
        }

        if (!student) {
            const error = new Error(`Student with ID "${data.pg_student_id}" does not exist.`);
            error.status = 404;
            throw error;
        }

        // Normalize ID to pgstud_id for subsequent queries and storage
        data.pg_student_id = student.pgstud_id;

        // Validation: If Final Thesis, check if submitted
        if (data.defense_type === 'Final Thesis') {
            const finalThesis = await documents_uploads.findOne({
                where: {
                    pg_student_id: data.pg_student_id,
                    document_type: 'Final Thesis',
                    // Logic: Get the latest one that is PENDING/SUBMITTED?
                    status: { [Op.in]: ['Pending', 'Approved', 'Resubmit'] }
                },
                order: [['uploaded_at', 'DESC']]
            });

            if (!finalThesis) {
                const error = new Error(`Student has not submitted their Final Thesis yet.`);
                error.status = 403;
                throw error;
            }

            // SUPERVISOR LOGIC
            if (data.evaluator_role === 'SUV') {
                if (finalThesis.status !== 'Pending' && finalThesis.status !== 'Resubmit') {
                    // Already approved? Supervisor cannot re-evaluate if PASS.
                    // "Supervisor can evaluate the Final Thesis only once IF the decision is Pass."
                    if (finalThesis.status === 'Approved') {
                        const error = new Error("Final Thesis already approved. Cannot re-evaluate.");
                        error.status = 403;
                        throw error;
                    }
                }

                // "Only when the supervisor selects “Pass” should the Final Thesis be forwarded to the examiner."
                // "Pass with Minor Corrections" -> NOT forwarded -> Resubmit.
                // Supervisor uses 'final_comments' dropdown.
                const outcome = data.viva_outcome || data.final_comments;
                const isPass = outcome === 'Pass';
                const newStatus = isPass ? 'Approved' : 'Resubmit';

                await finalThesis.update({ status: newStatus });
            }

            // EXAMINER LOGIC
            if (data.evaluator_role === 'EXA') {
                // Must be Approved (by Supervisor) first
                if (finalThesis.status !== 'Approved') {
                    const error = new Error("Final Thesis has not been approved by the Supervisor yet.");
                    error.status = 403;
                    throw error;
                }

                // STRICT CHECK: Only "Pass" leads to Completion.
                const outcome = data.viva_outcome || data.final_comments;

                if (outcome === 'Pass') {
                    // Pass -> Completed
                    await finalThesis.update({ status: 'Completed' });
                } else if (outcome === 'Fail' || outcome === 'Reject') {
                    // Fail -> Restart Logic
                    await this.restartRoadmap(data.pg_student_id);
                    await finalThesis.update({ status: 'Rejected' });
                } else {
                    // "Pass with Minor Corrections", "Pass with Major Corrections", "Resubmit", "Resubmission of Thesis"
                    // "The student is required to resubmit, and the supervisor must evaluate it again."
                    await finalThesis.update({ status: 'Resubmit' });
                }
            }
        }

        const evaluation = await defense_evaluations.create({
            ...data,
            evaluation_date: data.evaluation_date || new Date(),
        });

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
                attributes: ['FirstName', 'LastName', 'EmailId', 'stu_id']
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
        // Resolve student PK first to ensure consistent lookups
        const studentRecord = await pgstudinfo.findOne({
            where: {
                [Op.or]: [
                    { pgstud_id: studentId },
                    { stu_id: studentId }
                ]
            }
        });

        if (!studentId || !studentRecord) {
            const error = new Error("Student not found");
            error.status = 404;
            throw error;
        }

        const pk = studentRecord.pgstud_id;

        const student = await pgstudinfo.findByPk(pk, {
            include: [
                { model: progress_updates, as: 'progress_updates', order: [['submission_date', 'DESC']] },
                { model: documents_uploads, as: 'documents_uploads', order: [['uploaded_at', 'DESC']] },
                { model: milestones, as: 'milestone_overrides', order: [['deadline_date', 'ASC']] },
                { model: program_info, as: 'Prog_Code_program_info', attributes: ['prog_name'] }
            ]
        });

        if (!student) {
            const error = new Error("Student not found");
            error.status = 404;
            throw error;
        }

        // Get assigned supervisors
        const assignments = await roleAssignmentService.getAssignedStaff(pk);

        return {
            student,
            assignments
        };
    }

    async updateMilestoneDeadline(data) {
        const { pg_student_id, milestone_name, deadline_date, reason, updated_by, alert_lead_days } = data;

        const deadline = await milestoneService.upsertStudentDeadline({
            milestone_name,
            pg_student_id,
            deadline_date,
            reason,
            updated_by,
            alert_lead_days
        });

        await notificationService.createNotification({
            userId: pg_student_id,
            roleId: 'STU',
            title: 'Deadline Adjusted',
            message: `Your deadline for "${deadline.name}" has been adjusted to ${new Date(deadline_date).toLocaleDateString()}. Reason: ${reason}`,
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

    async restartRoadmap(studentId) {
        // "Soft Reset": Mark all current milestones (documents) as 'Restarted' or 'Archived'??
        // Status enum in documents_uploads: 'Pending', 'Approved', 'Rejected', 'Completed', 'Resubmit'
        // We probably need to add 'Restarted' or simply 'Rejected'?
        // The user requirements say "Student must restart the entire thesis roadmap... All previous progress is invalidated."
        // So we should probably mark APPROVED/COMPLETED items as something else, OR just rely on a new 'Restarted' status?
        // Let's use 'Rejected' for simplicity if 'Restarted' isn't in ENUM, but 'Restarted' would be cleaner.
        // Wait, I didn't add 'Restarted' to ENUM.
        // Let's check ENUM again. documents_uploads.js: 'Pending', 'Approved', 'Rejected', 'Completed', 'Resubmit'.
        // So I should invalidate them. Setting them to 'Rejected' might be confusing if they were 'Approved'.
        // Maybe I should add 'Archived' or 'Restarted' to ENUM?
        // For now, let's use 'Rejected' but add a note or separate tracking?
        // Actually, if I set them to 'Rejected', the `updateRoadmap` on frontend will see them as rejected and might ask for resubmission.
        // But "All previous progress is invalidated" implies we should treat it as if they don't exist or are effectively removed from calculation.
        // If I delete them, we lose history.
        // Use 'Rejected'. The frontend logic for `updateRoadmap`:
        // "If we are here, it means we have either NO docs, or only REJECTED/RESUBMIT docs... allow submission"
        // So if I mark EVERYTHING as Rejected, the student will be prompted to resubmit the FIRST one (Research Proposal).
        // This effectively restarts the roadmap.

        await documents_uploads.update(
            { status: 'Rejected' },
            {
                where: {
                    pg_student_id: studentId,
                    status: { [Op.in]: ['Approved', 'Completed', 'Pending', 'Resubmit'] }
                }
            }
        );

        // Also clear defense evaluations?? Or keep them as history?
        // "All previous progress is invalidated." -> Reset milestone overrides
        await milestones.destroy({ where: { pgstudent_id: studentId } });

        // Notify
        await notificationService.createNotification({
            userId: studentId,
            roleId: 'STU',
            title: 'Thesis Roadmap Restarted',
            message: 'Your thesis roadmap has been restarted due to a "Fail" outcome. Please begin from the Research Proposal stage.',
            type: 'ROADMAP_RESTARTED'
        });
    }
}

export default new EvaluationService();
