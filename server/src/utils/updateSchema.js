
import dotenv from "dotenv";
import path from "node:path";
import { sequelize } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function updateSchema() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected");

        // This will update the database schema to match the models
        // safe: false allows dropping columns if needed, but alter: true is usually enough for adding
        console.log("🔄 Syncing database schema (Alter)...");
        await sequelize.sync({ alter: true });

        console.log("✅ Database schema updated successfully!");
    } catch (err) {
        console.error("❌ Failed to update schema:", err);
    } finally {
        await sequelize.close();
    }
}

updateSchema();
