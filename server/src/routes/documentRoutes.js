import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import { requirePermission, requireRole } from "../middleware/rbacMiddleware.js";
import { PERMISSIONS } from "../config/rbac.js";
import {
  uploadDocument,
  getMyDocuments,
  reviewDocument,
  downloadDocument,
  getStudentDocuments,
  updateDocument,
  deleteDocument,
  getDocumentVersions,
  DOCUMENT_TYPES,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
} from "../controllers/documentController.js";
import {
  validateDocumentUpload,
  validateDocumentReview,
  validateUserId,
  validatePagination
} from "../utils/validation.js";
import { validateFileUpload } from "../utils/validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Document Management
 *   description: File upload, download, review, and version management for postgraduate documents
 */

/**
 * @swagger
 * /api/v1/documents/upload:
 *   post:
 *     summary: Upload document(s)
 *     description: Upload one or more documents with metadata. Supports multiple file types and automatic version management. Requires UPLOAD_DOCUMENTS permission.
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *               - document_type
 *               - title
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Document files to upload (max 5 files)
 *                 maxItems: 5
 *               document_type:
 *                 type: string
 *                 enum: [proposal, thesis_chapter, literature_review, data_analysis, final_thesis, presentation, other]
 *                 description: Type of document being uploaded
 *                 example: thesis_chapter
 *               title:
 *                 type: string
 *                 description: Document title
 *                 example: Literature Review Chapter 1
 *               description:
 *                 type: string
 *                 description: Optional document description
 *                 example: Comprehensive review of existing research in the field
 *               is_public:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the document is publicly accessible
 *                 example: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Document tags for organization
 *                 example: [research, methodology, chapter1]
 *     responses:
 *       201:
 *         description: Documents uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Documents uploaded successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       doc_up_id:
 *                         type: integer
 *                         example: 1
 *                       filename:
 *                         type: string
 *                         example: literature_review_chapter1.pdf
 *                       original_filename:
 *                         type: string
 *                         example: Literature Review Chapter 1.pdf
 *                       file_path:
 *                         type: string
 *                         example: uploads/documents/2024/01/15/literature_review_chapter1.pdf
 *                       file_size:
 *                         type: integer
 *                         example: 2048576
 *                       mime_type:
 *                         type: string
 *                         example: application/pdf
 *                       document_type:
 *                         type: string
 *                         example: thesis_chapter
 *                       title:
 *                         type: string
 *                         example: Literature Review Chapter 1
 *                       version:
 *                         type: integer
 *                         example: 1
 *                       uploaded_by:
 *                         type: integer
 *                         example: 12345
 *                       uploaded_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:30:00Z
 *       400:
 *         description: Validation error or file upload failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       415:
 *         description: Unsupported file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/documents/me:
 *   get:
 *     summary: Get my documents
 *     description: Retrieve documents uploaded by the currently authenticated user. Includes pagination and filtering options.
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of documents per page
 *       - in: query
 *         name: document_type
 *         schema:
 *           type: string
 *           enum: [proposal, thesis_chapter, literature_review, data_analysis, final_thesis, presentation, other]
 *         description: Filter by document type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, revision_required]
 *         description: Filter by document status
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       doc_up_id:
 *                         type: integer
 *                         example: 1
 *                       filename:
 *                         type: string
 *                         example: literature_review_chapter1.pdf
 *                       original_filename:
 *                         type: string
 *                         example: Literature Review Chapter 1.pdf
 *                       file_size:
 *                         type: integer
 *                         example: 2048576
 *                       mime_type:
 *                         type: string
 *                         example: application/pdf
 *                       document_type:
 *                         type: string
 *                         example: thesis_chapter
 *                       title:
 *                         type: string
 *                         example: Literature Review Chapter 1
 *                       description:
 *                         type: string
 *                         example: Comprehensive review of existing research
 *                       version:
 *                         type: integer
 *                         example: 1
 *                       status:
 *                         type: string
 *                         enum: [pending, approved, rejected, revision_required]
 *                         example: pending
 *                       review_comments:
 *                         type: string
 *                         example: Good work, but needs more references
 *                       reviewed_by:
 *                         type: integer
 *                         nullable: true
 *                         example: 1001
 *                       reviewed_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: 2024-01-16T14:20:00Z
 *                       uploaded_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:30:00Z
 *                       last_modified:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:30:00Z
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/documents/student/{master_id}:
 *   get:
 *     summary: Get student documents
 *     description: Retrieve all documents for a specific student. Requires READ_USER permission.
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: master_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student master ID
 *         example: 12345
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of documents per page
 *       - in: query
 *         name: document_type
 *         schema:
 *           type: string
 *           enum: [proposal, thesis_chapter, literature_review, data_analysis, final_thesis, presentation, other]
 *         description: Filter by document type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, revision_required]
 *         description: Filter by document status
 *     responses:
 *       200:
 *         description: Student documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       doc_up_id:
 *                         type: integer
 *                         example: 1
 *                       filename:
 *                         type: string
 *                         example: thesis_proposal.pdf
 *                       original_filename:
 *                         type: string
 *                         example: Thesis Proposal.pdf
 *                       file_size:
 *                         type: integer
 *                         example: 1572864
 *                       mime_type:
 *                         type: string
 *                         example: application/pdf
 *                       document_type:
 *                         type: string
 *                         example: proposal
 *                       title:
 *                         type: string
 *                         example: Thesis Proposal
 *                       version:
 *                         type: integer
 *                         example: 2
 *                       status:
 *                         type: string
 *                         enum: [pending, approved, rejected, revision_required]
 *                         example: approved
 *                       uploaded_by:
 *                         type: integer
 *                         example: 12345
 *                       uploaded_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-10T09:15:00Z
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/documents/download/{doc_up_id}:
 *   get:
 *     summary: Download document
 *     description: Download a specific document file with access control checks. Requires READ_USER permission.
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: doc_up_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document upload ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Document file download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename="thesis_proposal.pdf"
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: application/pdf
 *           Content-Length:
 *             schema:
 *               type: string
 *               example: "1572864"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions or not authorized to download this document
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/documents/update/{doc_up_id}:
 *   put:
 *     summary: Update document (new version)
 *     description: Upload a new version of an existing document. Creates a new version entry while preserving the old version. Requires UPLOAD_DOCUMENTS permission.
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: doc_up_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document upload ID to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New version of the document file
 *               title:
 *                 type: string
 *                 description: Updated document title (optional)
 *                 example: Literature Review Chapter 1 - Revised
 *               description:
 *                 type: string
 *                 description: Updated document description (optional)
 *                 example: Revised version with additional references
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated document tags (optional)
 *                 example: [research, methodology, chapter1, revised]
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Document updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     doc_up_id:
 *                       type: integer
 *                       example: 1
 *                     filename:
 *                       type: string
 *                       example: literature_review_chapter1_v2.pdf
 *                     version:
 *                       type: integer
 *                       example: 2
 *                     uploaded_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-20T11:45:00Z
 *       400:
 *         description: Validation error or file upload failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/documents/versions/{doc_up_id}:
 *   get:
 *     summary: Get document versions
 *     description: Retrieve all versions of a specific document. Requires READ_USER permission.
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: doc_up_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document upload ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Document versions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       version_id:
 *                         type: integer
 *                         example: 1
 *                       doc_up_id:
 *                         type: integer
 *                         example: 1
 *                       version:
 *                         type: integer
 *                         example: 2
 *                       filename:
 *                         type: string
 *                         example: literature_review_chapter1_v2.pdf
 *                       file_size:
 *                         type: integer
 *                         example: 2097152
 *                       uploaded_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-20T11:45:00Z
 *                       uploaded_by:
 *                         type: integer
 *                         example: 12345
 *                       change_description:
 *                         type: string
 *                         example: Added additional references and revised methodology section
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/documents/{doc_up_id}:
 *   delete:
 *     summary: Delete document
 *     description: Delete a document and all its versions. Requires MANAGE_SYSTEM permission (admin only).
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: doc_up_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document upload ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Document deleted successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/documents/review:
 *   post:
 *     summary: Review document
 *     description: Submit a review for a document with approval/rejection status and comments. Requires REVIEW_DOCUMENTS permission.
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doc_up_id
 *               - status
 *             properties:
 *               doc_up_id:
 *                 type: integer
 *                 description: Document upload ID to review
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, revision_required]
 *                 description: Review decision
 *                 example: approved
 *               comments:
 *                 type: string
 *                 description: Review comments and feedback
 *                 example: Excellent work! The literature review is comprehensive and well-structured. Approved for progression to next stage.
 *               revision_deadline:
 *                 type: string
 *                 format: date
 *                 description: Deadline for revisions (required if status is revision_required)
 *                 example: 2024-02-15
 *     responses:
 *       200:
 *         description: Document review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Document review submitted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     doc_up_id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: approved
 *                     review_comments:
 *                       type: string
 *                       example: Excellent work! The literature review is comprehensive and well-structured.
 *                     reviewed_by:
 *                       type: integer
 *                       example: 1001
 *                     reviewed_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-16T14:20:00Z
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/documents/config:
 *   get:
 *     summary: Get document configuration
 *     description: Retrieve document management configuration including allowed file types, maximum file sizes, and document types.
 *     tags: [Document Management]
 *     responses:
 *       200:
 *         description: Document configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 document_types:
 *                   type: array
 *                   items:
 *                     type: string
 *                     enum: [proposal, thesis_chapter, literature_review, data_analysis, final_thesis, presentation, other]
 *                   example: [proposal, thesis_chapter, literature_review, data_analysis, final_thesis, presentation, other]
 *                 allowed_file_types:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [.pdf, .doc, .docx, .txt, .rtf, .odt, .ppt, .pptx, .xls, .xlsx, .csv, .zip, .rar]
 *                 max_file_size:
 *                   type: integer
 *                   description: Maximum file size in bytes
 *                   example: 10485760
 *                 max_files_per_upload:
 *                   type: integer
 *                   example: 5
 */

