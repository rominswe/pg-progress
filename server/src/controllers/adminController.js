/* ========================= IMPORTS ========================= */
import {
  master_stu,
  supervisor,
  examiner,
  visiting_staff,
  programInfo,
  empinfo,
  cgs,
  studentinfo,
  role,
  tbldepartments,
  doc_up
} from "../config/config.js";

import { sendVerificationEmail } from "../utils/loginEmail.js";
import { generateActivationToken } from "../utils/activationToken.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

import crypto from "node:crypto";
import validator from "validator";

/* ========================= ROLE MAPS ========================= */
const INTERNAL_ROLE_MAP = {
  CGSS: { Model: cgs, prefix: "CGS" },
  SUV: { Model: supervisor, prefix: "ISUV" },
  EXA: { Model: examiner, prefix: "IEXA" },
};

const EXTERNAL_ROLE_MAP = {
  Examiner: { Model: examiner, prefix: "EXA", role_id: "EXA" },
  Supervisor: { Model: supervisor, prefix: "SUV", role_id: "SUV" },
};

/* ========================= VALIDATION ========================= */
const isValidEmail = (email) =>
  typeof email === "string" &&
  validator.isEmail(email, { allow_utf8_local_part: false });

const REQUIRED_EXTERNAL_FIELDS = [
  "FirstName",
  "LastName",
  "EmailId",
  "Gender",
  "Country",
  "Dob",
  "Address",
  "Phonenumber",
  "Expertise",
  "Affiliation",
  "Dep_Code",
  "roleLabel",
];

const validateExternalPayload = (payload) => {
  for (const field of REQUIRED_EXTERNAL_FIELDS) {
    if (!payload[field]) {
      const err = new Error(`Missing required field: ${field}`);
      err.status = 400;
      throw err;
    }
  }

  if (!isValidEmail(payload.EmailId)) {
    const err = new Error("Invalid email format");
    err.status = 400;
    throw err;
  }
};

/* ========================= HELPERS ========================= */
const resolveRoleId = (record, context = "unknown") => {
  const roleId = record?.role ?? record?.role_id;
  if (!roleId) {
    const err = new Error(`Role missing in DB (${context})`);
    err.status = 500;
    throw err;
  }
  return roleId;
};

const resolveUserType = (raw) => {
  if (raw?.stu_id) return "student";
  if (raw?.emp_id) return "internalStaff";
  if (raw?.EmailId) return "externalStaff";
  return "unknown";
};

const generateUniqueId = async (Model, prefix, length = 5) => {
  for (let i = 0; i < 5; i++) {
    const id = `${prefix}${crypto
      .randomInt(0, 10 ** length)
      .toString()
      .padStart(length, "0")}`;
    if (!(await Model.findByPk(id))) return id;
  }
  throw new Error("Failed to generate unique ID");
};

const systemUserExists = async (email) =>
  (await empinfo.findOne({ where: { EmailId: email } })) ||
  (await examiner.findOne({ where: { EmailId: email } })) ||
  (await supervisor.findOne({ where: { EmailId: email } })) ||
  (await cgs.findOne({ where: { EmailId: email } })) ||
  (await visiting_staff.findOne({ where: { EmailId: email } }));

const sendVerificationSafe = async (user, token, tempPassword, roleId) => {
  try {
    await sendVerificationEmail(user, token, tempPassword, roleId);
  } catch (err) {
    console.error("EMAIL_SEND_FAILED:", err.message);
  }
};

/* ========================= UI MAPPING ========================= */
const mapUserForUI = async (raw, masterRecord, programData, overrides = {}) => {
  const userType = resolveUserType(raw);
  const roleId = raw?.role_id ?? raw?.role ?? null;

  const [roleRecord, deptRecord] = await Promise.all([
    roleId ? role.findOne({ where: { role_ID: roleId } }) : null,
    raw?.Dep_Code
      ? tbldepartments.findOne({ where: { Dep_Code: raw.Dep_Code } })
      : null,
  ]);

  let status = "Unregistered";
  if (masterRecord)
    status = masterRecord.Status === "Active" ? "Registered" : "Pending";

  return {
    fullName: `${raw.FirstName ?? ""} ${raw.LastName ?? ""}`.trim(),
    identifier: raw.stu_id || raw.emp_id || raw.EmailId,
    identifierLabel: raw.stu_id
      ? "Student ID"
      : raw.emp_id
        ? "Employee ID"
        : "Email",
    email: raw.EmailId ?? null,
    gender: raw.Gender ?? null,
    country: raw.Country ?? null,
    fieldExpertise:
      userType === "externalStaff" ? raw?.Expertise ?? "N/A" : null,
    affiliation:
      userType === "externalStaff" ? raw?.Affiliation ?? "N/A" : null,
    roleId,
    roleLabel: roleRecord?.role_name ?? "N/A",
    departmentLabel: deptRecord?.DepartmentName ?? "N/A",
    programName:
      userType === "student" ? programData?.prog_name ?? "N/A" : null,
    status,
    displayConfigs: {
      showRole: true,
      showProgram: userType === "student",
      showExpertise: userType === "externalStaff",
      showAffiliation: userType === "externalStaff",
    },
    ...overrides,
  };
};

