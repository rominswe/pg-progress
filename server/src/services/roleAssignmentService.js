import { Op } from "sequelize";
import {
    role_assignment,
    pgstudinfo,
    pgstaffinfo,
    pgstaff_roles,
    program_info,
    roles,
    tbldepartments,
    sequelize
} from "../config/config.js";

class RoleAssignmentService {
    async fetchStaffWithRole(staffId, roleId) {
        return pgstaffinfo.findOne({
            where: { pgstaff_id: staffId },
            include: [{
                model: pgstaff_roles,
                as: 'pgstaff_roles',
                where: { role_id: roleId },
                required: true
            }]
        });
    }

    async checkAssignmentLimit(studentId, staffId, assignmentType) {
        // Main Supervisor Unique Check
        if (assignmentType === 'Main Supervisor') {
            const existingMain = await role_assignment.findOne({
                where: {
                    pg_student_id: studentId,
                    assignment_type: 'Main Supervisor',
                    status: { [Op.in]: ["Pending", "Approved"] }
                }
            });
            if (existingMain) return { allowed: false, message: "Student already has a Main Supervisor." };
        }

        // Student Limit: Max 12 Staff
        const studentCount = await role_assignment.count({
            where: { pg_student_id: studentId, status: { [Op.in]: ["Pending", "Approved"] } }
        });
        if (studentCount >= 12) return { allowed: false, message: "Student has reached max assignments (12)." };

        // Staff Limit: Max 12 Students
        const staffCount = await role_assignment.count({
            where: { pg_staff_id: staffId, status: { [Op.in]: ["Pending", "Approved"] } }
        });
        if (staffCount >= 12) return { allowed: false, message: "Staff has reached max students (12)." };

        return { allowed: true };
    }

    async isDuplicate(studentId, staffId, staffType) {
        const existing = await role_assignment.findOne({
            where: {
                pg_student_id: studentId,
                pg_staff_id: staffId,
                pg_staff_type: staffType,
                status: { [Op.in]: ["Pending", "Approved"] }
            }
        });
        return !!existing;
    }

    async getAssignedStudentIds(staffId, allowedAssignmentTypes = []) {
        const whereClause = {
            pg_staff_id: staffId,
            status: 'Approved'
        };

        if (allowedAssignmentTypes && allowedAssignmentTypes.length > 0) {
            whereClause.assignment_type = { [Op.in]: allowedAssignmentTypes };
        }

        const assignments = await role_assignment.findAll({
            where: whereClause,
            attributes: ['pg_student_id'],
            raw: true
        });
        return assignments.map(a => a.pg_student_id);
    }

    async createAssignment(data, transaction) {
        return role_assignment.create({
            ...data,
            status: 'Pending',
            request_date: new Date(),
        }, { transaction });
    }

    async getAssignmentById(id, transaction) {
        return role_assignment.findByPk(id, { transaction });
    }

    async getRequesterDetails(requesterId, transaction) {
        return pgstaffinfo.findOne({
            where: {
                [Op.or]: [{ emp_id: requesterId }, { pgstaff_id: requesterId }]
            },
            include: [{
                model: pgstaff_roles,
                as: 'pgstaff_roles',
                where: { role_id: 'CGSS', role_level: 'Executive' }
            }],
            transaction
        });
    }

    async getAllPendingWithDetails() {
        const assignments = await role_assignment.findAll({
            where: { status: 'Pending' },
            include: [
                {
                    model: pgstudinfo,
                    as: 'pg_student',
                    attributes: ['FirstName', 'LastName', 'EmailId', 'pgstud_id', 'stu_id', 'Prog_Code', 'role_level'],
                    include: [{ model: program_info, as: 'Prog_Code_program_info', attributes: ['prog_name'] }]
                },
                {
                    model: pgstaffinfo,
                    as: 'pg_staff',
                    attributes: ['FirstName', 'LastName', 'EmailId', 'pgstaff_id', 'emp_id'],
                    include: [{ model: pgstaff_roles, as: 'pgstaff_roles', include: [{ model: roles, as: 'role', attributes: ['role_name'] }] }]
                },
                {
                    model: pgstaffinfo,
                    as: 'requester',
                    attributes: ['FirstName', 'LastName', 'EmailId', 'pgstaff_id'],
                    include: [{ model: pgstaff_roles, as: 'pgstaff_roles', attributes: ['role_level'] }]
                }
            ],
            order: [['request_date', 'DESC']]
        });

        return assignments.map(a => {
            const reqRole = a.requester?.pgstaff_roles?.[0]?.role_level || 'Executive';
            return {
                ...a.get(),
                studentName: a.pg_student ? `${a.pg_student.FirstName} ${a.pg_student.LastName}` : 'Unknown',
                studentEmail: a.pg_student?.EmailId,
                student_id: a.pg_student?.stu_id || a.pg_student?.pgstud_id,
                studentProgram: a.pg_student?.Prog_Code_program_info?.prog_name || 'N/A',
                studentLevel: a.pg_student?.role_level || 'Student',
                staffName: a.pg_staff ? `${a.pg_staff.FirstName} ${a.pg_staff.LastName}` : 'Unknown',
                staffEmail: a.pg_staff?.EmailId,
                staff_type_label: a.pg_staff?.pgstaff_roles?.[0]?.role?.role_name || a.pg_staff_type,
                requesterName: a.requester ? `${a.requester.FirstName} ${a.requester.LastName}` : 'Self/Sync',
                requesterEmail: a.requester?.EmailId || '-',
                requesterRoleType: reqRole
            };
        });
    }

