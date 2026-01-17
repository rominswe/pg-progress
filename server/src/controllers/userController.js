/* ========================= IMPORTS ========================= */
import {
  pgstudinfo,
  pgstaffinfo,
  pgstaff_roles,
  program_info,
  empinfo,
  studinfo,
  roles,
  tbldepartments,
  pgstaff_qualification,
  pgstaff_expertise,
  qualification,
  expertise
} from "../config/config.js";
import { sendVerificationEmail } from "../utils/loginEmail.js";
import { generateActivationToken } from "../utils/activationToken.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { generateSequentialId } from "../utils/idGenerator.js";
import { Op } from "sequelize";
import crypto from "node:crypto";

/* ========================= HELPERS ========================= */

const sendVerificationSafe = async (user, token, tempPassword, roles) => {
  try {
    await sendVerificationEmail(user, token, tempPassword, roles);
  } catch (err) {
    console.error(`[EMAIL_FAIL] Failed to send verification email to ${user.EmailId}:`, err.message);
  }
};

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
    id: isStudent ? identity.pgstud_id : identity.pg_staff_id,
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

/* ========================= CONTROLLERS ========================= */

/**
 * Unified User Registration
 * Handles both Students (pgstudinfo) and Staff (pgstaffinfo + pgstaff_roles).
 */