/* ========================= USER CREATION ========================= */
const createUser = async ({ Model, prefix, sourceData, role_id }) => {
  const tempPassword =
    sourceData.Passport ||
    sourceData.Dob?.replace(/-/g, "") ||
    crypto.randomBytes(4).toString("hex");

  const pk = Model.primaryKeyAttribute;
  const uniqueId = await generateUniqueId(Model, prefix);

  const user = await Model.create({
    [pk]: uniqueId,
    ...sourceData,
    Password: tempPassword,
    role_id,
    Status: "Pending",
    IsVerified: 0,
    MustChangePassword: 1,
    StartDate: new Date(),
    EndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    RegDate: new Date(),
  });

  const token = generateActivationToken(user[pk], 180);
  await sendVerificationSafe(user, token, tempPassword, role_id);

  return {
    id: user[pk],
    email: user.EmailId,
    role: role_id,
    status: "Pending",
  };
};

/* ========================= SEARCH ========================= */
export const searchUserInfo = async (req, res) => {
  try {
    const { role: searchRole, type, query } = req.query;
    if (!query) return sendError(res, "Check your ID/Email", 400);

    const identifier = query.trim();
    let data = null,
      masterRecord = null,
      programData = null;

    if (searchRole === "Student") {
      data = await studentinfo.findByPk(identifier);
      if (!data) return sendError(res, "Student record not found", 404);

      masterRecord = await master_stu.findOne({
        where: { stu_id: identifier },
      });

      if (data.Prog_Code) {
        programData = await programInfo.findOne({
          where: {
            Prog_Code: data.Prog_Code,
            Dep_Code: data.Dep_Code,
          },
        });
      }
    }

    else if (searchRole === "Academic Staff" && type === "internal") {
      data = await empinfo.findByPk(identifier);
      if (!data) return sendError(res, "Internal staff not found", 404);

      const roleId = resolveRoleId(data);
      const registry = INTERNAL_ROLE_MAP[roleId];
      masterRecord = registry
        ? await registry.Model.findOne({ where: { emp_id: identifier } })
        : null;
    }

    else if (searchRole === "Academic Staff" && type === "external") {
      data = await visiting_staff.findOne({
        where: { EmailId: identifier },
      });

      if (!data) {
        return sendSuccess(res, "External staff not found", {
          status: "Unregistered",
          allowManualRegistration: true,
          email: identifier,
          identifier: identifier,
          identifierLabel: "Email",
          fullName: "New External User",
          displayConfigs: {
            showRole: true,
            showExpertise: true,
            showAffiliation: true,
          },
        });
      }

      const roleId = resolveRoleId(data, "external staff");
      const registryMap = { SUV: supervisor, EXA: examiner };
      const RegistryModel = registryMap[roleId];

      if (RegistryModel) {
        masterRecord = await RegistryModel.findOne({ where: { EmailId: identifier } });
      }
    }

    else {
      return sendError(res, "Unsupported search request", 400);
    }

    const uiData = await mapUserForUI(
      data.get(),
      masterRecord,
      programData
    );

    return sendSuccess(res, "Record found", uiData);
  } catch (err) {
    console.error("[SEARCH_USER_ERROR]", err);
    return sendError(res, err.message, err.status || 500);
  }
};

