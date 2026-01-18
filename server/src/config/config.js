/* ========================= IMPORTS ========================= */
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "node:path";
import initModels from "../models/init-models.js";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

/* ========================= SEQUELIZE INSTANCE ========================= */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    define: {
      timestamps: false,
    },
    logging: false,
  }
);

/* ========================= INITIALIZE MODELS ========================= */
const models = initModels(sequelize);

/* ========================= EXPORT MODELS AND SEQUELIZE ========================= */
export const {
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
  // Functionate features
  progress_updates,
  service_requests,
  defense_evaluations
} = models;

export { sequelize };
