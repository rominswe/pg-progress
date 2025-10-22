import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Must be here before using process.env

const sequelize = new Sequelize("aiu_pg_progress", "root", "root", {
  host: "mysql",   // must match your service name
  dialect: "mysql",
  port: 3306,      // container default port (mapped to 3307 externally)
});

export default sequelize;
