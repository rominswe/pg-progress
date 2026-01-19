import {
    pgstudinfo,
    pgstaffinfo,
    pgstaff_roles,
    pgstaff_qualification,
    pgstaff_expertise,
    program_info,
    sequelize
} from "../config/config.js";
import { generateSequentialId } from "../utils/idGenerator.js";
import { sendVerificationEmail } from "../utils/loginEmail.js";
import { generateActivationToken } from "../utils/activationToken.js";
import crypto from "node:crypto";
import { Op } from "sequelize";

/**
 * Helper: Secure Random Password
 */
const generateSecurePassword = () => crypto.randomBytes(6).toString("hex").toUpperCase(); // 12 chars

/**
 * Helper: Send Verification safely
 */
const sendVerificationSafe = async (user, token, tempPassword, roles) => {
    try {
        await sendVerificationEmail(user, token, tempPassword, roles);
    } catch (err) {
        console.error(`[EMAIL_FAIL] Failed to send verification email to ${user.EmailId}:`, err.message);
    }
};

/**
 * Register a new Student
 */
export const registerStudent = async (data, transaction) => {
    const {
        Prog_Code, EmailId, staffType, identifier,
        FirstName, LastName, Gender, Dob, Address, Phonenumber, Country, Passport,
        Acad_Year, Exp_GraduatedYear
    } = data;

    // Verify Program
    const prog = await program_info.findByPk(Prog_Code, { transaction });
    if (!prog) throw { status: 404, message: "Program not found." };

    // Determine Level
    const progName = prog.prog_name?.toUpperCase() || "";
    let role_level = 'Master Student';
    let idPrefix = 'MSTU';

    if (progName.includes('DOCTOR') || progName.includes('PHD')) {
        role_level = 'Doctoral Student';
        idPrefix = 'DSTU';
    }

    // Check Existence
    const existingUser = await pgstudinfo.findOne({ where: { EmailId }, transaction });
    if (existingUser) throw { status: 409, message: "Student already registered." };

    // Generate ID
    const pgstud_id = await generateSequentialId(pgstudinfo, "pgstud_id", idPrefix);

    // Calculate EndDate
    let EndDate = new Date();
    if (Exp_GraduatedYear) {
        EndDate = new Date(parseInt(Exp_GraduatedYear), 11, 31);
        EndDate.setFullYear(EndDate.getFullYear() + 15);
    }

    // Secure Password
    const tempPassword = generateSecurePassword();

    // Create Record
    const newStudent = await pgstudinfo.create({
        pgstud_id,
        stu_id: staffType === 'internal' ? identifier : null,
        FirstName, LastName, EmailId, Gender, Dob, Address, Phonenumber, Country, Passport,
        Acad_Year, Exp_GraduatedYear, Dep_Code: prog.Dep_Code, Prog_Code,
        role_id: 'STU',
        role_level,
        Status: 'Pending',
        Password: tempPassword,
        RegDate: new Date(),
        EndDate: EndDate,
        IsVerified: false
    }, { transaction });

    // Email
    const token = generateActivationToken(pgstud_id, 180);
    await sendVerificationSafe(newStudent, token, tempPassword, 'STU');

    return { id: pgstud_id, message: "Student registered successfully." };
};

/**
 * Register a new Staff (or assign new role)
 */
