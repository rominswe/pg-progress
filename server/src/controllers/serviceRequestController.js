import { service_requests, pgstudinfo } from "../config/config.js";
import { Op } from 'sequelize';
import { sendSuccess, sendError } from "../utils/responseHandler.js";


export const createRequest = async (req, res) => {
    try {
        const master_id = (req.user.pgstud_id || req.user.id).toString().trim();

        const {
            fullName,
            studentId,
            program,
            currentSemester,
            serviceCategory,
            signature
        } = req.body;

        const request_details = { ...req.body };
        delete request_details.fullName;
        delete request_details.studentId;
        delete request_details.program;
        delete request_details.currentSemester;
        delete request_details.serviceCategory;
        delete request_details.signature;

        const newRequest = await service_requests.create({
            master_id,
            full_name: fullName,
            student_id_display: studentId,
            program,
            current_semester: currentSemester,
            service_category: serviceCategory,
            request_details: request_details,
            signature: signature
        });

        sendSuccess(res, "Request created", { request: newRequest }, 201);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

export const getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status && status !== 'All') where.status = status;

        if (req.user.role_id === 'STU') {
            const userId = (req.user.pgstud_id || req.user.id).toString().trim();
            where.master_id = userId;
        }

        const requests = await service_requests.findAll({
            where,
            order: [['submission_date', 'DESC']],
            include: [{
                model: pgstudinfo,
                as: 'student',
                attributes: ['FirstName', 'LastName', 'EmailId']
            }]
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

        const request = await service_requests.findByPk(id);
        if (!request) return sendError(res, "Request not found", 404);

        request.status = status;
        let details = request.request_details || {};
        details.supervisor_comments = comments;
        request.request_details = details;
        request.changed('request_details', true);

        await request.save();
        sendSuccess(res, "Status updated", { request });
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
