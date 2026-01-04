import {
  master_stu,
  supervisor,
  examiner,
  visiting_staff,
  programInfo,
  doc_up,
  empinfo,
  cgs,
  studentinfo as stud_info
} from "../config/config.js";
import { logAuthEvent } from "../utils/authSecurity.js";
import { createVerificationToken } from "../utils/verification.js";
import { sendVerificationEmail } from "../utils/email.js";
import crypto from "node:crypto";

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

const assertEnum = (value, allowed, fieldName) => {
  if (value !== undefined && !allowed.includes(value)) {
    const err = new Error(`Invalid ${fieldName}`);
    err.status = 400;
    throw err;
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
  return logAuthEvent(
    req.user.email,
    "CGSADM",
    action,
    req,
    { table: req.user.table }
  );
};

// ========================== Generic CRUD ==========================
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

  // Optional verification token
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
    await logAuthEvent(req.user.email, "CGSADM", logLabel, req, { table: req.user.table });
  }
  return entity;
};

const softDeleteEntity = async (entity, logLabel, req) => {
  entity.Status = "Inactive";
  await entity.save();
  await logAuthEvent(req.user.email, "CGSADM", logLabel, req, { table: req.user.table });
  return entity;
};

 // Student Management
export const createStudentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { stu_id } = req.body;
    if (!stu_id) return res.status(400).json({ error: "Missing student ID" });

    // Fetch student from master record
    const studentRecord = await stud_info.findByPk(stu_id);
    if (!studentRecord) return res.status(404).json({ error: "Student not found" });
    if (studentRecord.Dep_Code !== "CGS") return res.status(403).json({ error: "Cannot add student from another department" });

    // Check if student already exists in master_stu
    const existing = await master_stu.findOne({ where: { stu_id } });
    if (existing) return res.status(409).json({ error: "Student already exists in master_stu" });
    
    const result = await createUser(
      { Model: master_stu, prefix: "MSTU", sourceData: studentRecord.get(), role_id: "STU" },
      req
    );

    res.status(201).json({
      message: "Student added successfully. Temporary password sent via email.",
      student: result
    });

  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
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
    res.json(students);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateStudentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const student = await master_stu.findByPk(req.params.master_id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (student.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized" });

    // Update only allowed fields (optional: whitelist)
    const updated = await updateEntity(student, ["FirstName","LastName","Status","Prog_Code"], req, "UPDATE_STUDENT");
    res.json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteStudentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const student = await master_stu.findByPk(req.params.master_id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (student.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized" });

    await softDeleteEntity(student, "DELETE_STUDENT", req);
    res.json({ message: "Student soft-deleted successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Supervisors / Examiners / CGS Staff Management
export const createInternalStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { emp_id, target_role } = req.body;
    if (!emp_id || !target_role) return res.status(400).json({ error: "Missing fields" });

    // Fetch employee from empinfo
    const emp = await empinfo.findByPk(emp_id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    if (emp.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized" });

    // Determine the target table/model
    let Model, prefix;
    switch(target_role) {
      case "EXCGS": Model = cgs; prefix = "CGS"; break;
      case "SUV": Model = supervisor; prefix = "SUV"; break;
      case "EXA": Model = examiner; prefix = "IEXA"; break;
      default: return res.status(400).json({ error: "Invalid target role" });
    }

    // Check if already exists
    const existing = await Model.findOne({ where: { emp_id } });
    if (existing) return res.status(409).json({ error: "Employee already exists" });

    // Generate temporary password
    const result = await createUser({ Model, prefix, sourceData: emp.get(), role_id: target_role }, req);
    res.status(201).json({ message: "Staff created successfully.", staff: result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createExternalStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { EmailId } = req.body;
    if (!EmailId) return res.status(400).json({ error: "Missing email" });

    // Email format valudation 
   if (!validateEmail(EmailId)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    
    // Fetch visiting staff
    const visitor = await visiting_staff.findOne({ where: { EmailId } });
    if (!visitor) return res.status(404).json({ error: "User not found" });
    if (visitor.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized" });

    // Check if already exists
    const exists = await exaExistsAnywhere(EmailId);
    if (exists) {
      return res.status(409).json({ error: "User already exists in EXA system" });
    }


    const result = await createUser({ Model: visiting_staff, prefix: "EEXA", sourceData: visitor.get(), role_id: "EXA" }, req);
    res.status(201).json({ message: "External staff created successfully.", staff: result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getAllStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const internalattributes = [
      "emp_id",
      "FirstName",
      "LastName",
      "EmailId",
      "role_id",
      "RegDate",
      "Dep_Code",
      "Phonenumber",
      "Status"
    ];
    const externalattributes = [
      "FirstName",
      "LastName",
      "EmailId",
      "role_id",
      "RegDate",
      "Dep_Code",
      "Affiliation",
      "Expertise",
      "Phonenumber",
      "Status"
    ]
    const cgsStaff = await cgs.findAll({ where: { Dep_Code: 'CGS' }, attributes: internalattributes });
    const supervisors = await supervisor.findAll({ where: { Dep_Code: 'CGS' }, attributes: internalattributes });
    const internalExaminers = await examiner.findAll({ where: { Dep_Code: 'CGS' }, attributes: internalattributes });
    const externalExaminers = await visiting_staff.findAll({ where: { Dep_Code: 'CGS', role_id: 'EXA' }, attributes: externalattributes });

    res.json({
      cgsStaff,
      supervisors,
      internalExaminers,
      externalExaminers
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    
    const { target_role, source, id } = req.params; // "EXCGS", "SUV", "IEXA or "EEXA"

    let Model;
    switch (target_role) {
      case "EXCGS": Model = cgs; break;
      case "SUV": Model = supervisor; break;
      case "EXA": if (source === "internal") Model = examiner; else if (source === "external") Model = visiting_staff; break;
      default: return res.status(400).json({ error: "Invalid target role" });
    }

    const staff = await Model.findByPk(id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    if (staff.Dep_Code !== 'CGS') return res.status(403).json({ error: "Unauthorized" });
    
    // Update only allowed fields (optional: whitelist)
    const allowedFields = ["FirstName", "LastName", "Phonenumber", "Expertise", "Affiliation", "Status"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    await staff.update(updates);
    await adminLog(req, `UPDATE_${target_role}`);
    res.json(staff);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { target_role, source } = req.params; // "CGS", "SUV", "EXA"
    let Model;
    switch (target_role) {
      case "EXCGS": Model = cgs; break;
      case "SUV": Model = supervisor; break;
      case "EXA": if (source === "internal") Model = examiner; else if (source === "external") Model = visiting_staff; break;
      default: return res.status(400).json({ error: "Invalid target role" });
    }
    const staff = await Model.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    if (staff.Dep_Code !== 'CGS') return res.status(403).json({ error: "Unauthorized" }); 
    
    await softDeleteEntity(staff, `DELETE_${target_role}`, req);
    await adminLog(req, `UPDATE_${target_role}`);
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Program Management
export const createProgramAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { Prog_Code, prog_name } = req.body;
    if (!Prog_Code || !prog_name) return res.status(400).json({ error: "Missing required fields" });

    const existingProgram = await programInfo.findOne({ where: { Prog_Code, Dep_Code: "CGS" } });
    if (existingProgram) return res.status(409).json({ error: "Program code already exists" });

    const newProgram = await programInfo.create({ Prog_Code, Dep_Code: "CGS", prog_name, Creation_Date: new Date() });
    await logAuthEvent(req.user.email, "CGSADM", "CREATE_PROGRAM", req, { table: req.user.table });
    res.status(201).json({ message: "Program created successfully", program: newProgram });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getAllProgramsAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const programs = await programInfo.findAll({ 
      where: { Dep_Code: 'CGS' },
      order: [['Creation_Date', 'DESC']],
      attributes: [
        'Prog_Code', 
        'prog_name', 
        'Creation_Date']
    });
    res.json(programs);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || "Failed to fetch programs" });
  }
};

export const updateProgramAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const { Prog_Code, prog_name, Status } = req.body;
    if (!Prog_Code || !prog_name) return res.status(400).json({ error: "Missing program code or name" });

    const program = await programInfo.findByPk(Prog_Code);
    if (!program) return res.status(404).json({ error: "Program not found" });
    if (program.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized" });

    const updated = await updateEntity(program, ["prog_name","Status"], req, "UPDATE_PROGRAM");
    res.json({ message: "Program updated successfully", program: updated });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteProgramAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const program = await programInfo.findByPk(req.params.Prog_Code);
    if (!program) return res.status(404).json({ error: "Program not found" });
    if (program.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized" });

    await softDeleteEntity(program, "DELETE_PROGRAM", req);
    res.json({ message: "Program soft-deleted successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Document Management
export const getAllDocumentsAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const documents = await doc_up.findAll({ 
      where: { Dep_Code: 'CGS' },
      order: [['uploaded_at', 'DESC']],
      attributes:[
        "doc_up_id",
        "document_type",
        "status"
      ]
    });
    res.json(documents);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || "Failed to fetch documents" });
  }
};

export const updateDocumentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const document = await doc_up.findByPk(req.params.doc_up_id);
    if (!document) return res.status(404).json({ error: "Document not found" });
    if (document.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized" });

    const updated = await updateEntity(document, ["document_type","status"], req, "UPDATE_DOCUMENT");
    res.json({ message: "Document updated successfully", document: updated });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteDocumentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    const document = await doc_up.findByPk(req.params.doc_up_id);
    if (!document) return res.status(404).json({ error: "Document not found" });
    if (document.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized" });

    await softDeleteEntity(document, "DELETE_DOCUMENT", req);
    res.json({ message: "Document soft-deleted successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};