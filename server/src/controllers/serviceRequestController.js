import ServiceRequestService from "../services/serviceRequestService.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const createRequest = async (req, res) => {
    try {
        const studentId = (req.user.pgstud_id || req.user.id).toString().trim();

        const {
            currentSemester,
            serviceCategory,
            signature
        } = req.body;

        const otherDetails = { ...req.body };
        delete otherDetails.fullName;
        delete otherDetails.studentId;
        delete otherDetails.program;
        delete otherDetails.currentSemester;
        delete otherDetails.serviceCategory;
        delete otherDetails.signature;

        const newRequest = await ServiceRequestService.createRequest({
            studentId,
            currentSemester,
            serviceCategory,
            signature,
            otherDetails
        });

        sendSuccess(res, "Request created", { request: newRequest }, 201);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

export const getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const userId = (req.user.pgstud_id || req.user.id).toString().trim();
        const roleId = req.user.role_id;

        const requests = await ServiceRequestService.getRequests({
            status,
            userId,
            roleId
        });

        sendSuccess(res, "Requests fetched", { requests });
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body;
        const userId = req.user.pgstud_id || req.user.id;
        const { role_id } = req.user;

        const request = await ServiceRequestService.updateRequestStatus(id, {
            status,
            comments,
            userId,
            roleId: role_id
        });

        sendSuccess(res, "Status updated", { request });
    } catch (error) {
        console.error("[UPDATE_REQUEST_ERROR]", error);
        sendError(res, error.message, error.status || 500);
    }
};
