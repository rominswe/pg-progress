import { doc_up, doc_rev, master_stu, supervisor, examiner, auditLog } from "../config/config.js";
import upload from "../middleware/upload.js";
import fs from "fs";
import path from "path";
import { logAuthEvent } from "../utils/authSecurity.js";
import { createNotification, NOTIFICATION_TYPES } from "../utils/notifications.js";
import { auditLog as auditLogger, AUDIT_ACTIONS, AUDIT_STATUS, ENTITY_TYPES } from "../utils/audit.js";

/* ================= FILE VALIDATION CONFIG ================= */
const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip'
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES_PER_UPLOAD = 5;

/* ================= DOCUMENT TYPES ================= */
const DOCUMENT_TYPES = {
  THESIS_CHAPTER: 'Thesis Chapter',
  RESEARCH_PROPOSAL: 'Research Proposal',
  PROGRESS_REPORT: 'Progress Report',
  LITERATURE_REVIEW: 'Literature Review',
  FINAL_THESIS: 'Final Thesis',
  DRAFT: 'Draft',
  SUPPORTING_DOCS: 'Supporting Documents',
  OTHER: 'Other'
};

/* ================= ACCESS CONTROL ================= */
const DOCUMENT_ACCESS = {
  // Who can view documents by type
  [DOCUMENT_TYPES.THESIS_CHAPTER]: ['STU', 'SUV', 'EXA', 'CGSADM', 'EXCGS'],
  [DOCUMENT_TYPES.RESEARCH_PROPOSAL]: ['STU', 'SUV', 'EXA', 'CGSADM', 'EXCGS'],
  [DOCUMENT_TYPES.PROGRESS_REPORT]: ['STU', 'SUV', 'EXA', 'CGSADM', 'EXCGS'],
  [DOCUMENT_TYPES.LITERATURE_REVIEW]: ['STU', 'SUV', 'EXA', 'CGSADM', 'EXCGS'],
  [DOCUMENT_TYPES.FINAL_THESIS]: ['STU', 'SUV', 'EXA', 'CGSADM', 'EXCGS'],
  [DOCUMENT_TYPES.DRAFT]: ['STU', 'SUV', 'CGSADM', 'EXCGS'], // Examiners can't see drafts
  [DOCUMENT_TYPES.SUPPORTING_DOCS]: ['STU', 'SUV', 'CGSADM', 'EXCGS'],
  [DOCUMENT_TYPES.OTHER]: ['STU', 'SUV', 'EXA', 'CGSADM', 'EXCGS']
};

// Who can upload documents by type
const DOCUMENT_UPLOAD_PERMISSIONS = {
  [DOCUMENT_TYPES.THESIS_CHAPTER]: ['STU'],
  [DOCUMENT_TYPES.RESEARCH_PROPOSAL]: ['STU'],
  [DOCUMENT_TYPES.PROGRESS_REPORT]: ['STU'],
  [DOCUMENT_TYPES.LITERATURE_REVIEW]: ['STU'],
  [DOCUMENT_TYPES.FINAL_THESIS]: ['STU'],
  [DOCUMENT_TYPES.DRAFT]: ['STU'],
  [DOCUMENT_TYPES.SUPPORTING_DOCS]: ['STU', 'SUV', 'EXA'],
  [DOCUMENT_TYPES.OTHER]: ['STU', 'SUV', 'EXA', 'CGSADM']
};

/**
 * Enhanced document upload with validation and security
 */
