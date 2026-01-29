import { searchUniversities } from "../services/universityService.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

/**
 * Controller for University related operations
 */
export const getUniversities = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return sendSuccess(res, "Universities fetched.", []);
        }

        const universities = await searchUniversities(q);
        return sendSuccess(res, "Universities fetched.", universities);
    } catch (err) {
        console.error("[UniversityController] Error in getUniversities:", err);
        return sendError(res, err.message, 500);
    }
};
