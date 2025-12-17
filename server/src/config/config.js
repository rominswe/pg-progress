import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import model factory functions
import initMasterStu from "../models/masterStu.js";
import initSupervisor from "../models/supervisor.js";
import initSuperVisoryMeetings from "../models/supervisorymeetings.js";
import initCgsAdmin from "../models/cgsadmin.js";
import initEmpinfo from "../models/empinfo.js";
import initEvaluation from "../models/evaluation.js";
import initExaminer from "../models/examiner.js";
import initPrograminfo from "../models/programinfo.js";
import initProgress from "../models/progress.js";
import initRole from "../models/roles.js";
import initStudentinfo from "../models/studentinfo.js";
import initTableDepartments from "../models/tbldepartments.js";
import initThesis from "../models/thesis.js";
import initStudentDocument from "../models/studentDocument.js";


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
const supervisor = initSupervisor(sequelize, DataTypes);
const masterStu = initMasterStu(sequelize, DataTypes);
const superVisoryMeeting = initSuperVisoryMeetings(sequelize, DataTypes);
const cgs_admin = initCgsAdmin(sequelize, DataTypes);
const empinfo = initEmpinfo(sequelize, DataTypes);
const evaluation = initEvaluation(sequelize, DataTypes);
const examiner = initExaminer(sequelize, DataTypes);
const programInfo = initPrograminfo(sequelize, DataTypes);
const progress = initProgress(sequelize, DataTypes);
const role = initRole(sequelize, DataTypes);
const studentinfo = initStudentinfo(sequelize, DataTypes);
const tbldepartments = initTableDepartments(sequelize, DataTypes);
const thesis = initThesis(sequelize, DataTypes);
const studentDocument = initStudentDocument(sequelize, DataTypes);

// Relationships
masterStu.hasMany(studentDocument, { foreignKey: "stu_id" });
studentDocument.belongsTo(masterStu, { foreignKey: "stu_id" });

supervisor.hasMany(studentDocument, { foreignKey: "supervisor_id" });
studentDocument.belongsTo(supervisor, { foreignKey: "supervisor_id" });

// Export everything
export {
    sequelize,
  masterStu,
  supervisor,
  superVisoryMeeting,
  studentDocument,
  cgs_admin,
  empinfo,
  evaluation,
  examiner,
  programInfo,
  progress,
  role,
  studentinfo,
  tbldepartments,
  thesis
};