export const uploadDocument = async (req, res) => {
  const multiUpload = upload.array("files", MAX_FILES_PER_UPLOAD);

  multiUpload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
          code: 'FILE_TOO_LARGE'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: `Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload`,
          code: 'TOO_MANY_FILES'
        });
      }
      return res.status(400).json({
        error: err.message,
        code: 'UPLOAD_ERROR'
      });
    }

    try {
      const user = req.user;
      const { document_type, master_id } = req.body;

      // Validate document type
      if (!Object.values(DOCUMENT_TYPES).includes(document_type)) {
        return res.status(400).json({
          error: "Invalid document type",
          valid_types: Object.values(DOCUMENT_TYPES),
          code: 'INVALID_DOCUMENT_TYPE'
        });
      }

      // Check upload permissions
      if (!DOCUMENT_UPLOAD_PERMISSIONS[document_type].includes(user.role_id)) {
        return res.status(403).json({
          error: `Role ${user.role_id} cannot upload ${document_type} documents`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: "No files uploaded",
          code: 'NO_FILES'
        });
      }

      // Validate each file
      for (let file of req.files) {
        if (!ALLOWED_FILE_TYPES[file.mimetype]) {
          // Clean up uploaded file
          fs.unlinkSync(file.path);
          return res.status(400).json({
            error: `File type ${file.mimetype} not allowed. Allowed: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`,
            code: 'INVALID_FILE_TYPE'
          });
        }
      }

      const uploadedDocs = [];

      for (let file of req.files) {
        // Determine master_id (for students, use their own; for staff, use specified)
        let targetMasterId = master_id;
        if (user.role_id === 'STU') {
          targetMasterId = user.master_id;
        } else if (!targetMasterId) {
          return res.status(400).json({
            error: "master_id is required for staff uploads",
            code: 'MISSING_MASTER_ID'
          });
        }

        // Verify the target student exists
        const student = await master_stu.findByPk(targetMasterId);
        if (!student) {
          // Clean up uploaded file
          fs.unlinkSync(file.path);
          return res.status(404).json({
            error: "Target student not found",
            code: 'STUDENT_NOT_FOUND'
          });
        }

        const doc = await doc_up.create({
          uploaded_by: user[user.constructor.primaryKeyAttributes[0]],
          master_id: targetMasterId,
          role_id: user.role_id,
          document_name: file.originalname,
          document_type: document_type,
          file_path: file.path,
          file_size_kb: Math.round(file.size / 1024),
          status: "Pending",
          version: 1 // Start with version 1
        });
        uploadedDocs.push(doc);
      }

      // Log upload event
      await auditLogger({
        userId: user.email,
        action: AUDIT_ACTIONS.DOCUMENT_UPLOAD,
        userRole: user.role_id,
        entityType: ENTITY_TYPES.DOCUMENT,
        entityId: uploadedDocs[0]?.doc_up_id?.toString(),
        details: `Uploaded ${uploadedDocs.length} ${document_type} document(s)`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.session?.id
      });

      await logAuthEvent(user.email, user.role_id, AUDIT_ACTIONS.DOCUMENT_UPLOAD, req);

      // Send notifications for document upload
      if (uploadedDocs.length > 0) {
        await sendDocumentUploadNotifications(uploadedDocs[0].master_id, document_type, uploadedDocs.length, user);
      }

      res.status(201).json({
        message: "Documents uploaded successfully",
        documents: uploadedDocs,
        code: 'UPLOAD_SUCCESS'
      });

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Server error during upload",
        code: 'SERVER_ERROR'
      });
    }
  });
};

/**
 * Download document with access control
 */
