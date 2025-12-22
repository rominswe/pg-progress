import { auditLog } from "../config/config.js";

// Get all audit logs
export const getAllAuditLogs = async (req, res) => {
  try {
    const logs = await auditLog.findAll();
    res.json({ status: "success", logs });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get single audit log
export const getAuditLogById = async (req, res) => {
  try {
    const log = await auditLog.findByPk(req.params.audit_id);
    if (!log) return res.status(404).json({ status: "error", message: "Audit log not found" });
    res.json({ status: "success", log });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
