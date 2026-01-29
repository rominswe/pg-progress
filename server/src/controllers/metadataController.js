import { qualification, expertise, pgstaffinfo } from "../config/config.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

/**
 * Get all qualifications
 */
export const getQualifications = async (req, res) => {
    try {
        const list = await qualification.findAll({
            attributes: ['qualification_code', 'qualification_name', 'qualification_level']
        });
        return sendSuccess(res, "Qualifications fetched.", list);
    } catch (err) {
        console.error("[GET_QUALIFICATIONS_ERROR]", err);
        return sendError(res, err.message, 500);
    }
};

/**
 * Get expertise with optional department filtering
 */
export const getExpertise = async (req, res) => {
    try {
        const { depCode } = req.query;
        const filter = depCode ? { where: { Dep_Code: depCode } } : {};

        const list = await expertise.findAll({
            ...filter,
            attributes: ['expertise_code', 'expertise_name', 'Dep_Code']
        });
        return sendSuccess(res, "Expertise fetched.", list);
    } catch (err) {
        console.error("[GET_EXPERTISE_ERROR]", err);
        return sendError(res, err.message, 500);
    }
};

/**
 * Get ENUM values for Honorific Titles and Academic Ranks
 */
export const getStaffCredentialsMetadata = async (req, res) => {
    try {
        const hTitles = pgstaffinfo.rawAttributes.Honorific_Titles.values || [];
        const aRanks = pgstaffinfo.rawAttributes.Academic_Rank.values || [];

        return sendSuccess(res, "Staff credentials metadata fetched.", {
            honorificTitles: hTitles,
            academicRanks: aRanks
        });
    } catch (err) {
        console.error("[GET_STAFF_METADATA_ERROR]", err);
        return sendError(res, err.message, 500);
    }
};