/* ========================= REGISTER ========================= */
export const registerSearchedUser = async (req, res) => {
  try {
    const {
      identifier,
      searchRole,
      staffType,
      manual,
      roleLabel,
      Dep_Code,
    } = req.body;

    if (!searchRole)
      return sendError(res, "Missing registration data", 400);

    let sourceData, Model, prefix, roleId;

    if (searchRole === "Student") {
      const student = await studentinfo.findByPk(identifier);
      if (!student) return sendError(res, "Student not found", 404);

      if (await master_stu.findOne({ where: { stu_id: identifier } }))
        return sendError(res, "User already registered", 409);

      sourceData = student.get();
      roleId = resolveRoleId(student);
      Model = master_stu;
      prefix = "MSTU";
    }

    else if (searchRole === "Academic Staff" && staffType === "internal") {
      const staff = await empinfo.findByPk(identifier);
      if (!staff) return sendError(res, "Employee not found", 404);

      roleId = resolveRoleId(staff);
      const registry = INTERNAL_ROLE_MAP[roleId];
      if (!registry) return sendError(res, "Unsupported role", 400);

      if (
        await registry.Model.findOne({ where: { emp_id: identifier } })
      )
        return sendError(res, "User already registered", 409);

      sourceData = staff.get();
      Model = registry.Model;
      prefix = registry.prefix;
    }

    else if (searchRole === "Academic Staff" && staffType === "external") {
      if (!roleLabel) return sendError(res, "Role must be selected", 400);
      const target = EXTERNAL_ROLE_MAP[roleLabel];
      if (!target) return sendError(res, "Invalid role selected", 400);

      if (manual) {
        validateExternalPayload(req.body);
        if (await systemUserExists(req.body.EmailId))
          return sendError(res, "External staff already exists", 409);

        const visitingId = await generateUniqueId(visiting_staff, "EEXA");

        const visiting = await visiting_staff.create({
          visiting_id: visitingId,
          ...req.body,
          role_id: target.role_id,
          Dep_Code,
          Status: "Pending",
          EndDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 30)
          ),
        });

        sourceData = visiting.get();
      } else {
        const visiting = await visiting_staff.findOne({
          where: { EmailId: identifier },
        });
        if (!visiting) return sendError(res, "External staff not found", 404);

        if (
          await target.Model.findOne({
            where: { visiting_id: visiting.visiting_id },
          })
        )
          return sendError(res, "User already registered", 409);

        sourceData = visiting.get();
      }

      Model = target.Model;
      prefix = target.prefix;
      roleId = target.role_id;
    }

    else {
      return sendError(res, "Unsupported registration request", 400);
    }

    const result = await createUser({
      Model,
      prefix,
      sourceData,
      role_id: roleId,
    });

    return sendSuccess(res, "User status set to Pending", result, 201);
  } catch (err) {
    console.error("[REGISTER_USER_ERROR]", err);
    return sendError(res, err.message, err.status || 500);
  }
};

// ====== LINE BREAK =======

const softDeleteEntity = async (entity, logLabel, req) => {
  entity.Status = "Inactive";
  await entity.save();
  return entity;
};
const updateEntity = async (entity, fields, req, logLabel) => {
  fields.forEach((field) => {
    if (req.body[field] !== undefined) entity[field] = req.body[field];
  });
  await entity.save();
  return entity;
};
const exaExistsAnywhere = async (email) => {
  return await examiner.findOne({ where: { EmailId: email } });
};

/* ================= STUDENT MANAGEMENT ================= */
export const createStudentAdmin = async (req, res) => {
  try {

    const { stu_id } = req.body;
    if (!stu_id) return sendError(res, "Missing student ID", 400);

    const studentRecord = await studentinfo.findByPk(stu_id);
    if (!studentRecord) return sendError(res, "Student not found", 404);

    const existing = await master_stu.findOne({ where: { stu_id } });
    if (existing) return sendError(res, "Student already exists in system", 409);

    const result = await createUser({ Model: master_stu, prefix: "MSTU", sourceData: studentRecord.get(), role_id: "STU" });
    return sendSuccess(res, "Student added successfully. Temporary password sent via email.", result, 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getAllStudentsAdmin = async (req, res) => {
  try {

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

    const result = await createUser({ Model, prefix, sourceData: emp.get(), role_id: target_role });
    return sendSuccess(res, "Internal staff created successfully", result, 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const createExternalStaffAdmin = async (req, res) => {
  try {

    const { EmailId } = req.body;
    if (!EmailId) return sendError(res, "Missing email", 400);
    if (!validateEmail(EmailId)) return sendError(res, "Invalid email format", 400);

    const visitor = await visiting_staff.findOne({ where: { EmailId } });
    if (!visitor) return sendError(res, "User not found", 404);

    // [FIXED] Removed strict Dep_Code !== "CGS" check
    // if (visitor.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    const exists = await exaExistsAnywhere(EmailId);
    if (exists) return sendError(res, "User already exists in EXA system", 409);

    const result = await createUser({ Model: visiting_staff, prefix: "EEXA", sourceData: visitor.get(), role_id: "EXA" });
    return sendSuccess(res, "External staff created successfully", result, 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getAllStaffAdmin = async (req, res) => {
  try {


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

    const { Prog_Code, prog_name } = req.body;
    if (!Prog_Code || !prog_name) return sendError(res, "Missing required fields", 400);

    const existingProgram = await programInfo.findOne({ where: { Prog_Code, Dep_Code: "CGS" } });
    if (existingProgram) return sendError(res, "Program code already exists", 409);

    const newProgram = await programInfo.create({ Prog_Code, Dep_Code: "CGS", prog_name, Creation_Date: new Date() });
    return sendSuccess(res, "Program created successfully", newProgram, 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getAllProgramsAdmin = async (req, res) => {
  try {

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

    const document = await doc_up.findByPk(req.params.doc_up_id);
    if (!document) return sendError(res, "Document not found", 404);
    if (document.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    await softDeleteEntity(document, "DELETE_DOCUMENT", req);
    return sendSuccess(res, "Document soft-deleted successfully");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
