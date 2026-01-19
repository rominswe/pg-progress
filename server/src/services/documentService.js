import { documents_uploads, documents_reviews, pgstudinfo, role_assignment, pgstaffinfo } from "../config/config.js";
import notificationService from "./notificationService.js";
import fs from "node:fs";
import path from "node:path";

class DocumentService {
    async uploadDocuments({ studentId, files, documentType }) {
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
        const uploadedTypes = new Set(documents.map(d => d.document_type));

        let progress = 0;
        milestones.forEach(m => { if (uploadedTypes.has(m)) progress += 20; });

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

    async getSupervisorDocuments(depCode) {
        return documents_uploads.findAll({
            include: [{
                model: pgstudinfo,
                as: "pg_student",
                attributes: ["FirstName", "LastName", "stu_id", "Dep_Code"],
                where: depCode ? { Dep_Code: depCode } : undefined
            }],
            order: [["uploaded_at", "DESC"]]
        });
    }

    async reviewDocument({ docUpId, userId, status, comments, score }) {
        const doc = await documents_uploads.findByPk(docUpId);
        if (!doc) {
            const error = new Error("Document not found");
            error.status = 404;
            throw error;
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
        await notificationService.createNotification({
            userId: doc.pg_student_id,
            roleId: 'STU',
            title: 'Document Reviewed',
            message: `Your document "${doc.document_name}" has been ${status.toLowerCase()}.`,
            type: 'REVIEW_COMPLETED',
            link: `/student/documents`
        });

        return review;
    }
}

export default new DocumentService();
