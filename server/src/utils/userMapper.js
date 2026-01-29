/* ========================= IMPORTS ========================= */
import {
    roles,
    tbldepartments,
    pgstaffinfo
} from "../config/config.js"; // Adjust path as needed
import { Op } from "sequelize";

/* ========================= MAPPING FOR UI ========================= */
export const mapUserForUI = async (identity, rolesList = [], programData = null, qualifications = [], expertises = []) => {
    // Determine Type
    const isStudent = !!identity.pgstud_id;
    const userType = isStudent ? "student" : "staff";

    // Flatten Roles
    let roleLabel = "N/A";
    let roleIds = [];
    let displayConfigs = {
        showRole: true,
        showProgram: isStudent,
        showExpertise: !isStudent,
        showAffiliation: !isStudent
    };

    if (isStudent) {
        roleIds = ["STU"];
        roleLabel = identity.role_level === "Doctoral Student" ? "Doctorate Student" : identity.role_level;
    } else {
        // Staff Roles
        if (rolesList.length > 0) {
            roleIds = rolesList.map(r => r.role_id);

            // Fetch role definitions to get the base names
            const roleDefs = await roles.findAll({ where: { role_id: { [Op.in]: roleIds } } });

            const mappedLabels = rolesList.map(r => {
                const def = roleDefs.find(d => d.role_id === r.role_id);
                const baseName = def ? def.role_name : r.role_id;

                // Rule: CGSS users show their level (Director/Executive)
                if (r.role_id === 'CGSS') {
                    return r.role_level || baseName;
                }

                // Rule: Examiners/Supervisors get Internal/External prefix
                if (['SUV', 'EXA'].includes(r.role_id)) {
                    const prefix = r.employment_type === 'External' ? 'External ' : 'Internal ';
                    return `${prefix}${baseName}`;
                }

                return baseName;
            });

            roleLabel = mappedLabels.join(" / ");
        }
    }

    // Determine Source (Internal vs External)
    const source = isStudent ? "internal" : (identity.emp_id ? "internal" : "external");

    // Fetch Department Name
    let departmentLabel = "N/A";
    let depToLookup = identity.Dep_Code;

    // For staff, if main profile has no Dep_Code, check their role assignment
    if (!isStudent && !depToLookup && rolesList.length > 0) {
        depToLookup = rolesList[0].Dep_Code;
    }

    if (depToLookup) {
        const dept = await tbldepartments.findByPk(depToLookup);
        if (dept) departmentLabel = dept.DepartmentName;
    }

    return {
        id: isStudent ? identity.pgstud_id : identity.pgstaff_id,
        identifier: isStudent ? identity.stu_id : (identity.emp_id || identity.EmailId),
        identifierLabel: isStudent ? "Student ID" : (identity.emp_id ? "Employee ID" : "Email"),

        fullName: `${identity.FirstName} ${identity.LastName}`,
        FirstName: identity.FirstName,
        LastName: identity.LastName,
        email: identity.EmailId,

        // Demographics
        gender: identity.Gender,
        country: identity.Country,
        dob: identity.Dob,
        address: identity.Address,
        phoneNumber: identity.Phonenumber,

        // Academic / Professional
        Honorific_Titles: identity.Honorific_Titles,
        Academic_Rank: identity.Academic_Rank,
        departmentCode: identity.Dep_Code,
        departmentLabel,
        programName: programData?.prog_name || "N/A",
        progCode: identity.Prog_Code,

        expertise: !isStudent ? (identity.Expertise || "N/A") : null,

        affiliation: identity.Affiliation,
        univ_domain: identity.Univ_Domain,

        // System Metadata
        status: identity.Status,
        regDate: identity.RegDate,
        endDate: identity.EndDate,
        isVerified: identity.IsVerified,

        // Role Info
        roleIds,
        roleLabel,
        userType,
        source,

        // Relational Attributes
        qualifications: qualifications.map(q => ({
            code: q.qualification_code,
            name: q.qualification?.qualification_name || "N/A",
            level: q.qualification?.qualification_level || "N/A"
        })),
        expertises: expertises.map(e => ({
            code: e.expertise_code,
            name: e.expertise?.expertise_name || "N/A"
        })),

        displayConfigs
    };
};
