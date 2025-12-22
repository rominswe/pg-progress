import {
  master_stu,
  supervisor,
  examiner,
  visiting_staff,
  tbldepartments,
  role,
  programInfo,
  progress,
  doc_up,
  auditLog,
  loginAttempt
} from "../config/config.js";

import { logAuthEvent } from "../utils/authSecurity.js";
export const getAllStudentsAdmin = async (req, res) => {
  try {
    const students = await master_stu.findAll();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStudentAdmin = async (req, res) => {
  try {
    const student = await master_stu.findByPk(req.params.master_id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    await student.update(req.body);
    await logAuthEvent(req.user.email, "CGSADM", "UPDATE_STUDENT", req);

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStudentAdmin = async (req, res) => {
  try {
    const student = await master_stu.findByPk(req.params.master_id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    await student.destroy();
    await logAuthEvent(req.user.email, "CGSADM", "DELETE_STUDENT", req);

    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getAllSupervisorsAdmin = async (req, res) => {
  try {
    res.json(await supervisor.findAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllExaminersAdmin = async (req, res) => {
  try {
    res.json(await examiner.findAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllVisitingStaffAdmin = async (req, res) => {
  try {
    res.json(await visiting_staff.findAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getAllDepartmentsAdmin = async (req, res) => {
  try {
    res.json(await tbldepartments.findAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDepartmentAdmin = async (req, res) => {
  try {
    const dep = await tbldepartments.findByPk(req.params.Dep_Code);
    if (!dep) return res.status(404).json({ error: "Department not found" });

    await dep.update(req.body);
    await logAuthEvent(req.user.email, "CGSADM", "UPDATE_DEPARTMENT", req);

    res.json(dep);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getAllProgramsAdmin = async (req, res) => {
  try {
    res.json(await programInfo.findAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getAllProgressAdmin = async (req, res) => {
  try {
    res.json(await progress.findAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getAllDocumentsAdmin = async (req, res) => {
  try {
    res.json(await doc_up.findAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDocumentAdmin = async (req, res) => {
  try {
    const doc = await doc_up.findByPk(req.params.doc_up_id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    await doc.destroy();
    await logAuthEvent(req.user.email, "CGSADM", "DELETE_DOCUMENT", req);

    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getAuditLogsAdmin = async (req, res) => {
  try {
    res.json(await auditLog.findAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLoginAttemptsAdmin = async (req, res) => {
  try {
    res.json(await loginAttempt.findAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
