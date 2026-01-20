import { service_requests, pgstudinfo, pgstaffinfo, pgstaff_roles } from "../config/config.js";
import { Op } from "sequelize";
import notificationService from "./notificationService.js";
import roleAssignmentService from "./roleAssignmentService.js";

class ServiceRequestService {
    async createRequest({ studentId, currentSemester, serviceCategory, signature, otherDetails }) {
        const request = await service_requests.create({
            pg_student_id: studentId,
            current_semester: currentSemester,
            service_category: serviceCategory,
            request_details: otherDetails,
            status: 'Pending',
            submission_date: new Date(),
            signature: signature,
        });

        // Notify Admins
        const admins = await pgstaffinfo.findAll({
            include: [{
                model: pgstaff_roles,
                as: 'pgstaff_roles',
                where: { role_id: 'CGSADM' }
            }]
        });

        const student = await pgstudinfo.findByPk(studentId);
        const studentName = student ? `${student.FirstName} ${student.LastName}` : "A student";

        for (const admin of admins) {
            await notificationService.createNotification({
                userId: admin.pgstaff_id,
                roleId: 'CGSADM',
                title: 'New Service Request',
                message: `${studentName} has submitted a new ${serviceCategory} request.`,
                type: 'SERVICE_REQUEST',
                link: `/admin/service-requests`
            });
        }

        return request;
    }

    async getRequests({ status, userId, roleId }) {
        const where = {};
        if (status && status !== 'All') where.status = status;
        if (roleId === 'STU') where.pg_student_id = userId;

        // Filter for Supervisors/Examiners
        if (['SUV', 'EXA'].includes(roleId)) {
            const assignedIds = await roleAssignmentService.getAssignedStudentIds(userId);
            if (assignedIds.length === 0) return []; // Return empty if no students assigned
            where.pg_student_id = { [Op.in]: assignedIds };
        }

        return service_requests.findAll({
            where,
            order: [['submission_date', 'DESC']],
            include: [{
                model: pgstudinfo,
                as: 'pg_student',
                attributes: ['FirstName', 'LastName', 'EmailId']
            }]
        });
    }

    async updateRequestStatus(id, { status, comments, userId, roleId }) {
        const request = await service_requests.findByPk(id);
        if (!request) {
            const error = new Error("Request not found");
            error.status = 404;
            throw error;
        }

        // Access Control: If Supervisor/Examiner, verify assignment
        if (['SUV', 'EXA'].includes(roleId)) {
            const assignedIds = await roleAssignmentService.getAssignedStudentIds(userId);
            if (!assignedIds.includes(request.pg_student_id)) {
                const error = new Error("Access denied: You are not assigned to this student.");
                error.status = 403;
                throw error;
            }
        }

        request.status = status;
        let details = request.request_details || {};
        details.supervisor_comments = comments;
        request.request_details = details;
        request.changed('request_details', true);

        const result = await request.save();

        // Notify Student
        const staff = await pgstaffinfo.findByPk(userId);
        const staffName = staff ? `${staff.Honorific_Titles || ''} ${staff.FirstName} ${staff.LastName}`.trim() : "CGS staff";

        await notificationService.createNotification({
            userId: request.pg_student_id,
            roleId: 'STU',
            title: 'Service Request Update',
            message: `Your ${request.service_category} request has been ${status.toLowerCase()} by ${staffName}.`,
            type: 'REQUEST_UPDATED',
            link: `/student/requests`
        });

        return result;
    }
}

export default new ServiceRequestService();