export const downloadDocument = async (req, res) => {
  try {
    const { doc_up_id } = req.params;
    const user = req.user;

    const document = await doc_up.findByPk(doc_up_id, {
      include: [{
        model: master_stu,
        as: 'master',
        attributes: ['master_id', 'supervisor_id', 'examiner_id']
      }]
    });

    if (!document) {
      return res.status(404).json({
        error: "Document not found",
        code: 'DOCUMENT_NOT_FOUND'
      });
    }

    // Check access permissions
    if (!DOCUMENT_ACCESS[document.document_type].includes(user.role_id)) {
      return res.status(403).json({
        error: `Access denied. Role ${user.role_id} cannot access ${document.document_type} documents`,
        code: 'ACCESS_DENIED'
      });
    }

    // Additional access control based on role
    if (user.role_id === 'STU' && document.master_id !== user.master_id) {
      return res.status(403).json({
        error: "Students can only access their own documents",
        code: 'OWN_DOCUMENTS_ONLY'
      });
    }

    if (user.role_id === 'SUV' && document.master.master?.supervisor_id !== user[user.constructor.primaryKeyAttributes[0]]) {
      return res.status(403).json({
        error: "Supervisors can only access documents of their assigned students",
        code: 'SUPERVISOR_ACCESS_ONLY'
      });
    }

    if (user.role_id === 'EXA' && document.master.master?.examiner_id !== user[user.constructor.primaryKeyAttributes[0]]) {
      return res.status(403).json({
        error: "Examiners can only access documents of their assigned students",
        code: 'EXAMINER_ACCESS_ONLY'
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({
        error: "File not found on server",
        code: 'FILE_MISSING'
      });
    }

    // Log download event
    await auditLogger({
      userId: user.email,
      action: AUDIT_ACTIONS.DOCUMENT_DOWNLOAD,
      userRole: user.role_id,
      entityType: ENTITY_TYPES.DOCUMENT,
      entityId: doc_up_id,
      details: `Downloaded document: ${document.document_name} (${document.document_type})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.id
    });

    await logAuthEvent(user.email, user.role_id, 'DOWNLOAD_DOCUMENT', document.document_name);

    // Send file
    res.download(document.file_path, document.document_name, (err) => {
      if (err) {
        console.error('Download error:', err);
        // Don't send error response if headers already sent
        if (!res.headersSent) {
          res.status(500).json({
            error: "Error downloading file",
            code: 'DOWNLOAD_ERROR'
          });
        }
      }
    });

  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      error: "Server error during download",
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Get all documents for a specific student (admin/supervisor/examiner access)
 */
export const getStudentDocuments = async (req, res) => {
  try {
    const { master_id } = req.params;
    const user = req.user;
    const { status, document_type } = req.query;

    // Verify access to this student's documents
    if (user.role_id === 'STU' && master_id !== user.master_id) {
      return res.status(403).json({
        error: "Access denied",
        code: 'ACCESS_DENIED'
      });
    }

    // For supervisors and examiners, verify assignment
    if (user.role_id === 'SUV') {
      const student = await master_stu.findByPk(master_id);
      if (!student || student.supervisor_id !== user[user.constructor.primaryKeyAttributes[0]]) {
        return res.status(403).json({
          error: "Can only access documents of assigned students",
          code: 'NOT_ASSIGNED_SUPERVISOR'
        });
      }
    }

    if (user.role_id === 'EXA') {
      const student = await master_stu.findByPk(master_id);
      if (!student || student.examiner_id !== user[user.constructor.primaryKeyAttributes[0]]) {
        return res.status(403).json({
          error: "Can only access documents of assigned students",
          code: 'NOT_ASSIGNED_EXAMINER'
        });
      }
    }

    const whereClause = { master_id };
    if (status) whereClause.status = status;
    if (document_type) whereClause.document_type = document_type;

    const documents = await doc_up.findAll({
      where: whereClause,
      include: [
        {
          model: master_stu,
          as: 'master',
          attributes: ['FirstName', 'LastName', 'EmailId']
        },
        {
          model: doc_rev,
          as: 'documents_reviews',
          required: false
        }
      ],
      order: [['uploaded_at', 'DESC']]
    });

    res.json({
      student_id: master_id,
      documents: documents,
      total: documents.length
    });

  } catch (error) {
    console.error('Get student documents error:', error);
    res.status(500).json({
      error: "Server error",
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Update document (version control)
 */
export const updateDocument = async (req, res) => {
  try {
    const { doc_up_id } = req.params;
    const user = req.user;

    const document = await doc_up.findByPk(doc_up_id);
    if (!document) {
      return res.status(404).json({
        error: "Document not found",
        code: 'DOCUMENT_NOT_FOUND'
      });
    }

    // Only document owner or admin can update
    if (document.uploaded_by !== user[user.constructor.primaryKeyAttributes[0]] &&
        !['CGSADM', 'EXCGS'].includes(user.role_id)) {
      return res.status(403).json({
        error: "Only document owner or admin can update documents",
        code: 'UPDATE_DENIED'
      });
    }

    // Handle file upload for new version
    const singleUpload = upload.single("file");

    singleUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: err.message,
          code: 'UPLOAD_ERROR'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "No file provided for update",
          code: 'NO_FILE'
        });
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES[req.file.mimetype]) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          error: `File type ${req.file.mimetype} not allowed`,
          code: 'INVALID_FILE_TYPE'
        });
      }

      // Create new version
      const newVersion = document.version + 1;
      const newDocument = await doc_up.create({
        uploaded_by: user[user.constructor.primaryKeyAttributes[0]],
        master_id: document.master_id,
        role_id: user.role_id,
        document_name: req.file.originalname,
        document_type: document.document_type,
        file_path: req.file.path,
        file_size_kb: Math.round(req.file.size / 1024),
        status: "Pending",
        version: newVersion,
        parent_doc_id: document.doc_up_id // Reference to original
      });

      // Log version update
      await auditLogger({
        userId: user.email,
        action: AUDIT_ACTIONS.DOCUMENT_VERSION_CREATED,
        userRole: user.role_id,
        entityType: ENTITY_TYPES.DOCUMENT,
        entityId: newVersionDoc.doc_up_id.toString(),
        details: `Updated document ${document.document_name} to version ${newVersion}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.session?.id
      });

      await logAuthEvent(user.email, user.role_id, AUDIT_ACTIONS.DOCUMENT_VERSION_CREATED, req);

      res.json({
        message: "Document updated successfully",
        new_version: newDocument,
        previous_version: document.doc_up_id,
        code: 'UPDATE_SUCCESS'
      });
    });

  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      error: "Server error",
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Delete document (admin only)
 */
export const deleteDocument = async (req, res) => {
  try {
    const { doc_up_id } = req.params;
    const user = req.user;

    const document = await doc_up.findByPk(doc_up_id);
    if (!document) {
      return res.status(404).json({
        error: "Document not found",
        code: 'DOCUMENT_NOT_FOUND'
      });
    }

    // Only admin can delete documents
    if (!['CGSADM', 'EXCGS'].includes(user.role_id)) {
      return res.status(403).json({
        error: "Only administrators can delete documents",
        code: 'DELETE_DENIED'
      });
    }

    // Delete physical file
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete from database
    await document.destroy();

    // Log deletion
    await auditLogger({
      userId: user.email,
      action: AUDIT_ACTIONS.DOCUMENT_DELETE,
      userRole: user.role_id,
      entityType: ENTITY_TYPES.DOCUMENT,
      entityId: doc_up_id,
      details: `Deleted document: ${document.document_name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.id
    });
      timestamp: new Date()
    });

    await logAuthEvent(user.email, user.role_id, 'DELETE_DOCUMENT', document.document_name);

    res.json({
      message: "Document deleted successfully",
      code: 'DELETE_SUCCESS'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      error: "Server error",
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Get document versions/history
 */
export const getDocumentVersions = async (req, res) => {
  try {
    const { doc_up_id } = req.params;
    const user = req.user;

    const document = await doc_up.findByPk(doc_up_id);
    if (!document) {
      return res.status(404).json({
        error: "Document not found",
        code: 'DOCUMENT_NOT_FOUND'
      });
    }

    // Check access permissions
    if (!DOCUMENT_ACCESS[document.document_type].includes(user.role_id)) {
      return res.status(403).json({
        error: "Access denied",
        code: 'ACCESS_DENIED'
      });
    }

    // Get all versions of this document
    const versions = await doc_up.findAll({
      where: {
        master_id: document.master_id,
        document_type: document.document_type,
        document_name: document.document_name
      },
      order: [['version', 'DESC'], ['uploaded_at', 'DESC']]
    });

    res.json({
      document_name: document.document_name,
      document_type: document.document_type,
      versions: versions,
      total_versions: versions.length
    });

  } catch (error) {
    console.error('Get document versions error:', error);
    res.status(500).json({
      error: "Server error",
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Review a document
 * Only roles: SUV (Supervisor), EXA/EXEB (Examiners)
 */
export const reviewDocument = async (req, res) => {
  try {
    const user = req.user;
    const { doc_up_id, status, comments, score } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const doc = await doc_up.findByPk(doc_up_id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Create review record
    const review = await doc_rev.create({
      doc_up_id: doc.doc_up_id,
      reviewed_by: user[user.constructor.primaryKeyAttributes[0]],
      role_id: user.role_id,
      status,
      comments: comments || null,
      score: score || 0,
    });

    // Update document status
    doc.status = status;
    await doc.save();

    res.status(200).json({ message: "Document reviewed successfully", review });
  } catch (err) {
    console.error("Review document error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Send notifications for document uploads
 */
const sendDocumentUploadNotifications = async (studentId, documentType, fileCount, uploader) => {
  try {
    // Get student and related users
    const student = await master_stu.findByPk(studentId, {
      include: [
        { model: supervisor, as: 'supervisor' },
        { model: examiner, as: 'examiner' }
      ]
    });

    if (!student) return;

    // Notify supervisor about new document upload
    if (student.supervisor) {
      await createNotification({
        recipientId: student.supervisor.SupID,
        recipientRole: 'SUV',
        type: NOTIFICATION_TYPES.DOCUMENT_REVIEW,
        message: `Student ${student.FirstName} ${student.LastName} has uploaded ${fileCount} new ${documentType} document(s) for review.`,
        relatedEntity: {
          type: 'DOCUMENT',
          id: studentId
        },
        actionUrl: `/documents/student/${studentId}`
      });
    }

    // Notify examiner for final thesis documents
    if (student.examiner && ['Final Thesis', 'Thesis Chapter'].includes(documentType)) {
      await createNotification({
        recipientId: student.examiner.ExamID,
        recipientRole: 'EXA',
        type: NOTIFICATION_TYPES.DOCUMENT_REVIEW,
        message: `Student ${student.FirstName} ${student.LastName} has uploaded ${documentType} document(s) requiring examination.`,
        relatedEntity: {
          type: 'DOCUMENT',
          id: studentId
        },
        actionUrl: `/documents/student/${studentId}`
      });
    }

    // Self-notification for student (confirmation)
    if (student.IsVerified && uploader.role_id === 'STU') {
      await createNotification({
        recipientId: student.master_id,
        recipientRole: 'STU',
        type: NOTIFICATION_TYPES.SYSTEM_ALERT,
        message: `Successfully uploaded ${fileCount} ${documentType} document(s). They are now pending review.`,
        relatedEntity: {
          type: 'DOCUMENT',
          id: studentId
        },
        actionUrl: '/documents'
      });
    }

  } catch (error) {
    console.error('Error sending document upload notifications:', error);
    // Don't throw error to avoid breaking the main flow
  }
};