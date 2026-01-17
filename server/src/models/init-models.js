import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _documents_reviews from "./documents_reviews.js";
import _documents_uploads from "./documents_uploads.js";
import _empinfo from "./empinfo.js";
import _expertise from "./expertise.js";
import _pgstaff_expertise from "./pgstaff_expertise.js";
import _pgstaff_qualification from "./pgstaff_qualification.js";
import _pgstaff_roles from "./pgstaff_roles.js";
import _pgstaffinfo from "./pgstaffinfo.js";
import _pgstudinfo from "./pgstudinfo.js";
import _program_info from "./program_info.js";
import _qualification from "./qualification.js";
import _role_assignment from "./role_assignment.js";
import _roles from "./roles.js";
import _studinfo from "./studinfo.js";
import _tbldepartments from "./tbldepartments.js";

export default function initModels(sequelize) {
  const documents_reviews = _documents_reviews.init(sequelize, DataTypes);
  const documents_uploads = _documents_uploads.init(sequelize, DataTypes);
  const empinfo = _empinfo.init(sequelize, DataTypes);
  const expertise = _expertise.init(sequelize, DataTypes);
  const pgstaff_expertise = _pgstaff_expertise.init(sequelize, DataTypes);
  const pgstaff_qualification = _pgstaff_qualification.init(sequelize, DataTypes);
  const pgstaff_roles = _pgstaff_roles.init(sequelize, DataTypes);
  const pgstaffinfo = _pgstaffinfo.init(sequelize, DataTypes);
  const pgstudinfo = _pgstudinfo.init(sequelize, DataTypes);
  const program_info = _program_info.init(sequelize, DataTypes);
  const qualification = _qualification.init(sequelize, DataTypes);
  const role_assignment = _role_assignment.init(sequelize, DataTypes);
  const roles = _roles.init(sequelize, DataTypes);
  const studinfo = _studinfo.init(sequelize, DataTypes);
  const tbldepartments = _tbldepartments.init(sequelize, DataTypes);

  documents_reviews.belongsTo(documents_uploads, { as: "doc_up", foreignKey: "doc_up_id" });
  documents_uploads.hasMany(documents_reviews, { as: "documents_reviews", foreignKey: "doc_up_id" });
  pgstaffinfo.belongsTo(empinfo, { as: "emp", foreignKey: "emp_id" });
  empinfo.hasMany(pgstaffinfo, { as: "pgstaffinfos", foreignKey: "emp_id" });
  pgstaff_expertise.belongsTo(pgstaffinfo, { as: "pg_staff", foreignKey: "pg_staff_id" });
  pgstaffinfo.hasMany(pgstaff_expertise, { as: "pgstaff_expertises", foreignKey: "pg_staff_id" });
  pgstaff_expertise.belongsTo(expertise, { as: "expertise", foreignKey: "expertise_code", targetKey: "expertise_code" });
  expertise.hasMany(pgstaff_expertise, { as: "pgstaff_expertises", foreignKey: "expertise_code", sourceKey: "expertise_code" });

  pgstaff_qualification.belongsTo(pgstaffinfo, { as: "pg_staff", foreignKey: "pg_staff_id" });
  pgstaffinfo.hasMany(pgstaff_qualification, { as: "pgstaff_qualifications", foreignKey: "pg_staff_id" });
  pgstaff_qualification.belongsTo(qualification, { as: "qualification", foreignKey: "qualification_code", targetKey: "qualification_code" });
  qualification.hasMany(pgstaff_qualification, { as: "pgstaff_qualifications", foreignKey: "qualification_code", sourceKey: "qualification_code" });
  pgstaff_roles.belongsTo(pgstaffinfo, { as: "pg_staff", foreignKey: "pg_staff_id" });
  pgstaffinfo.hasMany(pgstaff_roles, { as: "pgstaff_roles", foreignKey: "pg_staff_id" });
  role_assignment.belongsTo(pgstaffinfo, { as: "pg_staff", foreignKey: "pg_staff_id" });
  pgstaffinfo.hasMany(role_assignment, { as: "role_assignments", foreignKey: "pg_staff_id" });
  role_assignment.belongsTo(pgstaffinfo, { as: "requester", foreignKey: "requested_by" });
  pgstaffinfo.hasMany(role_assignment, { as: "requested_assignments", foreignKey: "requested_by" });
  documents_uploads.belongsTo(pgstudinfo, { as: "master", foreignKey: "master_id" });
  pgstudinfo.hasMany(documents_uploads, { as: "documents_uploads", foreignKey: "master_id" });
  role_assignment.belongsTo(pgstudinfo, { as: "pg_student", foreignKey: "pg_student_id" });
  pgstudinfo.hasMany(role_assignment, { as: "role_assignments", foreignKey: "pg_student_id" });
  pgstudinfo.belongsTo(program_info, { as: "Prog_Code_program_info", foreignKey: "Prog_Code" });
  program_info.hasMany(pgstudinfo, { as: "pgstudinfos", foreignKey: "Prog_Code" });
  documents_reviews.belongsTo(roles, { as: "role", foreignKey: "role_id" });
  roles.hasMany(documents_reviews, { as: "documents_reviews", foreignKey: "role_id" });
  documents_uploads.belongsTo(roles, { as: "role", foreignKey: "role_id" });
  roles.hasMany(documents_uploads, { as: "documents_uploads", foreignKey: "role_id" });
  pgstaff_roles.belongsTo(roles, { as: "role", foreignKey: "role_id" });
  roles.hasMany(pgstaff_roles, { as: "pgstaff_roles", foreignKey: "role_id" });
  pgstudinfo.belongsTo(roles, { as: "role", foreignKey: "role_id" });
  roles.hasMany(pgstudinfo, { as: "pgstudinfos", foreignKey: "role_id" });
  role_assignment.belongsTo(roles, { as: "pg_staff_type_role", foreignKey: "pg_staff_type" });
  roles.hasMany(role_assignment, { as: "role_assignments", foreignKey: "pg_staff_type" });
  pgstudinfo.belongsTo(studinfo, { as: "stu", foreignKey: "stu_id" });
  studinfo.hasMany(pgstudinfo, { as: "pgstudinfos", foreignKey: "stu_id" });
  documents_reviews.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code" });
  tbldepartments.hasMany(documents_reviews, { as: "documents_reviews", foreignKey: "Dep_Code" });
  documents_uploads.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code" });
  tbldepartments.hasMany(documents_uploads, { as: "documents_uploads", foreignKey: "Dep_Code" });
  expertise.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code" });
  tbldepartments.hasMany(expertise, { as: "expertises", foreignKey: "Dep_Code" });
  pgstaff_roles.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code" });
  tbldepartments.hasMany(pgstaff_roles, { as: "pgstaff_roles", foreignKey: "Dep_Code" });
  pgstudinfo.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code" });
  tbldepartments.hasMany(pgstudinfo, { as: "pgstudinfos", foreignKey: "Dep_Code" });
  program_info.belongsTo(tbldepartments, { as: "tbldepartment", foreignKey: "Dep_Code" });
  tbldepartments.hasMany(program_info, { as: "program_infos", foreignKey: "Dep_Code" });

  return {
    documents_reviews,
    documents_uploads,
    empinfo,
    expertise,
    pgstaff_expertise,
    pgstaff_qualification,
    pgstaff_roles,
    pgstaffinfo,
    pgstudinfo,
    program_info,
    qualification,
    role_assignment,
    roles,
    studinfo,
    tbldepartments,
  };
}