export const registerStaff = async (data, transaction) => {
    const {
        targetRole, roleLabel, EmailId, staffType, identifier,
        FirstName, LastName, Gender, Dob, Address, Phonenumber, Country, Passport,
        Affiliation, univ_domain, Dep_Code, Honorific_Titles, Academic_Rank,
        roleType, qualification_codes, expertise_codes
    } = data;

    // Validate Role
    const roleIdToAssign = targetRole || (roleLabel === 'Supervisor' ? 'SUV' : (roleLabel === 'Examiner' ? 'EXA' : null));
    if (!roleIdToAssign) throw { status: 400, message: "Target roles (Supervisor/Examiner/etc) is required." };

    // Check Identity
    let staffIdentity = await pgstaffinfo.findOne({
        where: {
            [Op.or]: [
                { EmailId: EmailId },
                ...(staffType === 'internal' && identifier ? [{ emp_id: identifier }] : [])
            ]
        },
        transaction
    });

    let pg_staff_id;
    let tempPassword = null;
    let isNewUser = false;

    if (!staffIdentity) {
        // Create New Identity
        isNewUser = true;
        pg_staff_id = await generateSequentialId(pgstaffinfo, "pgstaff_id", roleIdToAssign);
        tempPassword = generateSecurePassword(); // Secure Password

        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 10);

        staffIdentity = await pgstaffinfo.create({
            pgstaff_id: pg_staff_id,
            emp_id: staffType === 'internal' ? identifier : null,
            FirstName, LastName, EmailId, Gender, Dob, Address, Phonenumber, Country,
            Passport: Passport || "Not Provided",
            Affiliation: Affiliation || "Albukhary International University",
            Univ_Domain: univ_domain || null,
            Honorific_Titles: Honorific_Titles || null,
            Academic_Rank: Academic_Rank || null,
            Status: 'Pending',
            Password: tempPassword,
            RegDate: new Date(),
            EndDate: endDate,
            IsVerified: false
        }, { transaction });
    } else {
        pg_staff_id = staffIdentity.pgstaff_id;
    }

    // Role Assignment
    const existingRole = await pgstaff_roles.findOne({
        where: { pg_staff_id, role_id: roleIdToAssign },
        transaction
    });

    if (existingRole) {
        throw { status: 409, message: `User already has the roles ${roleIdToAssign}.` };
    }

    await pgstaff_roles.create({
        pg_staff_id,
        role_id: roleIdToAssign,
        employment_type: staffType === 'external' ? 'External' : 'Internal',
        role_level: staffType === 'external' ? 'Not Applicable' : (roleType || 'Not Applicable'),
        Dep_Code: Dep_Code || staffIdentity.Dep_Code || '001'
    }, { transaction });

    // Junction Tables: Qualifications & Expertise
    // 1. Qualifications
    if (staffType === 'external' && (!qualification_codes || qualification_codes.length === 0)) {
        throw { status: 400, message: "Qualifications are mandatory for external staff." };
    }

    if (Array.isArray(qualification_codes) && qualification_codes.length > 0) {
        const uniqueQuals = [...new Set(qualification_codes)];
        // Bulk create is not safe with findOrCreate, using sequential
        for (const code of uniqueQuals) {
            await pgstaff_qualification.findOrCreate({
                where: { pg_staff_id, qualification_code: code },
                defaults: {
                    pg_staff_id,
                    qualification_code: code
                },
                transaction
            });
        }
    }

    // 2. Expertise
    if (Array.isArray(expertise_codes) && expertise_codes.length > 0) {
        const uniqueExp = [...new Set(expertise_codes)];
        for (const code of uniqueExp) {
            await pgstaff_expertise.findOrCreate({
                where: { pg_staff_id, expertise_code: code },
                defaults: {
                    pg_staff_id,
                    expertise_code: code
                },
                transaction
            });
        }
    }

    // Update Dep_Code if needed
    if (Dep_Code && staffIdentity.Dep_Code !== Dep_Code) {
        await staffIdentity.update({
            Dep_Code
        }, { transaction });
    }

    // Email (Only if new user or explicit logic to resend - usually only new user needs password)
    if (isNewUser && tempPassword) {
        const token = generateActivationToken(pg_staff_id, 180);
        await sendVerificationSafe(staffIdentity, token, tempPassword, roleIdToAssign);
    }

    return {
        id: pg_staff_id,
        message: tempPassword ? "Staff registered successfully." : "New role assigned successfully.",
        generatedPassword: tempPassword // Optional: currently returned but relying on email
    };
};
