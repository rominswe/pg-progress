import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _cgs from  "../temp/cgs.js";
import _documents_reviews from  "../temp/documents_reviews.js";
import _documents_uploads from  "../temp/documents_uploads.js";
import _empinfo from  "../temp/empinfo.js";
import _examiner from  "../temp/examiner.js";
import _master_stu from  "../temp/master_stu.js";
import _program_info from  "../temp/program_info.js";
import _roles from  "../temp/roles.js";
import _studinfo from  "../temp/studinfo.js";
import _supervisor from  "../temp/supervisor.js";
import _tbldepartments from  "../temp/tbldepartments.js";
import _visiting_staff from  "../temp/visiting_staff.js";

export default function initModels(sequelize) {
  const cgs = _cgs.init(sequelize, DataTypes);
  const documents_reviews = _documents_reviews.init(sequelize, DataTypes);
  const documents_uploads = _documents_uploads.init(sequelize, DataTypes);
  const empinfo = _empinfo.init(sequelize, DataTypes);
  const examiner = _examiner.init(sequelize, DataTypes);
  const master_stu = _master_stu.init(sequelize, DataTypes);
  const program_info = _program_info.init(sequelize, DataTypes);
  const roles = _roles.init(sequelize, DataTypes);
  const studinfo = _studinfo.init(sequelize, DataTypes);
  const supervisor = _supervisor.init(sequelize, DataTypes);
  const tbldepartments = _tbldepartments.init(sequelize, DataTypes);
  const visiting_staff = _visiting_staff.init(sequelize, DataTypes);

  documents_reviews.belongsTo(documents_uploads, { as: "doc_up", foreignKey: "doc_up_id"});
  documents_uploads.hasMany(documents_reviews, { as: "documents_reviews", foreignKey: "doc_up_id"});
  cgs.belongsTo(empinfo, { as: "emp", foreignKey: "emp_id"});
  empinfo.hasMany(cgs, { as: "cgs", foreignKey: "emp_id"});
  examiner.belongsTo(empinfo, { as: "emp", foreignKey: "emp_id"});
  empinfo.hasMany(examiner, { as: "examiners", foreignKey: "emp_id"});
  supervisor.belongsTo(empinfo, { as: "emp", foreignKey: "emp_id"});
  empinfo.hasMany(supervisor, { as: "supervisors", foreignKey: "emp_id"});
  documents_uploads.belongsTo(master_stu, { as: "master", foreignKey: "master_id"});
  master_stu.hasMany(documents_uploads, { as: "documents_uploads", foreignKey: "master_id"});
  master_stu.belongsTo(program_info, { as: "Prog_Code_program_info", foreignKey: "Prog_Code"});
  program_info.hasMany(master_stu, { as: "master_stus", foreignKey: "Prog_Code"});
  cgs.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(cgs, { as: "cgs", foreignKey: "role_id"});
  documents_reviews.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(documents_reviews, { as: "documents_reviews", foreignKey: "role_id"});
  documents_uploads.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(documents_uploads, { as: "documents_uploads", foreignKey: "role_id"});
  examiner.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(examiner, { as: "examiners", foreignKey: "role_id"});
  master_stu.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(master_stu, { as: "master_stus", foreignKey: "role_id"});
  supervisor.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(supervisor, { as: "supervisors", foreignKey: "role_id"});
  visiting_staff.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(visiting_staff, { as: "visiting_staffs", foreignKey: "role_id"});
  master_stu.belongsTo(studinfo, { as: "stu", foreignKey: "stu_id"});
  studinfo.hasMany(master_stu, { as: "master_stus", foreignKey: "stu_id"});
  cgs.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(cgs, { as: "cgs", foreignKey: "Dep_Code"});
  documents_reviews.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(documents_reviews, { as: "documents_reviews", foreignKey: "Dep_Code"});
  documents_uploads.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(documents_uploads, { as: "documents_uploads", foreignKey: "Dep_Code"});
  examiner.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(examiner, { as: "examiners", foreignKey: "Dep_Code"});
  master_stu.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(master_stu, { as: "master_stus", foreignKey: "Dep_Code"});
  supervisor.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(supervisor, { as: "supervisors", foreignKey: "Dep_Code"});
  visiting_staff.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(visiting_staff, { as: "visiting_staffs", foreignKey: "Dep_Code"});
  examiner.belongsTo(visiting_staff, { as: "visiting", foreignKey: "visiting_id"});
  visiting_staff.hasMany(examiner, { as: "examiners", foreignKey: "visiting_id"});
  supervisor.belongsTo(visiting_staff, { as: "visiting", foreignKey: "visiting_id"});
  visiting_staff.hasMany(supervisor, { as: "supervisors", foreignKey: "visiting_id"});

  return {
    cgs,
    documents_reviews,
    documents_uploads,
    empinfo,
    examiner,
    master_stu,
    program_info,
    roles,
    studinfo,
    supervisor,
    tbldepartments,
    visiting_staff,
  };
}
