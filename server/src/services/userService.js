import {
    pgstudinfo,
    pgstaffinfo,
    pgstaff_roles,
    program_info,
    empinfo,
    studinfo,
    roles,
    pgstaff_qualification,
    pgstaff_expertise,
    qualification,
    expertise,
    sequelize
} from "../config/config.js";
import { Op } from "sequelize";
import { mapUserForUI } from "../utils/userMapper.js";

class UserService {
    async listUsers({ dept, status, role, search }) {
        const studWhere = {};
        const staffWhere = {};
        const staffRoleWhere = {};

        if (dept && dept !== 'all') {
            studWhere.Dep_Code = dept;
            staffRoleWhere.Dep_Code = dept;
        }

        if (status && status !== 'all') {
            studWhere.Status = status;
            staffWhere.Status = status;
        }

        if (search) {
            const searchPattern = `%${search}%`;
            studWhere[Op.or] = [
                { FirstName: { [Op.like]: searchPattern } },
                { LastName: { [Op.like]: searchPattern } },
                { EmailId: { [Op.like]: searchPattern } },
                { pgstud_id: { [Op.like]: searchPattern } },
                { stu_id: { [Op.like]: searchPattern } }
            ];
            staffWhere[Op.or] = [
                { FirstName: { [Op.like]: searchPattern } },
                { LastName: { [Op.like]: searchPattern } },
                { EmailId: { [Op.like]: searchPattern } },
                { pgstaff_id: { [Op.like]: searchPattern } },
                { emp_id: { [Op.like]: searchPattern } }
            ];
        }

        const includeStudents = !role || role === 'all' || role.toLowerCase().includes('student');
        const includeStaff = !role || role === 'all' || !role.toLowerCase().includes('student');

        let students = [];
        let staff = [];

        if (includeStudents) {
            students = await pgstudinfo.findAll({ where: studWhere });
        }
        if (includeStaff) {
            staff = await pgstaffinfo.findAll({
                where: staffWhere,
                include: [{
                    model: pgstaff_roles,
                    as: 'pgstaff_roles',
                    where: Object.keys(staffRoleWhere).length > 0 ? staffRoleWhere : undefined,
                    required: Object.keys(staffRoleWhere).length > 0
                }]
            });
        }

        let uiUsers = [];
        for (const s of students) {
            const prog = await program_info.findByPk(s.Prog_Code);
            const mapped = await mapUserForUI(s, [], prog);
            if (!role || role === 'all' || mapped.roleLabel.toLowerCase().includes(role.toLowerCase())) {
                uiUsers.push(mapped);
            }
        }
        for (const s of staff) {
            const mapped = await mapUserForUI(s, s.pgstaff_roles);
            if (!role || role === 'all' || mapped.roleLabel.toLowerCase().includes(role.toLowerCase())) {
                uiUsers.push(mapped);
            }
        }

        return uiUsers;
    }

    async updateUserProfile(id, updates) {
        let user = await pgstudinfo.findByPk(id);
        if (!user) user = await pgstaffinfo.findByPk(id);
        if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            throw error;
        }

        const allowed = ["FirstName", "LastName", "Gender", "Dob", "Address", "Phonenumber", "Country", "Passport", "Affiliation"];
        const filteredUpdates = {};
        Object.keys(updates).forEach(k => { if (allowed.includes(k)) filteredUpdates[k] = updates[k]; });

        return user.update(filteredUpdates);
    }

    async getSystemCounts() {
        const [totalStudents, totalStaff, pendingStudents, pendingStaff] = await Promise.all([
            pgstudinfo.count(),
            pgstaffinfo.count(),
            pgstudinfo.count({ where: { Status: 'Pending' } }),
            pgstaffinfo.count({ where: { Status: 'Pending' } }),
        ]);

        return {
            totalStudents,
            totalStaff,
            totalPending: pendingStudents + pendingStaff,
            totalDocuments: 0
        };
    }

    async searchUserInMaster(searchRole, query, type) {
        const identifier = query.trim();
        let sourceData = null;
        let systemData = null;

        if (searchRole === "Student") {
            sourceData = await studinfo.findByPk(identifier);
            if (sourceData) {
                sourceData = sourceData.toJSON();
                sourceData.role = "Student";
            }
            systemData = await pgstudinfo.findOne({ where: { stu_id: identifier } });
        } else if (searchRole === "Academic Staff") {
            if (type === "internal") {
                sourceData = await empinfo.findByPk(identifier);
                if (sourceData && sourceData.role) {
                    sourceData = sourceData.toJSON();
                    const r = await roles.findByPk(sourceData.role);
                    if (r) sourceData.role = r.role_name;
                }
                systemData = await pgstaffinfo.findOne({
                    where: { emp_id: identifier },
                    include: [{ model: pgstaff_roles, as: 'pgstaff_roles' }]
                });
            } else {
                systemData = await pgstaffinfo.findOne({
                    where: { EmailId: identifier },
                    include: [{ model: pgstaff_roles, as: 'pgstaff_roles' }]
                });
            }
        }

        return {
            sourceData,
            systemData,
            isRegistered: !!systemData
        };
    }

    async getDeepUser(id) {
        const student = await pgstudinfo.findByPk(id);
        if (student) {
            const prog = await program_info.findByPk(student.Prog_Code);
            return mapUserForUI(student, [], prog);
        }

        const staff = await pgstaffinfo.findByPk(id, {
            include: [
                { model: pgstaff_roles, as: 'pgstaff_roles' },
                { model: pgstaff_qualification, as: 'pgstaff_qualifications', include: [{ model: qualification, as: 'qualification' }] },
                { model: pgstaff_expertise, as: 'pgstaff_expertises', include: [{ model: expertise, as: 'expertise' }] }
            ]
        });

        if (staff) {
            return mapUserForUI(staff, staff.pgstaff_roles, null, staff.pgstaff_qualifications, staff.pgstaff_expertises);
        }

        return null;
    }

    async toggleStatus(userId, targetStatus) {
        let user = await pgstudinfo.findByPk(userId);
        let modelName = "Student";

        if (!user) {
            user = await pgstaffinfo.findByPk(userId);
            modelName = "Staff";
        }

        if (!user) {
            const error = new Error("User ID not found in system.");
            error.status = 404;
            throw error;
        }

        await user.update({ Status: targetStatus });
        return { userId, status: targetStatus, type: modelName };
    }
}

export default new UserService();
