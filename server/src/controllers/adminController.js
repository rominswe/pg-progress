import {
  master_stu,
  supervisor,
  examiner,
  visiting_staff,
  programInfo,
  doc_up,
  empinfo,
  cgs,
  studentinfo,
  role,
  tbldepartments
} from "../config/config.js";
import { logAuthEvent } from "../utils/authSecurity.js";
import { createVerificationToken } from "../utils/verification.js";
import { sendVerificationEmail } from "../utils/email.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import crypto from "node:crypto";
import validator from "validator";

/* ================= HELPER LOGIC ================= */
const ensureCGSAdmin = (req) => {
  if (req.user?.role_id !== "CGSADM") {
    const err = new Error("Forbidden: Admin access only");
    err.status = 403;
    throw err;
  }
};

const resolveRoleId = (record, context = "unknown") => {
  const roleId = record?.role ?? record?.role_id ?? null;
  if (!roleId) {
    const err = new Error(`Role missing in DB (${context})`);
    err.status = 500;
    throw err;
  }
  return roleId;
};

const generateUniqueId = async (Model, prefix, length = 5) => {
  let id;
  do {
    id = `${prefix}${crypto.randomInt(0, 10 ** length)
      .toString()
      .padStart(length, "0")}`;
  } while (await Model.findByPk(id));
  return id;
};

const validateEmail = (email) =>
  typeof email === "string" && validator.isEmail(email, { allow_utf8_local_part: false });

const adminLog = (req, action) => logAuthEvent(req.user.email, "CGSADM", action, req);

const sendVerificationSafe = async (user, token, tempPassword, roleId) => {
  try {
    await sendVerificationEmail(user, token, tempPassword, roleId);
  } catch (err) {
    console.error("EMAIL_SEND_FAILED:", err.message);
  }
};

const exaExistsAnywhere = async (email) => {
  return (
    await empinfo.findOne({ where: { EmailId: email } }) ||
    await examiner.findOne({ where: { EmailId: email } }) ||
    await visiting_staff.findOne({ where: { EmailId: email, role_id: 'EXA' } }) // Only count acts as registered if they have EXA role
  );
};

const mapUserForUI = async (raw, masterRecord, programData) => {
  const isStudent = !!raw.stu_id;
  const roleId = resolveRoleId(raw);
  const [roleRecord, deptRecord] = await Promise.all([
    role.findOne({ where: { role_ID: roleId } }),
    tbldepartments.findOne({ where: { Dep_Code: raw.Dep_Code } })
  ]);

  let status = "Unregistered";
  if (masterRecord) status = masterRecord.Status === "Active" ? "Registered" : "Pending";

  return {
    fullName: `${raw.FirstName} ${raw.LastName}`.trim(),
    identifier: raw.stu_id || raw.emp_id || raw.EmailId,
    identifierLabel: raw.stu_id ? "Student ID" : raw.emp_id ? "Employee ID" : "Email",
    email: raw.EmailId,
    gender: raw.Gender ?? null,
    country: raw.Country ?? null,
    roleId,
    roleLabel: roleRecord?.role_name ?? roleId,
    departmentLabel: deptRecord?.DepartmentName ?? raw.Dep_Code,
    programName: isStudent ? programData?.prog_name ?? null : null,
    status,
    displayConfigs: { showRole: true, showProgram: isStudent }
  };
};

/* ========================== Generic CRUD ========================== */
const createUser = async ({ Model, prefix, sourceData, role_id }, req) => {
  const tempPassword = crypto.randomBytes(6).toString("hex");
  const pk = Model.primaryKeyAttribute;
  const uniqueId = await generateUniqueId(Model, prefix);

  const user = await Model.create({
    [pk]: uniqueId,
    ...sourceData,
    Password: tempPassword,
    role_id,
    Status: "Pending", // All new users default to Pending
    IsVerified: 0,
    MustChangePassword: 1,
    StartDate: new Date(),
    EndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    RegDate: new Date()
  });

  const token = await createVerificationToken(Model.tableName, user[pk]);
  await sendVerificationSafe(user, token, tempPassword, role_id);
  await adminLog(req, `CREATE_${role_id}`);

  return { id: user[pk], email: user.EmailId, role: role_id, status: "Pending" };
};