// All routes require authentication
router.use(protect());

// ✅ Upload document(s) - students and academic staff
router.post("/upload",
  validateDocumentUpload,
  validateFileUpload(ALLOWED_FILE_TYPES, MAX_FILE_SIZE),
  requirePermission(PERMISSIONS.UPLOAD_DOCUMENTS),
  uploadDocument
);

// ✅ Get logged-in user's documents - students can view their own
router.get("/me", validatePagination, requirePermission(PERMISSIONS.READ_USER), getMyDocuments);

// ✅ Get all documents for a specific student
router.get("/student/:master_id", validateUserId, validatePagination, requirePermission(PERMISSIONS.READ_USER), getStudentDocuments);

// ✅ Download document with access control
router.get("/download/:doc_up_id", validateUserId, requirePermission(PERMISSIONS.READ_USER), downloadDocument);

// ✅ Update document (new version)
router.put("/update/:doc_up_id",
  validateUserId,
  validateDocumentUpload,
  validateFileUpload(ALLOWED_FILE_TYPES, MAX_FILE_SIZE),
  requirePermission(PERMISSIONS.UPLOAD_DOCUMENTS),
  updateDocument
);

// ✅ Get document versions/history
router.get("/versions/:doc_up_id", validateUserId, requirePermission(PERMISSIONS.READ_USER), getDocumentVersions);

// ✅ Delete document (admin only)
router.delete("/:doc_up_id", validateUserId, requirePermission(PERMISSIONS.MANAGE_SYSTEM), deleteDocument);

// ✅ Review document - academic staff with review permissions
router.post("/review", validateDocumentReview, requirePermission(PERMISSIONS.REVIEW_DOCUMENTS), reviewDocument);

// ✅ Get document configuration (for frontend)
router.get("/config", (req, res) => {
  res.json({
    document_types: DOCUMENT_TYPES,
    allowed_file_types: ALLOWED_FILE_TYPES,
    max_file_size: MAX_FILE_SIZE,
    max_files_per_upload: 5
  });
});

export default router;