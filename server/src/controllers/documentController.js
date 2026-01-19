import DocumentService from "../services/documentService.js";
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

    const docs = await DocumentService.uploadDocuments({
      studentId: id,
      files: req.files,
      documentType: document_type
    });

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

    const documents = await DocumentService.getStudentDocuments(id);

    sendSuccess(res, "Documents fetched successfully", { documents });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id: userId, role_id } = req.user;
    const { id } = req.params;

    const doc = await DocumentService.getDocumentById(id);
    if (!doc) return sendError(res, "Document not found", 404);

    const isOwner = doc.pg_student_id === userId;
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

    const doc = await DocumentService.getDocumentById(id);
    if (!doc) return sendError(res, "Document not found", 404);

    const isOwner = doc.pg_student_id === userId;
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

    const doc = await DocumentService.getDocumentById(id);
    if (!doc) return sendError(res, "Document not found", 404);

    await DocumentService.deleteDocument(doc, userId);

    sendSuccess(res, "Document deleted successfully");
  } catch (err) {
    console.error("[DELETE_DOC_ERROR]", err);
    sendError(res, err.message, err.status || 500);
  }
};

export const getStudentDashboardStats = async (req, res) => {
  try {
    const { id: userId, role_id } = req.user;
    if (role_id !== "STU") return sendError(res, "Access denied", 403);

    const statsData = await DocumentService.getStudentStats(userId);

    sendSuccess(res, "Dashboard stats fetched successfully", statsData);
  } catch (err) {
    sendError(res, "Failed to fetch dashboard stats", 500);
  }
};

export const getSupervisorDocuments = async (req, res) => {
  try {
    const { role_id, Dep_Code } = req.user;
    if (!["SUV", "CGSADM", "CGSS"].includes(role_id)) return sendError(res, "Access denied", 403);

    const documents = await DocumentService.getSupervisorDocuments(Dep_Code);
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

    const review = await DocumentService.reviewDocument({
      docUpId: doc_up_id,
      userId,
      status,
      comments,
      score
    });

    sendSuccess(res, "Reviewed successfully", { review });
  } catch (err) {
    console.error("[REVIEW_DOC_ERROR]", err);
    sendError(res, err.message, err.status || 500);
  }
};
