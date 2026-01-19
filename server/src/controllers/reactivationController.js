import { sendReactivationRequestEmail } from "../utils/reactivationEmail.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { pgstaffinfo, pgstudinfo } from "../config/config.js";
import { Op } from "sequelize";

/**
 * Handle reactivation request from CGSS users
 * Sends email notification to system admin without storing in database
 */
export const requestReactivation = async (req, res) => {
    try {
        const { userId, userName, userEmail, userRole, requestedBy, requestedByName } = req.body;

        // Validate required fields
        if (!userId || !userName || !requestedBy) {
            return sendError(res, "Missing required fields: userId, userName, or requestedBy", 400);
        }

        // --- NEW: Identity Validation ---
        // Verify the user actually exists in our system before requesting reactivation
        // Try Staff first (most likely scenario for detailed roles)
        let userExists = await pgstaffinfo.findOne({
            where: {
                [Op.or]: [{ pgstaff_id: userId }, { emp_id: userId }]
            }
        });

        // If not staff, check student
        if (!userExists) {
            userExists = await pgstudinfo.findByPk(userId);
        }

        if (!userExists) {
            return sendError(res, "User not found in system records. Cannot request reactivation.", 404);
        }

        // Send email to system admin
        await sendReactivationRequestEmail({
            userId, // This should be the PGID (pg_staff_id or pgstud_id) preferable
            userName,
            userEmail,
            userRole,
            requestedBy,
            requestedByName
        });

        return sendSuccess(res, "Reactivation request sent successfully to system administrator");
    } catch (err) {
        console.error("[REACTIVATION_REQUEST_ERROR]", err);
        return sendError(res, err.message || "Failed to send reactivation request", 500);
    }
};
