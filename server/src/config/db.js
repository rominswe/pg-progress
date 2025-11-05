import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import masterStu from '../models/masterStu.js';
import supervisor from "../models/Supervisor.js";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: false,
  }
);

supervisor.init(sequelize, Sequelize.DataTypes);
masterStu.init(sequelize, Sequelize.DataTypes);

export { sequelize, 
  masterStu, 
  supervisor };
  
export default sequelize;