    async getAssignmentsByType(id, type) {
        const isStudent = type === 'student';
        const whereClause = isStudent ? { pg_student_id: id } : { pg_staff_id: id };

        const assignments = await role_assignment.findAll({
            where: whereClause,
            include: [
                { model: pgstudinfo, as: 'pg_student', attributes: ['FirstName', 'LastName', 'EmailId'] },
                { model: pgstaffinfo, as: 'pg_staff', attributes: ['FirstName', 'LastName', 'EmailId'] }
            ],
            order: [['request_date', 'DESC']]
        });

        return assignments.map(a => {
            const data = a.get();
            let otherUserInfo = {};
            if (isStudent) {
                otherUserInfo = {
                    otherUserName: data.pg_staff ? `${data.pg_staff.FirstName} ${data.pg_staff.LastName}` : "Unknown",
                    otherUserEmail: data.pg_staff?.EmailId,
                    role: data.pg_staff_type
                };
            } else {
                otherUserInfo = {
                    otherUserName: data.pg_student ? `${data.pg_student.FirstName} ${data.pg_student.LastName}` : "Unknown",
                    otherUserEmail: data.pg_student?.EmailId,
                    role: 'Student'
                };
            }
            return { ...data, ...otherUserInfo };
        });
    }

    async getStudentStats(depCode, progCode, searchQuery) {
        return pgstudinfo.findAll({
            attributes: [
                'pgstud_id', 'stu_id', 'FirstName', 'LastName', 'EmailId', 'Dep_Code', 'Prog_Code', 'role_id', 'role_level',
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN role_assignments.status = 'Approved' THEN 1 ELSE 0 END")), 'totalApproved'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN role_assignments.status = 'Pending' THEN 1 ELSE 0 END")), 'totalPending'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN role_assignments.status = 'Rejected' THEN 1 ELSE 0 END")), 'totalRejected']
            ],
            include: [
                { model: role_assignment, as: 'role_assignments', attributes: [], required: false },
                { model: program_info, as: 'Prog_Code_program_info', attributes: ['prog_name'] }
            ],
            where: {
                [Op.and]: [
                    depCode ? { Dep_Code: depCode } : {},
                    progCode ? { Prog_Code: progCode } : {},
                    searchQuery ? {
                        [Op.or]: [
                            { FirstName: { [Op.like]: `%${searchQuery}%` } },
                            { LastName: { [Op.like]: `%${searchQuery}%` } },
                            { stu_id: { [Op.like]: `%${searchQuery}%` } },
                            { EmailId: { [Op.like]: `%${searchQuery}%` } }
                        ]
                    } : {}
                ]
            },
            group: ['pgstudinfo.pgstud_id'],
            subQuery: false
        });
    }

    async getStaffStats(depCode, searchQuery) {
        return pgstaffinfo.findAll({
            attributes: [
                'pgstaff_id', 'emp_id', 'FirstName', 'LastName', 'EmailId', 'Dep_Code', 'Status',
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN role_assignments.status = 'Approved' THEN 1 ELSE 0 END")), 'totalApproved'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN role_assignments.status = 'Pending' THEN 1 ELSE 0 END")), 'totalPending'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN role_assignments.status = 'Rejected' THEN 1 ELSE 0 END")), 'totalRejected']
            ],
            include: [
                { model: role_assignment, as: 'role_assignments', attributes: [], required: false },
                { model: tbldepartments, as: 'Dep_Code_tbldepartment', attributes: ['DepartmentName'] },
                { model: pgstaff_roles, as: 'pgstaff_roles', attributes: ['role_level'] }
            ],
            where: {
                [Op.and]: [
                    depCode ? { Dep_Code: depCode } : {},
                    searchQuery ? {
                        [Op.or]: [
                            { FirstName: { [Op.like]: `%${searchQuery}%` } },
                            { LastName: { [Op.like]: `%${searchQuery}%` } },
                            { emp_id: { [Op.like]: `%${searchQuery}%` } },
                            { EmailId: { [Op.like]: `%${searchQuery}%` } }
                        ]
                    } : {}
                ]
            },
            group: ['pgstaffinfo.pgstaff_id'],
            subQuery: false
        });
    }

    async getAssignedStaff(studentId) {
        return role_assignment.findAll({
            where: { pg_student_id: studentId, status: 'Approved' },
            include: [{
                model: pgstaffinfo,
                as: 'pg_staff',
                attributes: ['FirstName', 'LastName', 'Honorific_Titles', 'EmailId', 'pgstaff_id', 'emp_id']
            }],
            order: [['request_date', 'ASC']]
        });
    }

    async searchUser(query, type) {
        const normalizedQuery = query.trim();
        if (type === 'student') {
            return pgstudinfo.findOne({
                where: {
                    [Op.and]: [
                        { [Op.or]: [{ stu_id: normalizedQuery }, { pgstud_id: normalizedQuery }, { EmailId: normalizedQuery }] },
                        { Status: { [Op.in]: ['Active', 'Registered'] } }
                    ]
                }
            });
        } else {
            return pgstaffinfo.findOne({
                where: {
                    [Op.and]: [
                        { [Op.or]: [{ emp_id: normalizedQuery }, { pgstaff_id: normalizedQuery }, { EmailId: normalizedQuery }] },
                        { Status: { [Op.in]: ['Active', 'Registered'] } }
                    ]
                },
                include: [{ model: pgstaff_roles, as: 'pgstaff_roles' }]
            });
        }
    }
}

export default new RoleAssignmentService();
