import { documents_uploads, documents_reviews, pgstudinfo, role_assignment, pgstaffinfo } from "../config/config.js";
import { Op } from "sequelize";
import notificationService from "./notificationService.js";
import roleAssignmentService from "./roleAssignmentService.js";
import fs from "node:fs";
import path from "node:path";

class DocumentService {
    async uploadDocuments({ studentId, files, documentType }) {
        if (documentType) {
            // Submission Limit Logic
            const limit = documentType === "Final Thesis" ? 1 : 2;
            const exceptions = ["Progress Report", "Other", "Thesis Chapter", "Ethics Form", "Supervisor Feedback"];

            if (!exceptions.includes(documentType)) {
                const existingDocs = await documents_uploads.findAll({
                    where: {
                        pg_student_id: studentId,
                        document_type: documentType,
                        // Only count if not Rejected/Resubmit (unless restart logic is strict)
                        // User rule: "After 2 submissions, cannot submit unless Rejected... If rejected, count RESETS"
                        // So checking ONLY PENDING/APPROVED/COMPLETED for the current 'active' attempt count?
                        // Actually, user says: "A student is allowed to submit documents a maximum of 2 times per stage."
                        // "If rejected, the submission count resets".
                        // So we count ALL submissions for this type, UNLESS there is a 'Rejected' status later?
                        // Easier logic: Count how many are NOT Rejected/Resubmit since the last Rejected/Resubmit?
                        // Or simply count consecutively pending/approved docs?
                        // Let's count non-rejected, non-resubmit docs.
                        status: { [Op.notIn]: ['Rejected', 'Resubmit', 'Restarted'] }
                    }
                });

                if (existingDocs.length >= limit) {
                    const error = new Error(`Submission limit reached for ${documentType}. Maximum allowed: ${limit}.`);
                    error.status = 403;
                    throw error;
                }
            }
        }

        const docs = [];
        for (const file of files) {
            docs.push(await documents_uploads.create({
                pg_student_id: studentId,
                document_name: file.originalname,
                document_type: documentType || "Other",
                file_path: file.path,
                file_size_kb: Math.round(file.size / 1024),
                status: "Pending",
                uploaded_at: new Date()
            }));
        }

        // Notify assigned supervisors
        const assignments = await role_assignment.findAll({
            where: { pg_student_id: studentId, status: 'Approved' },
            include: [{ model: pgstaffinfo, as: 'pg_staff' }]
        });

        const student = await pgstudinfo.findByPk(studentId);
        const studentName = student ? `${student.FirstName} ${student.LastName}` : "A student";

        for (const assignment of assignments) {
            await notificationService.createNotification({
                userId: assignment.pg_staff_id,
                roleId: 'SUV',
                title: 'New Document Uploaded',
                message: `${studentName} has uploaded ${files.length} new document(s) for review.`,
                type: 'DOCUMENT_UPLOAD',
                link: `/supervisor/documents`
            });
        }

        return docs;
    }

    async getStudentDocuments(studentId) {
        return documents_uploads.findAll({
            where: { pg_student_id: studentId },
            include: [{
                model: documents_reviews,
                as: 'documents_reviews',
                include: [{
                    model: pgstaffinfo,
                    as: 'reviewed_by_pgstaffinfo', // alias might need verifying, assuming 'reviewer' or 'pg_staff'
                    attributes: ['FirstName', 'LastName']
                }]
            }],
            order: [["uploaded_at", "DESC"]]
        });
    }

    async getDocumentById(id) {
        return documents_uploads.findByPk(id);
    }

    async deleteDocument(doc, userId) {
        if (doc.pg_student_id !== userId) {
            const error = new Error("Access denied");
            error.status = 403;
            throw error;
        }
        if (doc.status !== 'Pending') {
            const error = new Error("Cannot delete reviewed documents");
            error.status = 400;
            throw error;
        }

        if (fs.existsSync(doc.file_path)) fs.unlinkSync(doc.file_path);
        return doc.destroy();
    }