export const registerUser = async (req, res) => {
  const transaction = await pgstaffinfo.sequelize.transaction();
  try {
    const {
      searchRole, // "Student" or "Academic Staff"
      staffType,  // "internal" or "external"
      identifier, // stu_id or emp_id (iff internal)
      // Common Fields
      FirstName, LastName, EmailId, Gender, Dob, Address, Phonenumber, Country, Passport,
      // Student Specific
      Acad_Year, Exp_GraduatedYear, Prog_Code,
      // Staff Specific
      targetRole, // The roles ID to assign (e.g. "SUV", "EXA")
      roleType,   // Director or Executive
      roleLabel,  // Sometimes sent as label for external
      qualification_codes = [], // Array of codes
      expertise_codes = [],     // Array of codes
      Affiliation,
      univ_domain,
      Dep_Code,
      Honorific_Titles,
      Academic_Rank
    } = req.body;

    if (!searchRole) throw { status: 400, message: "User type (searchRole) is required." };

    /* --- 1. STUDENT REGISTRATION --- */
    if (searchRole === "Student") {
      // Verify Program
      const prog = await program_info.findByPk(Prog_Code);
      if (!prog) throw { status: 404, message: "Program not found." };

      // Determine Level (moved up to determine ID prefix)
      const progName = prog.prog_name?.toUpperCase() || "";
      let role_level = 'Master Student';
      let idPrefix = 'MSTU';

      if (progName.includes('DOCTOR') || progName.includes('PHD')) {
        role_level = 'Doctoral Student';
        idPrefix = 'DSTU';
      }

      // Check if already exists
      const existingUser = await pgstudinfo.findOne({ where: { EmailId } });
      if (existingUser) throw { status: 409, message: "Student already registered." };

      // Generate ID
      const pgstud_id = await generateSequentialId(pgstudinfo, "pgstud_id", idPrefix);

      // Calculate EndDate
      let EndDate = new Date();
      if (Exp_GraduatedYear) {
        EndDate = new Date(parseInt(Exp_GraduatedYear), 11, 31);
        EndDate.setFullYear(EndDate.getFullYear() + 15);
      }

      // Password placeholder
      const tempPassword = Passport || Dob?.replace(/-/g, "") || crypto.randomBytes(4).toString("hex");

      // Create Record
      const newStudent = await pgstudinfo.create({
        pgstud_id,
        stu_id: staffType === 'internal' ? identifier : null, // Link to studinfo if internal
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

      await transaction.commit();

      // Email
      const token = generateActivationToken(pgstud_id, 180);
      sendVerificationSafe(newStudent, token, tempPassword, 'STU');

      return sendSuccess(res, "Student registered successfully.", { id: pgstud_id });
    }

    /* --- 2. STAFF REGISTRATION --- */
    else {
      // Validate Role
      const roleIdToAssign = targetRole || (roleLabel === 'Supervisor' ? 'SUV' : (roleLabel === 'Examiner' ? 'EXA' : null));
      if (!roleIdToAssign) throw { status: 400, message: "Target roles (Supervisor/Examiner/etc) is required." };

      // Check if Identity Exists (pgstaffinfo)
      // We search by Email mainly. If internal, check emp_id too.
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

      if (!staffIdentity) {
        // --- Create New Identity ---
        // New: Use Role ID as prefix (e.g., SUV, EXA) instead of generic EMP
        pg_staff_id = await generateSequentialId(pgstaffinfo, "pg_staff_id", roleIdToAssign);
        tempPassword = Passport || Dob?.replace(/-/g, "") || crypto.randomBytes(4).toString("hex");

        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 10); // Default long expiry for staff

        staffIdentity = await pgstaffinfo.create({
          pg_staff_id,
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
        pg_staff_id = staffIdentity.pg_staff_id;
      }

      // --- Assign Role (pgstaff_roles) ---
      // Check if roles already exists
      const existingRole = await pgstaff_roles.findOne({
        where: { pg_staff_id, role_id: roleIdToAssign },
        transaction
      });

      if (existingRole) {
        await transaction.rollback();
        return sendError(res, `User already has the roles ${roleIdToAssign}.`, 409);
      }

      await pgstaff_roles.create({
        pg_staff_id,
        role_id: roleIdToAssign,
        employment_type: staffType === 'external' ? 'External' : 'Internal',
        role_level: staffType === 'external' ? 'Not Applicable' : (roleType || 'Not Applicable'),
        Dep_Code: Dep_Code || staffIdentity.Dep_Code || '001', // Fallback
      }, { transaction });

      // --- NEW: Qualifications & Expertise Junction Tables ---

      // External Validation
      if (staffType === 'external' && (!qualification_codes || qualification_codes.length === 0)) {
        throw { status: 400, message: "Qualifications are mandatory for external staff." };
      }

      // 1. Qualifications
      if (Array.isArray(qualification_codes) && qualification_codes.length > 0) {
        const uniqueQuals = [...new Set(qualification_codes)];
        for (const code of uniqueQuals) {
          const [qualInstance, created] = await pgstaff_qualification.findOrCreate({
            where: { pg_staff_id, qualification_code: code },
            defaults: { pg_staff_id, qualification_code: code },
            transaction
          });
        }
      }

      // 2. Expertise
      if (Array.isArray(expertise_codes) && expertise_codes.length > 0) {
        const uniqueExp = [...new Set(expertise_codes)];
        for (const code of uniqueExp) {
          const [expInstance, created] = await pgstaff_expertise.findOrCreate({
            where: { pg_staff_id, expertise_code: code },
            defaults: { pg_staff_id, expertise_code: code },
            transaction
          });
        }
      }

      // Optional: Update pgstaffinfo with the selected Dep_Code if it changed
      if (Dep_Code && staffIdentity.Dep_Code !== Dep_Code) {
        await staffIdentity.update({ Dep_Code }, { transaction });
      }

      await transaction.commit();

      if (tempPassword) {
        const token = generateActivationToken(pg_staff_id, 180);
        sendVerificationSafe(staffIdentity, token, tempPassword, roleIdToAssign);
      }

      const msg = tempPassword ? "Staff registered successfully." : "New role assigned successfully.";
      return sendSuccess(res, msg, { id: pg_staff_id });
    }

  } catch (err) {
    await transaction.rollback();
    console.error("[REGISTER_ERROR]", err);
    return sendError(res, err.message, err.status || 500);
  }
};

/**
 * List All Users
 * Fetches from pgstudinfo and pgstaffinfo.
 */
export const getAllPGUsers = async (req, res) => {
  try {
    const { dept, status, role, search } = req.query;

    // 1. Build dynamic filters
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
      const searchFilter = {
        [Op.or]: [
          { FirstName: { [Op.like]: `%${search}%` } },
          { LastName: { [Op.like]: `%${search}%` } },
          { EmailId: { [Op.like]: `%${search}%` } },
          { pgstud_id: { [Op.like]: `%${search}%` } }, // For students
          { pg_staff_id: { [Op.like]: `%${search}%` } } // For staff
        ]
      };

      // Separate student vs staff identifier search
      const studSearch = {
        [Op.or]: [
          { FirstName: { [Op.like]: `%${search}%` } },
          { LastName: { [Op.like]: `%${search}%` } },
          { EmailId: { [Op.like]: `%${search}%` } },
          { pgstud_id: { [Op.like]: `%${search}%` } },
          { stu_id: { [Op.like]: `%${search}%` } }
        ]
      };

      const staffSearch = {
        [Op.or]: [
          { FirstName: { [Op.like]: `%${search}%` } },
          { LastName: { [Op.like]: `%${search}%` } },
          { EmailId: { [Op.like]: `%${search}%` } },
          { pg_staff_id: { [Op.like]: `%${search}%` } },
          { emp_id: { [Op.like]: `%${search}%` } }
        ]
      };

      Object.assign(studWhere, studSearch);
      Object.assign(staffWhere, staffSearch);
    }

    // Role filtering logic
    const includeStudents = !role || role === 'all' || role.toLowerCase().includes('student');
    const includeStaff = !role || role === 'all' || !role.toLowerCase().includes('student');

    let students = [];
    let staff = [];

    // 2. Fetch Students
    if (includeStudents) {
      students = await pgstudinfo.findAll({ where: studWhere });
    }

    // 3. Fetch Staff
    if (includeStaff) {
      staff = await pgstaffinfo.findAll({
        where: staffWhere,
        include: [
          {
            model: pgstaff_roles,
            as: 'pgstaff_roles',
            where: Object.keys(staffRoleWhere).length > 0 ? staffRoleWhere : undefined,
            required: Object.keys(staffRoleWhere).length > 0
          }
        ]
      });
    }

    // 4. Map to UI
    let uiUsers = [];

    for (const s of students) {
      const prog = await program_info.findByPk(s.Prog_Code);
      const mapped = await mapUserForUI(s, [], prog);
      // Backend role filter refinement if needed
      if (!role || role === 'all' || mapped.roleLabel.toLowerCase().includes(role.toLowerCase())) {
        uiUsers.push(mapped);
      }
    }

    for (const s of staff) {
      const mapped = await mapUserForUI(s, s.pgstaff_roles);
      // Backend role filter refinement
      if (!role || role === 'all' || mapped.roleLabel.toLowerCase().includes(role.toLowerCase())) {
        uiUsers.push(mapped);
      }
    }

    return sendSuccess(res, "Users fetched.", {
      total: uiUsers.length,
      users: uiUsers
    });
  } catch (err) {
    console.error("[LIST_USERS_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

/**
 * Update User
 * Updates pgstudinfo or pgstaffinfo based on context.
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Identify target
    let targetModel = null;
    let pk = null;

    // Try finding in Student
    let user = await pgstudinfo.findByPk(id);
    if (user) {
      targetModel = pgstudinfo;
      pk = 'pgstud_id';
    } else {
      user = await pgstaffinfo.findByPk(id);
      if (user) {
        targetModel = pgstaffinfo;
        pk = 'pg_staff_id';
      }
    }

    if (!user) return sendError(res, "User not found", 404);

    // Allowed updates whitelist
    const allowed = [
      "FirstName", "LastName", "Gender", "Dob",
      "Address", "Phonenumber", "Country", "Passport", "Affiliation"
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach(k => {
      if (allowed.includes(k)) filteredUpdates[k] = updates[k];
    });

    await user.update(filteredUpdates);

    return sendSuccess(res, "User updated successfully", { id });

  } catch (err) {
    console.error("[UPDATE_USER_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

/**
 * Get Dashboard Statistics
 * Optimized counting for system overview.
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalStaff, pendingStudents, pendingStaff, totalDocs] = await Promise.all([
      pgstudinfo.count(),
      pgstaffinfo.count(),
      pgstudinfo.count({ where: { Status: 'Pending' } }),
      pgstaffinfo.count({ where: { Status: 'Pending' } }),
      // documents_uploads.count()
    ]);

    return sendSuccess(res, "Dashboard stats fetched", {
      totalStudents,
      totalStaff,
      totalPending: pendingStudents + pendingStaff,
      totalDocuments: totalDocs || 0
    });
  } catch (err) {
    console.error("[DASHBOARD_STATS_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

/**
 * Search User (for Registration Lookup)
 * Looks up potential users in legacy/source tables (empinfo, studinfo) 
 * OR checks if they are already in the system (pgstudinfo, pgstaffinfo).
 */
export const searchUser = async (req, res) => {
  try {
    const { role: searchRole, type, query } = req.query;
    if (!query) return sendError(res, "Invalid search query", 400);

    const identifier = query.trim();
    let sourceData = null;
    let systemData = null;

    if (searchRole === "Student") {
      // 1. Check Source (studinfo)
      sourceData = await studinfo.findByPk(identifier);
      if (!sourceData) return sendError(res, "Student not found in master database.", 404);

      // Normalize Source Data
      if (sourceData) {
        sourceData = sourceData.toJSON();
        sourceData.role = "Student";
      }

      // 2. Check System (pgstudinfo)
      systemData = await pgstudinfo.findOne({ where: { stu_id: identifier } });
    }
    else if (searchRole === "Academic Staff" && type === "internal") {
      // 1. Check Source (empinfo)
      sourceData = await empinfo.findByPk(identifier);
      if (!sourceData) return sendError(res, "Employee not found in HR database.", 404);

      // Normalize Staff Role (Lookup Name from DB for the card display)
      if (sourceData && sourceData.role) {
        sourceData = sourceData.toJSON();
        const r = await roles.findByPk(sourceData.role);
        if (r) sourceData.role = r.role_name;
      }

      // 2. Check System (pgstaffinfo) - INCLUDE ROLES
      systemData = await pgstaffinfo.findOne({
        where: { emp_id: identifier },
        include: [{ model: pgstaff_roles, as: 'pgstaff_roles' }]
      });
    }
    else if (searchRole === "Academic Staff" && type === "external") {
      // External Search is usually by Email - INCLUDE ROLES
      systemData = await pgstaffinfo.findOne({
        where: { EmailId: identifier },
        include: [{ model: pgstaff_roles, as: 'pgstaff_roles' }]
      });

      if (!systemData) {
        return sendSuccess(res, "External user not registered", {
          found: false,
          email: identifier,
          allowManual: true
        });
      }
    }

    // Return combined result
    return sendSuccess(res, "Record found", {
      found: true,
      source: sourceData,
      registered: !!systemData,
      systemRecord: systemData ? await mapUserForUI(systemData, systemData.pgstaff_roles || []) : null
    });

  } catch (err) {
    console.error("[SEARCH_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

/**
 * Get Specific System User (Deep Fetch)
 */
export const getSystemUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Try student
    const student = await pgstudinfo.findByPk(id);
    if (student) {
      const prog = await program_info.findByPk(student.Prog_Code);
      const ui = await mapUserForUI(student, [], prog);
      return sendSuccess(res, "User found", ui);
    }

    // Try staff
    const staff = await pgstaffinfo.findByPk(id, {
      include: [
        { model: pgstaff_roles, as: 'pgstaff_roles' },
        {
          model: pgstaff_qualification,
          as: 'pgstaff_qualifications',
          include: [{ model: qualification, as: 'qualification' }]
        },
        {
          model: pgstaff_expertise,
          as: 'pgstaff_expertises',
          include: [{ model: expertise, as: 'expertise' }]
        }
      ]
    });

    if (staff) {
      const ui = await mapUserForUI(
        staff,
        staff.pgstaff_roles,
        null,
        staff.pgstaff_qualifications,
        staff.pgstaff_expertises
      );
      return sendSuccess(res, "User found", ui);
    }

    return sendError(res, "User not found", 404);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// Alias for explicit detail fetching
export const getUserDetails = getSystemUser;

/**
 * Toggle User Status (Deactivate / Reactivate)
 * Restricted to System Admin (CGSADM) or Director.
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId, targetStatus } = req.body; // Expecting { userId: '...', targetStatus: 'Active'/'Inactive' }

    if (!userId || !["Active", "Inactive"].includes(targetStatus)) {
      return sendError(res, "Invalid request. userId and targetStatus ('Active' or 'Inactive') are required.", 400);
    }

    // Security Gate (Secondary Check)
    // Note: Middleware should handle this, but checking explicit roles adds depth.
    const { role_id } = req.user;
    const isAuthorized = role_id === "CGSADM";

    if (!isAuthorized) {
      return sendError(res, "Unauthorized. Only System Admins can change user status.", 403);
    }

    // Identity Resolution
    let user = await pgstudinfo.findByPk(userId);
    let modelName = "Student";

    if (!user) {
      user = await pgstaffinfo.findByPk(userId);
      modelName = "Staff";
    }

    if (!user) {
      return sendError(res, "User ID not found in system.", 404);
    }

    // Update Status
    // Persistence: using 'update' keeps all other data intact.
    await user.update({ Status: targetStatus });

    const action = targetStatus === "Active" ? "reactivated" : "deactivated";
    return sendSuccess(res, `User ${userId} has been successfully ${action}.`, {
      id: userId,
      status: targetStatus,
      type: modelName
    });

  } catch (err) {
    console.error("[TOGGLE_STATUS_ERROR]", err);
    return sendError(res, "Server error while updating user status.", 500);
  }
};