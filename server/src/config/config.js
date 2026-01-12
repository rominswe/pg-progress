import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
import path from "node:path"

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

// Import class-based models
import Supervisor from "../models/supervisor.js";
import MasterStu from "../models/master_stu.js";
import Cgs from "../models/cgs.js";
import Empinfo from "../models/empinfo.js";
import Examiner from "../models/examiner.js";
import ProgramInfo from "../models/program_info.js";
import Role from "../models/roles.js";
import Studentinfo from "../models/studinfo.js";
import TableDepartments from "../models/tbldepartments.js";
import VisitingStaff from "../models/visiting_staff.js";
import DocUp from "../models/documents_uploads.js";
import DocRev from "../models/documents_reviews.js";

// Create Sequelize instance first
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

// Initialize all models using the sequelize instance
const empinfo = Empinfo.init(sequelize, DataTypes);
const role = Role.init(sequelize, DataTypes);
const tbldepartments = TableDepartments.init(sequelize, DataTypes);

const cgs = Cgs.init(sequelize, DataTypes);
const examiner = Examiner.init(sequelize, DataTypes);
const supervisor = Supervisor.init(sequelize, DataTypes);
const visiting_staff = VisitingStaff.init(sequelize, DataTypes);

const studentinfo = Studentinfo.init(sequelize, DataTypes);
const programInfo = ProgramInfo.init(sequelize, DataTypes);
const master_stu = MasterStu.init(sequelize, DataTypes);

const doc_up = DocUp.init(sequelize, DataTypes);
const doc_rev = DocRev.init(sequelize, DataTypes);

// Relationships

// Empinfo relationships
empinfo.hasMany(cgs, { foreignKey: "emp_id" });
cgs.belongsTo(empinfo, { foreignKey: "emp_id" });

empinfo.hasMany(examiner, { foreignKey: "emp_id" });
examiner.belongsTo(empinfo, { foreignKey: "emp_id" });

empinfo.hasMany(supervisor, { foreignKey: "emp_id" });
supervisor.belongsTo(empinfo, { foreignKey: "emp_id" });

// Role-based access control
role.hasMany(cgs, { foreignKey: "role_id" });
cgs.belongsTo(role, { foreignKey: "role_id" });

role.hasMany(examiner, { foreignKey: "role_id" });
examiner.belongsTo(role, { foreignKey: "role_id" });

role.hasMany(supervisor, { foreignKey: "role_id" });
supervisor.belongsTo(role, { foreignKey: "role_id" });

role.hasMany(master_stu, { foreignKey: "role_id" });
master_stu.belongsTo(role, { foreignKey: "role_id" });

role.hasMany(visiting_staff, { foreignKey: "role_id" });
visiting_staff.belongsTo(role, { foreignKey: "role_id" });

// Department relationships
tbldepartments.hasMany(cgs, { foreignKey: "Dep_Code" });
cgs.belongsTo(tbldepartments, { foreignKey: "Dep_Code" });

tbldepartments.hasMany(examiner, { foreignKey: "Dep_Code" });
examiner.belongsTo(tbldepartments, { foreignKey: "Dep_Code" });

tbldepartments.hasMany(supervisor, { foreignKey: "Dep_Code" });
supervisor.belongsTo(tbldepartments, { foreignKey: "Dep_Code" });

tbldepartments.hasMany(master_stu, { foreignKey: "Dep_Code" });
master_stu.belongsTo(tbldepartments, { foreignKey: "Dep_Code" });

tbldepartments.hasMany(visiting_staff, { foreignKey: "Dep_Code" });
visiting_staff.belongsTo(tbldepartments, { foreignKey: "Dep_Code" });

// Student relationships
studentinfo.hasMany(master_stu, { foreignKey: "stu_id" });
master_stu.belongsTo(studentinfo, { foreignKey: "stu_id" });

programInfo.hasMany(master_stu, { foreignKey: "Prog_Code" });
master_stu.belongsTo(programInfo, { foreignKey: "Prog_Code" });

// ================= DOCUMENT RELATIONSHIPS ================= //

// Document upload → reviews
doc_up.hasMany(doc_rev, { foreignKey: "doc_up_id", as: "documents_reviews" });
doc_rev.belongsTo(doc_up, { foreignKey: "doc_up_id", as: "doc_up" });

// Document upload → master student
master_stu.hasMany(doc_up, { foreignKey: "master_id", as: "documents_uploads" });
doc_up.belongsTo(master_stu, { foreignKey: "master_id", as: "master" });

// Role → document uploads & reviews
role.hasMany(doc_up, { foreignKey: "role_id" });
doc_up.belongsTo(role, { foreignKey: "role_id", as: "role" });
role.hasMany(doc_rev, { foreignKey: "role_id" });
doc_rev.belongsTo(role, { foreignKey: "role_id", as: "role" });

// ================= EXPORT ================= //
export {
  sequelize,
  empinfo,
  role,
  tbldepartments,
  cgs,
  examiner,
  supervisor,
  visiting_staff,
  studentinfo,
  master_stu,
  programInfo,
  doc_up,
  doc_rev
};