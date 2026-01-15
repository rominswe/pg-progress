import { doc_up, doc_rev, master_stu } from "../config/config.js";
import fs from "node:fs";

export const uploadDocument = async (req, res) => {
  try {
    // Debug who is uploading
    console.log("Upload Request from User:", req.user);

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // === FIX: Robust ID Handling ===
    // Use whatever ID field exists (id, student_id, admin_id)
    const userId = req.user.id || req.user.student_id || req.user.admin_id;
    const { role_id } = req.user;

    // === FIX: Check for Valid Document Type ===
    // If you send a type that isn't in your Database ENUM, this might fail.
    // We default to "Others" if the type is weird.
    let { document_type } = req.body;

    // Optional: List valid types if your DB is strict
    const validTypes = [
      "Progress Report",
      "Final Thesis",
      "Proposal",
      "Research Proposal",
      "Literature Review",
      "Methodology",
      "Data Analysis",
      "Ethics Form",
      "Supervisor Feedback",
      "Other"
    ];

    if (document_type === "Others") document_type = "Other"; // Map frontend "Others" to DB "Other"

    if (!validTypes.includes(document_type)) {
      console.log(`Warning: Type '${document_type}' not in list. Defaulting to 'Other' to prevent DB error.`);
      document_type = "Other";
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const docs = [];

    for (const file of req.files) {
      docs.push(await doc_up.create({
        uploaded_by: userId,
        master_id: userId,
        role_id,
        document_name: file.originalname,
        document_type: document_type,
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
    console.error("Upload Error:", err);
    // Return 500 so frontend knows it's a server error, not a permission error
    res.status(500).json({ error: err.message });
  }
};

// ... keep your other functions (getMyDocuments, etc.) the same ...

export const downloadDocument = async (req, res) => {
  try {
    const userId = req.user.id || req.user.student_id || req.user.admin_id;
    const { role_id } = req.user;
    const { id } = req.params;

    const doc = await doc_up.findByPk(id);

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Authorization: Only owner or Supervisor/Admin can view
    // Note: Assuming 'uploaded_by' stores the ID as a string or number matching `userId`
    // If strict checks are needed, convert distinct types.
    const isOwner = String(doc.uploaded_by) === String(userId);
    const isStaff = ["SUV", "CGSADM", "EXA", "CGSS"].includes(role_id);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if file exists on disk
    if (!fs.existsSync(doc.file_path)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    res.download(doc.file_path, doc.document_name);
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ error: "Could not download file" });
  }
};

// ... keep downloadDocument ...

export const deleteDocument = async (req, res) => {
  try {
    const userId = req.user.id || req.user.student_id || req.user.admin_id;
    const { id } = req.params;

    const doc = await doc_up.findByPk(id);

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Authorization: Only owner can delete
    const isOwner = String(doc.uploaded_by) === String(userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Optional: Prevent deleting if already reviewed
    if (doc.status !== 'Pending') {
      return res.status(400).json({ error: "Cannot delete reviewed documents" });
    }

    // Remove file from disk
    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    // Remove from DB
    await doc.destroy();

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Could not delete file" });
  }
};

// just make sure getMyDocuments ALSO uses the Robust ID Handling logic:
export const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.id || req.user.student_id || req.user.admin_id;
    const { role_id } = req.user;

    if (role_id !== "STU") {
      return res.status(403).json({ error: "Access denied" });
    }

    const documents = await doc_up.findAll({
      where: { uploaded_by: userId },
      order: [["uploaded_at", "DESC"]]
    });

    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ... keep reviewDocument, getSupervisorDocuments as they were ...
// ... existing code ...

export const getStudentDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user.student_id || req.user.admin_id;
    const { role_id } = req.user;

    if (role_id !== "STU") {
      return res.status(403).json({ error: "Access denied" });
    }

    // 1. Fetch all documents for this user
    const documents = await doc_up.findAll({
      where: { uploaded_by: userId },
      order: [["uploaded_at", "DESC"]]
    });

    // 2. Calculate Progress based on Milestones
    const milestones = [
      "Research Proposal",
      "Literature Review",
      "Methodology",
      "Data Analysis",
      "Final Thesis"
    ];

    // Find which milestones have been uploaded (at least once)
    const uploadedTypes = new Set(documents.map(d => d.document_type));
    const pendingCount = documents.filter(d => d.status === 'Pending').length;
    const approvedCount = documents.filter(d => d.status === 'Approved').length;
    const rejectedCount = documents.filter(d => d.status === 'Rejected').length;

    let progress = 0;
    milestones.forEach(m => {
      if (uploadedTypes.has(m)) progress += 20;
    });

    // 3. Prepare Stats
    const stats = {
      totalDocuments: documents.length,
      progress: progress,
      pendingReviews: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    };

    // 4. Analytics Data Preparation

    // A. Document Statistics (Bar Chart)
    const docStatsMap = {};
    documents.forEach(doc => {
      // Normalize type keys if needed, or just use as is
      const type = doc.document_type || 'Other';
      docStatsMap[type] = (docStatsMap[type] || 0) + 1;
    });

    const docStats = Object.keys(docStatsMap).map(key => ({
      name: key,
      count: docStatsMap[key]
    }));

    // B. Progress Trend (Line Chart) - Last 6 Months
    const monthlyProgress = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0); // Last day of that month

      // Calculate progress at this point in time
      // Filter docs uploaded BEFORE or ON endOfMonth
      const docsAtTime = documents.filter(doc => new Date(doc.uploaded_at) <= endOfMonth);

      const uploadedTypesAtTime = new Set(docsAtTime.map(doc => doc.document_type));
      let progressAtTime = 0;
      milestones.forEach(m => {
        if (uploadedTypesAtTime.has(m)) progressAtTime += 20;
      });

      monthlyProgress.push({
        month: monthName,
        completion: progressAtTime
      });
    }

    // 5. Recent Activity (Top 5)
    const recentActivity = documents.slice(0, 5).map(doc => ({
      id: doc.doc_up_id,
      action: `Uploaded ${doc.document_type}`,
      date: doc.uploaded_at,
      details: doc.document_name
    }));

    res.json({
      stats,
      analytics: {
        docStats,
        monthlyProgress
      },
      recentActivity
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export const getSupervisorDocuments = async (req, res) => {
  // ... (existing code)
  try {
    const { role_id, Dep_Code } = req.user;
    if (!["SUV", "CGSADM", "CGSS"].includes(role_id)) return res.status(403).json({ error: "Access denied" });
    const documents = await doc_up.findAll({
      where: { Dep_Code: Dep_Code || "CGS" },
      include: [{ model: master_stu, as: "master", attributes: ["FirstName", "LastName", "stu_id"] }],
      order: [["uploaded_at", "DESC"]]
    });
    res.json({ documents });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const reviewDocument = async (req, res) => {
  // ... (existing code)
  try {
    const userId = req.user.id || req.user.student_id || req.user.admin_id;
    const { role_id } = req.user;
    const { doc_up_id, status, comments, score } = req.body;
    if (!["SUV", "EXA", "CGSS", "CGSADM"].includes(role_id)) return res.status(403).json({ error: "Not authorized" });
    const doc = await doc_up.findByPk(doc_up_id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    const existing = await doc_rev.findOne({ where: { doc_up_id, reviewed_by: userId } });
    if (existing) return res.status(409).json({ error: "Already reviewed" });
    const review = await doc_rev.create({ doc_up_id, reviewed_by: userId, role_id, status, comments, score, Dep_Code: "CGS" });
    doc.status = status;
    await doc.save();
    res.json({ message: "Reviewed", review });
  } catch (err) { res.status(500).json({ error: err.message }); }
};