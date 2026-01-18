import { documents_uploads, documents_reviews, pgstudinfo } from "../config/config.js";
import fs from "node:fs";
import path from "node:path";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const uploadDocument = async (req, res) => {
  try {
    const { id, role_id } = req.user;
    let { document_type } = req.body;

    if (role_id !== "STU") {
      return sendError(res, "Only students can upload documents", 403);
    }

    if (!req.files?.length) {
      return sendError(res, "No files uploaded", 400);
    }

    // Map common aliases to DB valid types
    if (document_type === "Others") document_type = "Other";

    const validTypes = [
      "Progress Report", "Final Thesis", "Proposal", "Research Proposal",
      "Literature Review", "Methodology", "Data Analysis", "Ethics Form",
      "Supervisor Feedback", "Other"
    ];

    if (!validTypes.includes(document_type)) {
      document_type = "Other";
    }

    const docs = [];
    for (const file of req.files) {
      docs.push(await documents_uploads.create({
        uploaded_by: id,
        master_id: id, // Mapping to pgstud_id
        role_id,
        document_name: file.originalname,
        document_type: document_type || "Other",
        file_path: file.path,
        file_size_kb: Math.round(file.size / 1024),
        status: "Pending",
        Dep_Code: req.user.Dep_Code || "CGS"
      }));
    }

    sendSuccess(res, "Documents uploaded successfully", { documents: docs }, 201);
  } catch (err) {
    console.error("[UPLOAD_DOC_ERROR]", err);
    sendError(res, err.message, 500);
  }
};

export const getMyDocuments = async (req, res) => {
  try {
    const { id, role_id } = req.user;

    if (role_id !== "STU") {
      return sendError(res, "Access denied", 403);
    }

    const documents = await documents_uploads.findAll({
      where: { uploaded_by: id },
      order: [["uploaded_at", "DESC"]]
    });

    sendSuccess(res, "Documents fetched successfully", { documents });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id: userId, role_id } = req.user;
    const { id } = req.params;

    const doc = await documents_uploads.findByPk(id);
    if (!doc) return sendError(res, "Document not found", 404);

    const isOwner = doc.uploaded_by === userId;
    const isStaff = ["SUV", "CGSADM", "EXA", "CGSS"].includes(role_id);

    if (!isOwner && !isStaff) return sendError(res, "Access denied", 403);

    if (!fs.existsSync(doc.file_path)) return sendError(res, "File not found on server", 404);

    res.download(doc.file_path, doc.document_name);
  } catch (err) {
    sendError(res, "Could not download file", 500);
  }
};

export const viewDocument = async (req, res) => {
  try {
    const { id: userId, role_id } = req.user;
    const { id } = req.params;

    const doc = await documents_uploads.findByPk(id);
    if (!doc) return sendError(res, "Document not found", 404);

    const isOwner = doc.uploaded_by === userId;
    const isStaff = ["SUV", "CGSADM", "EXA", "CGSS"].includes(role_id);

    if (!isOwner && !isStaff) return sendError(res, "Access denied", 403);

    const normalizedPath = path.normalize(doc.file_path).replace(/\\/g, '/');
    if (!fs.existsSync(normalizedPath)) return sendError(res, "File not found on server", 404);

    const ext = path.extname(normalizedPath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    fs.createReadStream(normalizedPath).pipe(res);
  } catch (err) {
    sendError(res, "Could not view file", 500);
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;

    const doc = await documents_uploads.findByPk(id);
    if (!doc) return sendError(res, "Document not found", 404);

    if (doc.uploaded_by !== userId) return sendError(res, "Access denied", 403);
    if (doc.status !== 'Pending') return sendError(res, "Cannot delete reviewed documents", 400);

    if (fs.existsSync(doc.file_path)) fs.unlinkSync(doc.file_path);
    await doc.destroy();

    sendSuccess(res, "Document deleted successfully");
  } catch (err) {
    sendError(res, "Could not delete file", 500);
  }
};

export const getStudentDashboardStats = async (req, res) => {
  try {
    const { id: userId, role_id } = req.user;
    if (role_id !== "STU") return sendError(res, "Access denied", 403);

    const documents = await documents_uploads.findAll({
      where: { uploaded_by: userId },
      order: [["uploaded_at", "DESC"]]
    });

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

    sendSuccess(res, "Dashboard stats fetched successfully", { stats, analytics: { docStats }, recentActivity });
  } catch (err) {
    sendError(res, "Failed to fetch dashboard stats", 500);
  }
};

export const getSupervisorDocuments = async (req, res) => {
  try {
    const { role_id, Dep_Code } = req.user;
    if (!["SUV", "CGSADM", "CGSS"].includes(role_id)) return sendError(res, "Access denied", 403);

    const documents = await documents_uploads.findAll({
      where: { Dep_Code: Dep_Code || "CGS" },
      include: [{ model: pgstudinfo, as: "master", attributes: ["FirstName", "LastName", "stu_id"] }],
      order: [["uploaded_at", "DESC"]]
    });
    sendSuccess(res, "Documents fetched successfully", { documents });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

export const reviewDocument = async (req, res) => {
  try {
    const { id: userId, role_id } = req.user;
    const { doc_up_id, status, comments, score } = req.body;

    if (!["SUV", "EXA", "CGSS", "CGSADM"].includes(role_id)) {
      return sendError(res, "Not authorized to review documents", 403);
    }

    const doc = await documents_uploads.findByPk(doc_up_id);
    if (!doc) return sendError(res, "Document not found", 404);

    const existing = await documents_reviews.findOne({ where: { doc_up_id, reviewed_by: userId } });
    if (existing) return sendError(res, "You already reviewed this document", 409);

    const review = await documents_reviews.create({
      doc_up_id,
      reviewed_by: userId,
      role_id,
      status,
      comments: comments || null,
      score: score || null,
      Dep_Code: req.user.Dep_Code || "CGS"
    });

    doc.status = status;
    await doc.save();
    sendSuccess(res, "Reviewed successfully", { review });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};