const updateEntity = async (entity, allowedFields, req, logLabel) => {
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (Object.keys(updates).length > 0) {
    await entity.update(updates);
    await adminLog(req, logLabel);
  }
  return entity;
};

const softDeleteEntity = async (entity, logLabel, req) => {
  entity.Status = "Inactive";
  await entity.save();
  await adminLog(req, logLabel);
  return entity;
};

/* ================= SEARCH LOGIC ================= */
export const searchUserInfo = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { role: searchRole, type, query } = req.query;
    if (!query) return sendError(res, "Missing identifier", 400);
    const id = query.trim();

    let data = null, masterRecord = null, programData = null;

    if (searchRole === "Student") {
      data = await studentinfo.findByPk(id);
      if (!data) return sendError(res, "No institutional record found", 404);
      masterRecord = await master_stu.findOne({ where: { stu_id: id } });

      if (data.Prog_Code) {
        programData = await programInfo.findOne({ where: { Prog_Code: data.Prog_Code, Dep_Code: data.Dep_Code } });
      }
    }

    if (searchRole === "Academic Staff") {
      if (type === "internal") {
        data = await empinfo.findByPk(id);
        if (!data) return sendError(res, "No institutional record found", 404);

        const registryMap = { CGSS: cgs, SUV: supervisor, EXA: examiner };
        const roleId = resolveRoleId(data);
        masterRecord = await registryMap[roleId]?.findOne({ where: { emp_id: id } });
      } else if (type === "external") {
        data = await visiting_staff.findOne({ where: { EmailId: id } });
        if (!data) return sendError(res, "No institutional record found", 404);
        masterRecord = await examiner.findOne({ where: { EmailId: id } });
      }
    }

    const raw = data.get();
    const uiData = await mapUserForUI(raw, masterRecord, programData);
    return sendSuccess(res, "Record found", uiData);

  } catch (err) {
    console.error("[SEARCH_USER_ERROR]", err);
    return sendError(res, err.message || "Search failed", err.status || 500);
  }
};
/* ================= REGISTER SEARCHED USER ================= */
export const registerSearchedUser = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { identifier, searchRole, staffType } = req.body;
    if (!identifier || !searchRole) return sendError(res, "Missing registration data", 400);

    let data, roleId, Model, prefix;

    if (searchRole === "Student") {
      data = await studentinfo.findByPk(identifier);
      if (!data) return sendError(res, "Student not found", 404);

      roleId = resolveRoleId(data);
      if (await master_stu.findOne({ where: { stu_id: identifier } }))
        return sendError(res, "User already registered or pending", 409);

      Model = master_stu;
      prefix = "MSTU";

    } else if (searchRole === "Academic Staff" && staffType === "internal") {
      data = await empinfo.findByPk(identifier);
      if (!data) return sendError(res, "Employee not found", 404);

      roleId = resolveRoleId(data);
      const registry = { CGSS: { Model: cgs, prefix: "CGS" }, SUV: { Model: supervisor, prefix: "SUV" }, EXA: { Model: examiner, prefix: "IEXA" } };
      const target = registry[roleId];
      if (!target) return sendError(res, "Unsupported role", 400);

      Model = target.Model;
      prefix = target.prefix;
      if (await Model.findOne({ where: { emp_id: identifier } }))
        return sendError(res, "User already registered or pending", 409);

    } else if (searchRole === "Academic Staff" && staffType === "external") {
      if (!validateEmail(identifier)) return sendError(res, "Invalid email", 400);
      data = await visiting_staff.findOne({ where: { EmailId: identifier } });
      if (!data) return sendError(res, "External staff not found", 404);

      roleId = resolveRoleId(data);
      if (roleId !== "EXA") return sendError(res, "Invalid role for external staff", 400);

      Model = visiting_staff;
      prefix = "EEXA";
      if (await examiner.findOne({ where: { EmailId: identifier } }))
        return sendError(res, "User already registered or pending", 409);

    } else {
      return sendError(res, "Unsupported registration request", 400);
    }

    const result = await createUser({ Model, prefix, sourceData: data.get(), role_id: roleId }, req);
    return sendSuccess(res, "User status set to Pending", result, 201);

  } catch (err) {
    console.error("[REGISTER_USER_ERROR]", err);
    return sendError(res, err.message || "Registration failed", err.status || 500);
  }
};

