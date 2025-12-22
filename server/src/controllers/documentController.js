import { doc_up, doc_rev } from "../config/config.js";
import upload from "../middleware/upload.js";

/**
 * Upload document (single or multiple files)
 */
export const uploadDocument = async (req, res) => {
  const multiUpload = upload.array("files"); // multiple files allowed

  multiUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const user = req.user;
      const { document_type } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedDocs = [];

      for (let file of req.files) {
        const doc = await doc_up.create({
          uploaded_by: user[user.constructor.primaryKeyAttributes[0]],
          master_id: user.master_id || null,
          role_id: user.role_id,
          document_name: file.originalname,
          document_type: document_type || "Others",
          file_path: file.path,
          file_size_kb: Math.round(file.size / 1024),
          status: "Pending",
        });
        uploadedDocs.push(doc);
      }

      res.status(201).json({ message: "Documents uploaded successfully", documents: uploadedDocs });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
};

/**
 * Get documents uploaded by current user
 * Optional query params: status, document_type
 */
export const getMyDocuments = async (req, res) => {
  try {
    const user = req.user;
    const { status, document_type } = req.query;

    const whereClause = { uploaded_by: user[user.constructor.primaryKeyAttributes[0]] };
    if (status) whereClause.status = status;
    if (document_type) whereClause.document_type = document_type;

    const documents = await doc_up.findAll({ where: whereClause });

    res.status(200).json({ documents });
  } catch (err) {
    console.error("Get my documents error:", err);
    res.status(500).json({ error: "Server error" });
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