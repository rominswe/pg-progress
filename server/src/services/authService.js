import bcrypt from "bcryptjs";
import {
    pgstaffinfo,
    pgstaff_roles,
    pgstudinfo,
} from "../config/config.js";

const ROLE_MODEL_MAP = {
    STU: pgstudinfo,
    EXA: pgstaffinfo,
    SUV: pgstaffinfo,
    CGSADM: pgstaffinfo,
    CGSS: pgstaffinfo,
};

class AuthService {
    async authenticate(email, password, role_id) {
        const Model = ROLE_MODEL_MAP[role_id];
        if (!Model) throw new Error("Invalid role selection");

        const user = await Model.findOne({ where: { EmailId: email } });
        if (!user) throw new Error("Invalid Email");

        const valid = await bcrypt.compare(password, user.Password);
        if (!valid) throw new Error("Invalid Password");

        return user;
    }

    async authorize(user, role_id) {
        if (role_id === "STU") {
            return {
                role_id: "STU",
                role_level: user.role_level,
            };
        }

        const roleRecord = await pgstaff_roles.findOne({
            where: {
                pg_staff_id: user.pgstaff_id,
                role_id,
            },
        });

        if (!roleRecord)
            throw new Error("You are not authorized for this role");

        return {
            role_id,
            role_level: roleRecord.role_level,
            employment_type: roleRecord.employment_type,
        };
    }

    enforceAccountState(user) {
        if (user.Status === "Inactive")
            throw new Error("Account deactivated. Please contact Admin.");

        if (user.EndDate && new Date(user.EndDate) < new Date())
            throw new Error("Account expired");

        if (!user.IsVerified)
            throw new Error("Account not verified.");
    }

    async activatePendingUser(user) {
        if (user.Status === "Pending" && (user.IsVerified === 0 || !user.IsVerified)) {
            user.IsVerified = 1;
            user.Status = "Active";
            await user.save();
            await user.reload();
        }
        return user;
    }

    getRoleModel(role_id) {
        return ROLE_MODEL_MAP[role_id];
    }
}

export default new AuthService();
