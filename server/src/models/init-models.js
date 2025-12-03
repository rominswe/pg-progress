var DataTypes = require("sequelize").DataTypes;
var _cgs_admin = require("./cgsadmin");
var _empinfo = require("./empinfo");
var _evaluation = require("./evaluation");
var _examiner = require("./examiner");
var _master_stu = require("./masterstu");
var _program_info = require("./programinfo");
var _progress = require("./progress");
var _roles = require("./roles");
var _studinfo = require("./studinfo");
var _supervisor = require("./supervisor");
var _supervisory_meetings = require("./supervisorymeetings");
var _tbldepartments = require("./tbldepartments");
var _thesis = require("./thesis");

function initModels(sequelize) {
  var cgs_admin = _cgs_admin(sequelize, DataTypes);
  var empinfo = _empinfo(sequelize, DataTypes);
  var evaluation = _evaluation(sequelize, DataTypes);
  var examiner = _examiner(sequelize, DataTypes);
  var master_stu = _master_stu(sequelize, DataTypes);
  var program_info = _program_info(sequelize, DataTypes);
  var progress = _progress(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var studinfo = _studinfo(sequelize, DataTypes);
  var supervisor = _supervisor(sequelize, DataTypes);
  var supervisory_meetings = _supervisory_meetings(sequelize, DataTypes);
  var tbldepartments = _tbldepartments(sequelize, DataTypes);
  var thesis = _thesis(sequelize, DataTypes);

  supervisory_meetings.belongsTo(master_stu, { as: "stu", foreignKey: "stu_id"});
  master_stu.hasMany(supervisory_meetings, { as: "supervisory_meetings", foreignKey: "stu_id"});
  master_stu.belongsTo(program_info, { as: "Prog_Code_program_info", foreignKey: "Prog_Code"});
  program_info.hasMany(master_stu, { as: "master_stus", foreignKey: "Prog_Code"});
  supervisor.belongsTo(roles, { as: "Role_role", foreignKey: "Role"});
  roles.hasMany(supervisor, { as: "supervisors", foreignKey: "Role"});
  master_stu.belongsTo(supervisor, { as: "Supervisor_supervisor", foreignKey: "Supervisor"});
  supervisor.hasMany(master_stu, { as: "master_stus", foreignKey: "Supervisor"});
  master_stu.belongsTo(supervisor, { as: "Co_Supervisor_supervisor", foreignKey: "Co_Supervisor"});
  supervisor.hasMany(master_stu, { as: "Co_Supervisor_master_stus", foreignKey: "Co_Supervisor"});
  master_stu.belongsTo(supervisor, { as: "Co_T_Suv_supervisor", foreignKey: "Co_T_Suv"});
  supervisor.hasMany(master_stu, { as: "Co_T_Suv_master_stus", foreignKey: "Co_T_Suv"});
  master_stu.belongsTo(supervisor, { as: "Co_S_Suv_supervisor", foreignKey: "Co_S_Suv"});
  supervisor.hasMany(master_stu, { as: "Co_S_Suv_master_stus", foreignKey: "Co_S_Suv"});
  supervisory_meetings.belongsTo(supervisor, { as: "supervisor", foreignKey: "supervisor_id"});
  supervisor.hasMany(supervisory_meetings, { as: "supervisory_meetings", foreignKey: "supervisor_id"});
  supervisory_meetings.belongsTo(supervisor, { as: "co_supervisor", foreignKey: "co_supervisor_id"});
  supervisor.hasMany(supervisory_meetings, { as: "co_supervisor_supervisory_meetings", foreignKey: "co_supervisor_id"});
  tbldepartments.hasMany(empinfo, { as: "empinfos", foreignKey: "Dep_Code"});
  master_stu.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(master_stu, { as: "master_stus", foreignKey: "Dep_Code"});
  program_info.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(program_info, { as: "program_infos", foreignKey: "Dep_Code"});
  roles.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(roles, { as: "roles", foreignKey: "Dep_Code"});
  studinfo.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(studinfo, { as: "studinfos", foreignKey: "Dep_Code"});
  supervisor.belongsTo(tbldepartments, { as: "Dep_Code_tbldepartment", foreignKey: "Dep_Code"});
  tbldepartments.hasMany(supervisor, { as: "supervisors", foreignKey: "Dep_Code"});

  return {
    cgs_admin,
    empinfo,
    evaluation,
    examiner,
    master_stu,
    program_info,
    progress,
    roles,
    studinfo,
    supervisor,
    supervisory_meetings,
    tbldepartments,
    thesis,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

