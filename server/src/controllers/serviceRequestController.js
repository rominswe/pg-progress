import initModels from "../models/init-models.js";
import { sequelize } from "../config/config.js";
import { Op } from 'sequelize';

const models = initModels(sequelize);
const { service_requests, master_stu } = models;

export const createRequest = async (req, res) => {
    try {
        // For students, req.user.id is master_id (or we use req.user.master_id if available)
        const master_id = (req.user.master_id || req.user.id).toString().trim();

        const {
            fullName,
            studentId,
            program,
            currentSemester,
            serviceCategory,
            signature
        } = req.body;

        // Filter out top-level fields to get the dynamic details
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

        res.status(201).json({ message: "Request created", request: newRequest });
    } catch (error) {
        console.error("Create Request Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status && status !== 'All') where.status = status;

        // Filter for student's own requests
        if (req.user.role_id === 'STU') {
            const userId = String(req.user.id || '').trim();
            // Use LIKE to match ID even if there are trailing spaces in DB or Session
            where.master_id = { [Op.like]: `${userId}%` };
        }

        console.log(`[getRequests] User: ${req.user.id} (${req.user.role_id}), Where:`, where);

        const requests = await service_requests.findAll({
            where,
            order: [['submission_date', 'DESC']],
            include: [{
                model: master_stu,
                as: 'master',
                attributes: ['FirstName', 'LastName', 'EmailId']
            }]
        });

        res.json({ requests });
    } catch (error) {
        console.error("Get Requests Error:", error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body;

        const request = await service_requests.findByPk(id);
        if (!request) return res.status(404).json({ error: "Request not found" });

        request.status = status;

        // Update details with comments
        let details = request.request_details || {};
        details.supervisor_comments = comments;
        // Need to explicitly set changed if updating JSON/Object
        request.request_details = details;
        request.changed('request_details', true);

        await request.save();
        res.json({ message: "Status updated", request });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ error: error.message });
    }
};