/* ================= STUDENT MANAGEMENT ================= */
export const createStudentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { stu_id } = req.body;
    if (!stu_id) return sendError(res, "Missing student ID", 400);

    const studentRecord = await studentinfo.findByPk(stu_id);
    if (!studentRecord) return sendError(res, "Student not found", 404);
    
    const existing = await master_stu.findOne({ where: { stu_id } });
    if (existing) return sendError(res, "Student already exists in system", 409);

    const result = await createUser({ Model: master_stu, prefix: "MSTU", sourceData: studentRecord.get(), role_id: "STU" }, req);
    return sendSuccess(res, "Student added successfully. Temporary password sent via email.", result, 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getAllStudentsAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const students = await master_stu.findAll({
      where: { Dep_Code: "CGS" },
      attributes: ["stu_id", "FirstName", "LastName", "EmailId", "Prog_Code", "Status", "RegDate", "role_id"],
      order: [["RegDate", "DESC"]]
    });
    return sendSuccess(res, "Students fetched successfully", students);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const updateStudentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const student = await master_stu.findByPk(req.params.master_id);
    if (!student) return sendError(res, "Student not found", 404);
    if (student.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    const updated = await updateEntity(student, ["FirstName", "LastName", "Status", "Prog_Code"], req, "UPDATE_STUDENT");
    return sendSuccess(res, "Student info updated successfully", updated);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const deleteStudentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const student = await master_stu.findByPk(req.params.master_id);
    if (!student) return sendError(res, "Student not found", 404);
    if (student.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    await softDeleteEntity(student, "DELETE_STUDENT", req);
    return sendSuccess(res, "Student has been deactivated successfully");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/* ================= STAFF MANAGEMENT ================= */
export const createInternalStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { emp_id, target_role } = req.body;
    if (!emp_id || !target_role) return sendError(res, "Missing fields", 400);

    const emp = await empinfo.findByPk(emp_id);
    if (!emp) return sendError(res, "Employee not found", 404);

    // [FIXED] Removed strict Dep_Code !== "CGS" check
    // if (emp.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    let Model, prefix;
    switch (target_role) {
      case "CGSS": Model = cgs; prefix = "CGS"; break;
      case "SUV": Model = supervisor; prefix = "SUV"; break;
      case "EXA": Model = examiner; prefix = "IEXA"; break;
      default: return sendError(res, "Invalid target role", 400);
    }

    const existing = await Model.findOne({ where: { emp_id } });
    if (existing) return sendError(res, "Staff already exists", 409);

    const result = await createUser({ Model, prefix, sourceData: emp.get(), role_id: target_role }, req);
    return sendSuccess(res, "Internal staff created successfully", result, 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const createExternalStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { EmailId } = req.body;
    if (!EmailId) return sendError(res, "Missing email", 400);
    if (!validateEmail(EmailId)) return sendError(res, "Invalid email format", 400);

    const visitor = await visiting_staff.findOne({ where: { EmailId } });
    if (!visitor) return sendError(res, "User not found", 404);

    // [FIXED] Removed strict Dep_Code !== "CGS" check
    // if (visitor.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    const exists = await exaExistsAnywhere(EmailId);
    if (exists) return sendError(res, "User already exists in EXA system", 409);

    const result = await createUser({ Model: visiting_staff, prefix: "EEXA", sourceData: visitor.get(), role_id: "EXA" }, req);
    return sendSuccess(res, "External staff created successfully", result, 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getAllStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const internalAttributes = ["emp_id", "FirstName", "LastName", "EmailId", "role_id", "RegDate", "Dep_Code", "Phonenumber", "Status"];
    const externalAttributes = ["FirstName", "LastName", "EmailId", "role_id", "RegDate", "Dep_Code", "Affiliation", "Expertise", "Phonenumber", "Status"];

    const data = {
      cgsStaff: await cgs.findAll({ where: { Dep_Code: "CGS" }, attributes: internalAttributes }),
      supervisors: await supervisor.findAll({ where: { Dep_Code: "CGS" }, attributes: internalAttributes }),
      internalExaminers: await examiner.findAll({ where: { Dep_Code: "CGS" }, attributes: internalAttributes }),
      externalExaminers: await visiting_staff.findAll({ where: { Dep_Code: "CGS", role_id: "EXA" }, attributes: externalAttributes })
    };

    return sendSuccess(res, "Staff list fetched successfully", data);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// Staff update/delete
export const updateStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { target_role, source, id } = req.params;

    let Model;
    switch (target_role) {
      case "CGSS": Model = cgs; break;
      case "SUV": Model = supervisor; break;
      case "EXA": Model = source === "internal" ? examiner : visiting_staff; break;
      default: return sendError(res, "Invalid target role", 400);
    }

    const staff = await Model.findByPk(id);
    if (!staff) return sendError(res, "Staff not found", 404);
    if (staff.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    const allowedFields = ["FirstName", "LastName", "Phonenumber", "Expertise", "Affiliation", "Status"];
    const updated = await updateEntity(staff, allowedFields, req, `UPDATE_${target_role}`);

    return sendSuccess(res, "Staff updated successfully", updated);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const deleteStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { target_role, source } = req.params;

    let Model;
    switch (target_role) {
      case "CGSS": Model = cgs; break;
      case "SUV": Model = supervisor; break;
      case "EXA": Model = source === "internal" ? examiner : visiting_staff; break;
      default: return sendError(res, "Invalid target role", 400);
    }

    const staff = await Model.findByPk(req.params.id);
    if (!staff) return sendError(res, "Staff not found", 404);
    if (staff.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    await softDeleteEntity(staff, `DELETE_${target_role}`, req);
    return sendSuccess(res, "Staff deleted successfully");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/* ================= PROGRAM MANAGEMENT ================= */
export const createProgramAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { Prog_Code, prog_name } = req.body;
    if (!Prog_Code || !prog_name) return sendError(res, "Missing required fields", 400);

    const existingProgram = await programInfo.findOne({ where: { Prog_Code, Dep_Code: "CGS" } });
    if (existingProgram) return sendError(res, "Program code already exists", 409);

    const newProgram = await programInfo.create({ Prog_Code, Dep_Code: "CGS", prog_name, Creation_Date: new Date() });
    await adminLog(req, "CREATE_PROGRAM");
    return sendSuccess(res, "Program created successfully", newProgram, 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getAllProgramsAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const programs = await programInfo.findAll({
      where: { Dep_Code: "CGS" },
      order: [["Creation_Date", "DESC"]],
      attributes: ["Prog_Code", "prog_name", "Creation_Date", "Status"]
    });
    return sendSuccess(res, "Programs fetched successfully", programs);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const updateProgramAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { Prog_Code, prog_name, Status } = req.body;
    if (!Prog_Code || !prog_name) return sendError(res, "Missing program code or name", 400);

    const program = await programInfo.findByPk(Prog_Code);
    if (!program) return sendError(res, "Program not found", 404);
    if (program.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    const updated = await updateEntity(program, ["prog_name", "Status"], req, "UPDATE_PROGRAM");
    return sendSuccess(res, "Program updated successfully", updated);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const deleteProgramAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const program = await programInfo.findByPk(req.params.Prog_Code);
    if (!program) return sendError(res, "Program not found", 404);
    if (program.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    await softDeleteEntity(program, "DELETE_PROGRAM", req);
    return sendSuccess(res, "Program soft-deleted successfully");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/* ================= DOCUMENT MANAGEMENT ================= */
export const getAllDocumentsAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const documents = await doc_up.findAll({
      where: { Dep_Code: "CGS" },
      order: [["uploaded_at", "DESC"]],
      attributes: ["doc_up_id", "document_type", "status"]
    });
    return sendSuccess(res, "Documents fetched successfully", documents);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const updateDocumentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const document = await doc_up.findByPk(req.params.doc_up_id);
    if (!document) return sendError(res, "Document not found", 404);
    if (document.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    const updated = await updateEntity(document, ["document_type", "status"], req, "UPDATE_DOCUMENT");
    return sendSuccess(res, "Document updated successfully", updated);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const deleteDocumentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const document = await doc_up.findByPk(req.params.doc_up_id);
    if (!document) return sendError(res, "Document not found", 404);
    if (document.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    await softDeleteEntity(document, "DELETE_DOCUMENT", req);
    return sendSuccess(res, "Document soft-deleted successfully");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
