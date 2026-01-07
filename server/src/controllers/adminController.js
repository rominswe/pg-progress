import {
  master_stu,
  supervisor,
  examiner,
  visiting_staff,
  programInfo,
  doc_up,
  empinfo,
  cgs,
  studentinfo
} from "../config/config.js";
import { logAuthEvent } from "../utils/authSecurity.js";
import { createVerificationToken } from "../utils/verification.js";
import { sendVerificationEmail } from "../utils/email.js";
import crypto from "node:crypto";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

/* ================= HELPER LOGIC ================= */
const ensureCGSAdmin = (req) => {
  if (req.user?.role_id !== "CGSADM") {
    const err = new Error("Forbidden: Admin access only");
    err.status = 403;
    throw err;
  }
};

const generateUniqueId = async (Model, prefix, length = 6) => {
  let id = `${prefix}${crypto.randomInt(0, 10 ** length).toString().padStart(length, "0")}`;
  let exists = await Model.findByPk(id);
  while (exists) {
    id = `${prefix}${crypto.randomInt(0, 10 ** length).toString().padStart(length, "0")}`;
    exists = await Model.findByPk(id);
  }
  return id;
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sendVerificationSafe = async (user, token, tempPassword, role) => {
  try {
    await sendVerificationEmail(user, token, tempPassword, role);
  } catch (err) {
    console.error("Failed to send verification email:", err.message);
  }
};

const exaExistsAnywhere = async (email) => {
  return (
    await empinfo.findOne({ where: { EmailId: email } }) ||
    await examiner.findOne({ where: { EmailId: email } }) ||
    await visiting_staff.findOne({ where: { EmailId: email } })
  );
};

const adminLog = (req, action) => {
  return logAuthEvent(req.user.email, "CGSADM", action, req, { table: req.user.table });
};

/* ========================== Generic CRUD ========================== */
const createUser = async ({ Model, prefix, sourceData, role_id, dep = "CGS", emailField = "EmailId" }, req) => {
  const tempPassword = crypto.randomBytes(6).toString("hex");
  const endate = new Date();
  endate.setFullYear(endate.getFullYear() + 10);

  const pkField = Model.primaryKeyAttribute;
  const uniqueId = await generateUniqueId(Model, prefix, 5);

  const newUser = await Model.create({
    [pkField]: uniqueId,
    ...sourceData,
    Password: tempPassword,
    role_id,
    Dep_Code: dep,
    Status: "Pending",
    IsVerified: 0,
    MustChangePassword: 1,
    StartDate: new Date(),
    EndDate: endate,
    RegDate: new Date()
  });

  const token = await createVerificationToken(Model.tableName, newUser[pkField]);
  await sendVerificationSafe(newUser, token, tempPassword, role_id);
  await adminLog(req, `CREATE_${role_id}`);
  return { id: newUser[pkField], email: newUser[emailField], role: role_id };
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

/* ================= STUDENT MANAGEMENT ================= */
export const createStudentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { stu_id } = req.body;
    if (!stu_id) return sendError(res, "Missing student ID", 400);

    const studentRecord = await studentinfo.findByPk(stu_id);
    if (!studentRecord) return sendError(res, "Student not found", 404);
    if (studentRecord.Dep_Code !== "CGS") return sendError(res, "Unauthorized department", 403);

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
      attributes: ["stu_id","FirstName","LastName","EmailId","Prog_Code","Status","RegDate","role_id"],
      order: [["RegDate","DESC"]]
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

    const updated = await updateEntity(student, ["FirstName","LastName","Status","Prog_Code"], req, "UPDATE_STUDENT");
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
    if (emp.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    let Model, prefix;
    switch(target_role) {
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
    if (visitor.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

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

    const internalAttributes = ["emp_id","FirstName","LastName","EmailId","role_id","RegDate","Dep_Code","Phonenumber","Status"];
    const externalAttributes = ["FirstName","LastName","EmailId","role_id","RegDate","Dep_Code","Affiliation","Expertise","Phonenumber","Status"];

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
    switch(target_role) {
      case "CGSS": Model = cgs; break;
      case "SUV": Model = supervisor; break;
      case "EXA": Model = source === "internal" ? examiner : visiting_staff; break;
      default: return sendError(res, "Invalid target role", 400);
    }

    const staff = await Model.findByPk(id);
    if (!staff) return sendError(res, "Staff not found", 404);
    if (staff.Dep_Code !== "CGS") return sendError(res, "Unauthorized", 403);

    const allowedFields = ["FirstName","LastName","Phonenumber","Expertise","Affiliation","Status"];
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
    switch(target_role) {
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
      order: [["Creation_Date","DESC"]],
      attributes: ["Prog_Code","prog_name","Creation_Date","Status"]
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

    const updated = await updateEntity(program, ["prog_name","Status"], req, "UPDATE_PROGRAM");
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
      order: [["uploaded_at","DESC"]],
      attributes: ["doc_up_id","document_type","status"]
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

    const updated = await updateEntity(document, ["document_type","status"], req, "UPDATE_DOCUMENT");
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