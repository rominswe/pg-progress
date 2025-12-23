import {
  master_stu,
  supervisor,
  examiner,
  visiting_staff,
  programInfo,
  doc_up,
  auditLog,
  loginAttempt,
  empinfo,
  cgs
} from "../config/config.js";
import { logAuthEvent } from "../utils/authSecurity.js";
import { createVerificationToken } from "../utils/verification.js";
import { sendVerificationEmail } from "../utils/email.js";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const ensureCGSAdmin = (req) => {
  if (req.user.role_id !== "CGSADM") {
    const err = new Error("Forbidden: Admin access only");
    err.status = 403;
    throw err;
  }
};

 // Student Management
export const createStudentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const { stu_id } = req.body;
    if (!stu_id) return res.status(400).json({ error: "Missing student ID" });

    // Fetch student from master record
    const studentRecord = await stud_info.findByPk(stu_id);
    if (!studentRecord) return res.status(404).json({ error: "Student not found in stud_info" });
    if (studentRecord.Dep_Code !== "CGS") return res.status(403).json({ error: "Cannot add student from another department" });

    // Check if student already exists in master_stu
    const existing = await master_stu.findOne({ where: { stu_id } });
    if (existing) return res.status(409).json({ error: "Student already exists in master_stu" });

    // Generate temporary password
    const tempPassword = crypto.randomBytes(6).toString("hex"); // 12 chars
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const endate = new Date();
    endate.setFullYear(endate.getFullYear() + 10); // 10 year validity

    const master_id = `MSTU${Date.now()}`; // Unique student ID

    // Replicate student data into master_stu
    const newStudent = await master_stu.create({
      master_id,
      stu_id: studentRecord.stu_id,
      FirstName: studentRecord.FirstName,
      LastName: studentRecord.LastName,
      EmailId: studentRecord.EmailId,
      Password: hashedPassword,
      Dep_Code: "CGS",
      Prog_Code: studentRecord.Prog_Code,
      role_id: "STU",
      Status: "Pending",
      IsVerified: 0,
      MustChangePassword: true,
      StartDate: new Date(),
      EndDate: endate,
      RegDate: new Date(),
      Profile_Image
    });

    // Create verification token
    const token = await createVerificationToken(newStudent.constructor.tableName, newStudent.master_id);

    // Send verification email with temp password
    await sendVerificationEmail(newStudent, token, tempPassword, "STU");

    // Log the creation
    await logAuthEvent(req.user.email, "CGSADM", "CREATE_STUDENT", req);

    res.status(201).json({
      message: "Student has been added successfully from Student Record to PG Student Table. Temporary password sent via email.",
      student: {
        master_id: newStudent.master_id,
        stu_id: newStudent.stu_id,
        EmailId: newStudent.EmailId,
        FirstName: newStudent.FirstName,
        LastName: newStudent.LastName,
      },
    });

  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getAllStudentsAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const students = await master_stu.findAll({ where: { Dep_Code: 'CGS' } });
    res.json(students);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateStudentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);
    
    if (req.user.table !== "master_stu") {
      console.warn(`Data Table mismatch: ${req.user.table}`);
    }

    const student = await master_stu.findByPk(req.params.master_id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (student.dep_code !== 'CGS') return res.status(403).json({ error: "Unauthorized" });

    // Update only allowed fields (optional: whitelist)
    const allowedFields = ["FirstName", "LastName", "Status", "Prog_Code"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    await student.update(updates);
    await logAuthEvent(req.user.email, "CGSADM", "UPDATE_STUDENT", req, {table: req.user.table});

    res.json(student);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteStudentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const student = await master_stu.findByPk(req.params.master_id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (student.Dep_Code!== 'CGS') return res.status(403).json({ error: "Unauthorized" });

    await student.destroy();
    await logAuthEvent(req.user.email, "CGSADM", "DELETE_STUDENT", req, {table: req.user.table});

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Supervisors / Examiners / CGS Staff Management
export const createInternalStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const { emp_id, target_role } = req.body; // target_role: "CGS", "SUV", "EXA"

    if (!emp_id || !target_role) return res.status(400).json({ error: "Missing fields" });

    // Fetch employee from empinfo
    const emp = await empinfo.findByPk(emp_id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    if (emp.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized" });

    // Determine the target table/model
    let Model;
    switch (target_role) {
      case "EXCGS": Model = cgs; break;
      case "SUV": Model = supervisor; break;
      case "EXA": Model = examiner; break;
      default: return res.status(400).json({ error: "Invalid target role" });
    }

    // Check if already exists
    const existing = await Model.findOne({ where: { emp_id } });
    if (existing) return res.status(409).json({ error: "Employee already exists" });

    // Generate temporary password
    const tempPassword = crypto.randomBytes(6).toString("hex"); // 12 chars
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const endate = new Date();
    endate.setFullYear(endate.getFullYear() + 10); // 10 year validity

    //Generate unique ID if needed
    let primaryKeyAttribute = '';
    switch (target_role) {
      case "EXCGS": primaryKeyAttribute = 'cgs_id'; break;
      case "SUV": primaryKeyAttribute = 'sup_id'; break;
      case "EXA": primaryKeyAttribute = 'examiner_id'; break;
    }
    let uniqueId = '';
    if (target_role === "SUV") uniqueId = `SUV${Date.now()}`;
    else if (target_role === "EXA") uniqueId = `IEXA${Date.now()}`;
    else if (target_role === "CGS") uniqueId = `CGS${Date.now()}`;


    // Create staff record in target table
    const newStaff = await Model.create({
      [primaryKeyAttribute]: uniqueId,
      emp_id: emp.emp_id,
      FirstName: emp.FirstName,
      LastName: emp.LastName,
      EmailId: emp.EmailId,
      Password: hashedPassword,
      Profile_Image,
      Phonenumber: emp.Phonenumber,
      role_id: target_role,
      Dep_Code: "CGS",
      Status: "Pending",
      IsVerified: 0,
      MustChangePassword: 1,
      StartDate: new Date(),
      EndDate: endate,
      RegDate: new Date()
    });

    // Optional: send verification email
    await sendVerificationEmail(newStaff, null, tempPassword, target_role);

    // Log creation
    await logAuthEvent(req.user.email, "CGSADM", `CREATE_${target_role}`, req);

    res.status(201).json({
      message: "Employee created successfully. Temporary password sent via email.",
      staff: { id: newStaff[Model.primaryKeyAttribute], email: newStaff.EmailId, role: target_role }
    });

  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createExternalStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const { EmailId, target_role } = req.body; // target_role: "EXA" only for external examiners

    if (!EmailId || !target_role) return res.status(400).json({ error: "Missing fields" });

    // Fetch visiting staff
    const visitor = await visiting_staff.findOne({ where: { EmailId } });
    if (!visitor) return res.status(404).json({ error: "User not found" });
    if (visitor.Dep_Code !== "CGS") return res.status(403).json({ error: "Unauthorized" });

    // For visiting staff, target_role must be "EXA"
    if (target_role !== "EXA") return res.status(400).json({ error: "Invalid role for visiting staff" });

    // Check if already exists
    const existing = await examiner.findOne({ where: { EmailId } });
    if (existing) return res.status(409).json({ error: "Employee already exists" });

    // Generate visiting_id automatically
    const visiting_id = `EEXA${Date.now()}`;

    // Generate temporary password
    const tempPassword = crypto.randomBytes(6).toString("hex"); // 12 chars
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const endate = new Date();
    endate.setFullYear(endate.getFullYear() + 10); // 10 year validity

    // Create examiner record
    const newExaminer = await examiner.create({
      visiting_id,
      FirstName,
      LastName,
      EmailId,
      Password: hashedPassword,
      Phonenumber,
      Profile_Image,
      Bio_Text,
      Affiliation,
      role_id: "EXA",
      Dep_Code: "CGS",
      Status: "Pending",
      IsVerified: 0,
      MustChangePassword: 1,
      StartDate: new Date(),
      EndDate: endate,
      RegDate: new Date()
    });

    // Optional: send verification email
    await sendVerificationEmail(newExaminer, null, tempPassword, "EXA");

    // Log creation
    await logAuthEvent(req.user.EmailId, "CGSADM", "CREATE_EXA", req);

    res.status(201).json({
      message: "External staff created successfully. Temporary password sent via email.",
      staff: { id: newExaminer[examiner.primaryKeyAttribute], email: newExaminer.EmailId, role_id: "EXA" }
    });

  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getAllStaffAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const cgsStaff = await cgs.findAll({ where: { Dep_Code: 'CGS' } });
    const supervisors = await supervisor.findAll({ where: { Dep_Code: 'CGS' } });
    const internalexaminers = await examiner.findAll({ where: { Dep_Code: 'CGS' } });
    const externalExaminers = await visiting_staff.findAll({ where: { Dep_Code: 'CGS', role_id: 'EXA' } });

    const allStaff = [...cgsStaff, ...supervisors, ...internalexaminers, ...externalExaminers];
    res.json(allStaff);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateStaffAdmin = async (req, res) => {
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
    
    // Update only allowed fields (optional: whitelist)
    const allowedFields = ["FirstName", "LastName", "Phonenumber", "Bio_Text", "Affiliation", "Status"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        staff[field] = req.body[field];
      }
    }
    const updatedStaff = {};
    await staff.update(updatedStaff);
    await logAuthEvent(req.user.email, "CGSADM", `UPDATE_${target_role}`, req, {table: req.user.table});
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
      case "CGS": Model = cgs; break;
      case "SUV": Model = supervisor; break;
      case "EXA": if (source === "internal") Model = examiner; else if (source === "external") Model = visiting_staff; break;
      default: return res.status(400).json({ error: "Invalid target role" });
    }
    const staff = await Model.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    if (staff.Dep_Code !== 'CGS') return res.status(403).json({ error: "Unauthorized" }); 
    
    await staff.destroy();
    await logAuthEvent(req.user.email, "CGSADM", `DELETE_${target_role}`, req, {table: req.user.table});
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Program Management
export const getAllProgramsAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const programs = await programInfo.findAll({ where: { Dep_Code: 'CGS' } });
    res.json(programs);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createProgramAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const { Prog_Code, prog_name } = req.body;

    if (!Prog_Code || !prog_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // fetch Existing Program Codes
    const existingProgram = await programInfo.findOne({
      where: { Prog_Code, Dep_Code: 'CGS' }
    });
    if (existingProgram) {
      return res.status(409).json({
        error: "This program code already exists",
        existing: {
          Prog_Code: existingProgram.Prog_Code,
          Dep_Code: existingProgram.Dep_Code,
          prog_name: existingProgram.prog_name,
          Creation_Date: existingProgram.Creation_Date
        }
      });
    }
    
    // Create new program
    const newProgram = await programInfo.create({
      Prog_Code,
      Dep_Code: 'CGS',
      prog_name,
      Creation_Date: new Date()
    });


    await logAuthEvent(req.user.email, "CGSADM", "CREATE_PROGRAM", req,{table: req.user.table});
    res.status(201).json({
      message: "New program has been successfully created",
      program: newProgram
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateProgramAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const program = await programInfo.findByPk(req.params.program_id);
    if (!program) return res.status(404).json({ error: "Program not found" });
    if (program.Dep_Code !== 'CGS') return res.status(403).json({ error: "Unauthorized" });

    await program.update(req.body);
    await logAuthEvent(req.user.EmailId, "CGSADM", "UPDATE_PROGRAM", req);

    res.json(program);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteProgramAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const program = await programInfo.findByPk(req.params.program_id);
    if (!program) return res.status(404).json({ error: "Program not found" });
    if (program.Dep_Code !== 'CGS') return res.status(403).json({ error: "Unauthorized" });

    await program.destroy();
    await logAuthEvent(req.user.EmailId, "CGSADM", "DELETE_PROGRAM", req);

    res.json({ message: "Program deleted" });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Document Management
export const getAllDocumentsAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const documents = await doc_up.findAll({ where: { Dep_Code: 'CGS' } });
    res.json(documents);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateDocumentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const document = await doc_up.findByPk(req.params.doc_up_id);
    if (!document) return res.status(404).json({ error: "Document not found" });
    if (document.Dep_Code !== 'CGS') return res.status(403).json({ error: "Unauthorized" });

    await document.update(req.body);
    await logAuthEvent(req.user.EmailId, "CGSADM", "UPDATE_DOCUMENT", req);

    res.json(document);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteDocumentAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req);

    const document = await doc_up.findByPk(req.params.doc_up_id);
    if (!document) return res.status(404).json({ error: "Document not found" });
    if (document.Dep_Code !== 'CGS') return res.status(403).json({ error: "Unauthorized" });

    await document.destroy();
    await logAuthEvent(req.user.EmailId, "CGSADM", "DELETE_DOCUMENT", req);

    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Audit Logs - Read Only
export const getAuditLogsAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req); // Only CGSAdmin can access

    const logs = await auditLog.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json(logs);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Login Attempts - Read Only
export const getLoginAttemptsAdmin = async (req, res) => {
  try {
    ensureCGSAdmin(req); // Only CGSAdmin can access

    const attempts = await loginAttempt.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json(attempts);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