    async getStudentStats(userId) {
        const documents = await this.getStudentDocuments(userId);

        const milestones = ["Research Proposal", "Literature Review", "Methodology", "Data Analysis", "Final Thesis"];

        // Count milestone as progress if any document of that type is Pending or Approved
        let progress = 0;
        milestones.forEach(m => {
            const hasSubmission = documents.some(d => d.document_type === m && (d.status === 'Approved' || d.status === 'Pending' || d.status === 'Completed'));
            if (hasSubmission) progress += 20;
        });

        const stats = {
            totalDocuments: documents.length,
            progress: progress,
            pendingReviews: documents.filter(d => d.status === 'Pending').length,
            approved: documents.filter(d => d.status === 'Approved').length,
            rejected: documents.filter(d => d.status === 'Rejected').length
        };

        const docStatsMap = {};
        documents.forEach(doc => {
            const type = doc.document_type || 'Other';
            docStatsMap[type] = (docStatsMap[type] || 0) + 1;
        });

        const docStats = Object.keys(docStatsMap).map(key => ({ name: key, count: docStatsMap[key] }));

        const recentActivity = documents.slice(0, 5).map(doc => ({
            id: doc.doc_up_id,
            action: `Uploaded ${doc.document_type}`,
            date: doc.uploaded_at,
            details: doc.document_name
        }));

        return { stats, analytics: { docStats }, recentActivity };
    }

    async getSupervisorDocuments(depCode, userId, roleId) {
        const whereClause = {};

        // If Supervisor or Examiner, strictly filter by assigned students
        if (['SUV', 'EXA'].includes(roleId)) {
            const assignedStudentIds = await roleAssignmentService.getAssignedStudentIds(userId);
            if (assignedStudentIds.length === 0) return []; // No students assigned
            whereClause.pg_student_id = { [Op.in]: assignedStudentIds };
        } else {
            // Admins see department data
            if (depCode) {
                // We need to filter by student's department.
                // The include logic below handles this, but we can't easily put it in the top-level whereClause without nesting or separate query.
                // Actually, the existing logic puts Dep_Code in the include where.
            }
        }

        return documents_uploads.findAll({
            where: whereClause,
            include: [{
                model: pgstudinfo,
                as: "pg_student",
                attributes: ["FirstName", "LastName", "stu_id", "Dep_Code"],
                where: (roleId === 'CGSADM' || roleId === 'CGSS') && depCode ? { Dep_Code: depCode } : undefined
            }],
            order: [["uploaded_at", "DESC"]]
        });
    }

    async reviewDocument({ docUpId, userId, status, comments, score, roleId }) {
        const doc = await documents_uploads.findByPk(docUpId);
        if (!doc) {
            const error = new Error("Document not found");
            error.status = 404;
            throw error;
        }

        // Special Rule: Final Thesis
        // "The supervisor can only evaluate the Final Thesis AFTER the student submits it."
        // "Supervisor can evaluate the Final Thesis only once IF the decision is Pass."
        // AND "If the supervisor selects any option other than Pass... The student must resubmit."
        // This implies the REVIEW action for Final Thesis should be blocked here if it's meant to be done via the Evaluation Form?
        // OR allow it here but enforce the logic.
        // User said: "supervisor doesnt need to do approve or reject... if he chose the pass option only [in evaluation], the document will send to the examiner."
        // This strongly implies we should BLOCK manual `reviewDocument` usage for 'Final Thesis' type, forcing them to use `submitEvaluation`.
        if (doc.document_type === 'Final Thesis') {
            const error = new Error("Final Thesis must be evaluated via the Defense Evaluation form, not here.");
            error.status = 403;
            throw error;
        }

        // Access Control: Verify Assignment if NOT Admin
        if (['SUV', 'EXA'].includes(roleId)) {
            const assignedIds = await roleAssignmentService.getAssignedStudentIds(userId);
            if (!assignedIds.includes(doc.pg_student_id)) {
                const error = new Error("Access denied: You are not assigned to this student.");
                error.status = 403;
                throw error;
            }
        }

        const existing = await documents_reviews.findOne({ where: { doc_up_id: docUpId, reviewed_by: userId } });
        if (existing) {
            const error = new Error("You already reviewed this document");
            error.status = 409;
            throw error;
        }

        const review = await documents_reviews.create({
            doc_up_id: docUpId,
            reviewed_by: userId,
            status,
            comments: comments || null,
            score: score || null,
            reviewed_at: new Date()
        });

        doc.status = status;
        await doc.save();

        // Notify student of review
        const staff = await pgstaffinfo.findByPk(userId);
        const staffName = staff ? `${staff.Honorific_Titles || ''} ${staff.FirstName} ${staff.LastName}`.trim() : "A staff member";

        await notificationService.createNotification({
            userId: doc.pg_student_id,
            roleId: 'STU',
            title: 'Document Reviewed',
            message: `Your document "${doc.document_name}" has been ${status.toLowerCase()} by ${staffName}.`,
            type: 'REVIEW_COMPLETED',
            link: `/student/documents`
        });

        return review;
    }
}

export default new DocumentService();
