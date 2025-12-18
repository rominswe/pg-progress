import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import class-based models
import Supervisor from "../models/supervisor.js";
import MasterStu from "../models/master_stu.js";
import SuperVisoryMeeting from "../models/supervisory_meetings.js";
import Cgs from "../models/cgs.js";
import Empinfo from "../models/empinfo.js";
import Evaluation from "../models/evaluation.js";
import Examiner from "../models/examiner.js";
import ProgramInfo from "../models/program_info.js";
import Progress from "../models/progress.js";
import Role from "../models/roles.js";
import Studentinfo from "../models/studinfo.js";
import TableDepartments from "../models/tbldepartments.js";
import Thesis from "../models/thesis.js";
import StudentDocument from "../models/student_documents.js";


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
const supervisor = Supervisor.init(sequelize, DataTypes);
const masterStu = MasterStu.init(sequelize, DataTypes);
const superVisoryMeeting = SuperVisoryMeeting.init(sequelize, DataTypes);
const cgs = Cgs.init(sequelize, DataTypes);
const empinfo = Empinfo.init(sequelize, DataTypes);
const evaluation = Evaluation.init(sequelize, DataTypes);
const examiner = Examiner.init(sequelize, DataTypes);
const programInfo = ProgramInfo.init(sequelize, DataTypes);
const progress = Progress.init(sequelize, DataTypes);
const role = Role.init(sequelize, DataTypes);
const studentinfo = Studentinfo.init(sequelize, DataTypes);
const tbldepartments = TableDepartments.init(sequelize, DataTypes);
const thesis = Thesis.init(sequelize, DataTypes);
const studentDocument = StudentDocument.init(sequelize, DataTypes);

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
  cgs,
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