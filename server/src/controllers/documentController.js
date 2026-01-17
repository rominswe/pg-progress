import { documents_uploads, documents_reviews } from "../config/config.js";
import upload from "../middleware/upload.js";

/**
 * Upload document (single or multiple files)
 */
export const uploadDocument = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  upload.array("files")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const { id, role_id } = req.user;
      const { document_type } = req.body;

      if (role_id !== "STU") {
        return res.status(403).json({ error: "Only students can upload documents" });
      }

      if (!req.files?.length) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const docs = [];

      for (const file of req.files) {
        docs.push(await documents_uploads.create({
          uploaded_by: id,
          master_id: id,
          role_id,
          document_name: file.originalname,
          document_type: document_type || "Others",
          file_path: file.path,
          file_size_kb: Math.round(file.size / 1024),
          status: "Pending",
          Dep_Code: "CGS"
        }));
      }

      res.status(201).json({
        message: "Documents uploaded successfully",
        documents: docs
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

/**
 * Get documents uploaded by current user
 * Optional query params: status, document_type
 */
export const getMyDocuments = async (req, res) => {
  try {
    const { id, role_id } = req.user;
    if (role_id !== "STU") {
      return res.status(403).json({ error: "Access denied" });
    }

    const documents = await documents_uploads.findAll({
      where: { uploaded_by: id },
      order: [["uploaded_at", "DESC"]]
    });

    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Review a document
 * Only roles: SUV (Supervisor), EXA/EXEB (Examiners)
 */
export const reviewDocument = async (req, res) => {
  try {
    const { id, role_id } = req.user;
    const { doc_up_id, status, comments, score } = req.body;

    if (!["SUV", "EXA", "CGSS", "CGSADM"].includes(role_id)) {
      return res.status(403).json({ error: "Not authorized to review documents" });
    }

    const doc = await documents_uploads.findByPk(doc_up_id);
    if (doc.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized document access" });
    if (!doc) return res.status(404).json({ error: "Document not found" });


    // Prevent double review
    const existing = await documents_reviews.findOne({
      where: { doc_up_id, reviewed_by: id }
    });
    if (existing) {
      return res.status(409).json({ error: "You already reviewed this document" });
    }

    const review = await documents_reviews.create({
      doc_up_id,
      reviewed_by: id,
      role_id,
      status,
      comments: comments || null,
      score: score || null,
      Dep_Code: "CGS"
    });

    doc.status = status;
    await doc.save();

    res.json({ message: "Document reviewed", review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};