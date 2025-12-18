import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _cgs from  "./cgs.js";
import _document_submissions from  "./document_submissions.js";
import _empinfo from  "./empinfo.js";
import _evaluation from  "./evaluation.js";
import _examiner from  "./examiner.js";
import _master_stu from  "./master_stu.js";
import _program_info from  "./program_info.js";
import _progress from  "./progress.js";
import _roles from  "./roles.js";
import _student_documents from  "./student_documents.js";
import _studinfo from  "./studinfo.js";
import _supervisor from  "./supervisor.js";
import _supervisory_meetings from  "./supervisory_meetings.js";
import _tbldepartments from  "./tbldepartments.js";
import _thesis from  "./thesis.js";
import _visiting_staff from  "./visiting_staff.js";

export default function initModels(sequelize) {
  const cgs = _cgs.init(sequelize, DataTypes);
  const document_submissions = _document_submissions.init(sequelize, DataTypes);
  const empinfo = _empinfo.init(sequelize, DataTypes);
  const evaluation = _evaluation.init(sequelize, DataTypes);
  const examiner = _examiner.init(sequelize, DataTypes);
  const master_stu = _master_stu.init(sequelize, DataTypes);
  const program_info = _program_info.init(sequelize, DataTypes);
  const progress = _progress.init(sequelize, DataTypes);
  const roles = _roles.init(sequelize, DataTypes);
  const student_documents = _student_documents.init(sequelize, DataTypes);
  const studinfo = _studinfo.init(sequelize, DataTypes);
  const supervisor = _supervisor.init(sequelize, DataTypes);
  const supervisory_meetings = _supervisory_meetings.init(sequelize, DataTypes);
  const tbldepartments = _tbldepartments.init(sequelize, DataTypes);
  const thesis = _thesis.init(sequelize, DataTypes);
  const visiting_staff = _visiting_staff.init(sequelize, DataTypes);

  cgs.belongsTo(empinfo, { as: "emp", foreignKey: "emp_id"});
  empinfo.hasMany(cgs, { as: "cgs", foreignKey: "emp_id"});
  examiner.belongsTo(empinfo, { as: "emp", foreignKey: "emp_id"});
  empinfo.hasMany(examiner, { as: "examiners", foreignKey: "emp_id"});
  supervisor.belongsTo(empinfo, { as: "emp", foreignKey: "emp_id"});
  empinfo.hasMany(supervisor, { as: "supervisors", foreignKey: "emp_id"});
  document_submissions.belongsTo(master_stu, { as: "master", foreignKey: "master_id"});
  master_stu.hasMany(document_submissions, { as: "document_submissions", foreignKey: "master_id"});
  student_documents.belongsTo(master_stu, { as: "master", foreignKey: "master_id"});
  master_stu.hasMany(student_documents, { as: "student_documents", foreignKey: "master_id"});
  master_stu.belongsTo(program_info, { as: "Prog_Code_program_info", foreignKey: "Prog_Code"});
  program_info.hasMany(master_stu, { as: "master_stus", foreignKey: "Prog_Code"});
  cgs.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(cgs, { as: "cgs", foreignKey: "role_id"});
  examiner.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(examiner, { as: "examiners", foreignKey: "role_id"});
  supervisor.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(supervisor, { as: "supervisors", foreignKey: "role_id"});
  master_stu.belongsTo(studinfo, { as: "stu", foreignKey: "stu_id"});
  studinfo.hasMany(master_stu, { as: "master_stus", foreignKey: "stu_id"});
  document_submissions.belongsTo(supervisor, { as: "sup", foreignKey: "sup_id"});
  supervisor.hasMany(document_submissions, { as: "document_submissions", foreignKey: "sup_id"});
  student_documents.belongsTo(supervisor, { as: "sup", foreignKey: "sup_id"});
  supervisor.hasMany(student_documents, { as: "student_documents", foreignKey: "sup_id"});
  cgs.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(cgs, { as: "cgs", foreignKey: "Dep_Code"});
  examiner.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(examiner, { as: "examiners", foreignKey: "Dep_Code"});
  master_stu.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(master_stu, { as: "master_stus", foreignKey: "Dep_Code"});
  supervisor.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(supervisor, { as: "supervisors", foreignKey: "Dep_Code"});

  return {
    cgs,
    document_submissions,
    empinfo,
    evaluation,
    examiner,
    master_stu,
    program_info,
    progress,
    roles,
    student_documents,
    studinfo,
    supervisor,
    supervisory_meetings,
    tbldepartments,
    thesis,
    visiting_staff,
  };
}
