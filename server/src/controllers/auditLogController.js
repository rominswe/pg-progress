import { auditLog } from "../config/config.js";

const ensureCGSAdmin = (req) => {
  if (req.user.role_id !== "CGSADM") {
    const err = new Error("Forbidden: Admin access only");
    err.status = 403;
    throw err;
  }
};

// Audit Logs - Read Only
export const getAuditLogsAdmin = async (req, res) => {
  try {

    ensureCGSAdmin(req); // CGS Admin only
    const logs = await auditLog.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      total: logs.length,
      logs
    });

  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message || "Failed to fetch audit logs"
    });
  }
};