
import dotenv from "dotenv";
import path from "node:path";
import { sequelize } from "../config/config.js";
import initModels from "../models/init-models.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function createTable() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected");

        const models = initModels(sequelize);

        // Sync specifically the examiner_assignments table
        // .sync({ force: true }) will drop it if it exists (good for seed reset) or just create it
        // We shouldn't need force:true if it doesn't exist, but force:true makes sure it matches model
        await models.examiner_assignments.sync({ force: true });

        console.log("✅ Table 'examiner_assignments' created successfully!");
    } catch (err) {
        console.error("❌ Failed to create table:", err);
    } finally {
        await sequelize.close();
    }
}

createTable();
