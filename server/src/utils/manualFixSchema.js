
import dotenv from "dotenv";
import path from "node:path";
import { sequelize } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function fixSchema() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected");

        // Use raw SQL to add the column safely. 
        // IF NOT EXISTS syntax isn't valid for ADD COLUMN in strict MySQL, 
        // so we wrap in try/catch or use a Procedure. 
        // But for this simple fix, we'll try to add it. If it exists, it errors but harmlessly.

        const query = `
            ALTER TABLE defense_evaluations 
            ADD COLUMN viva_outcome ENUM('Pass', 'Minor Corrections', 'Major Corrections', 'Fail') NULL DEFAULT NULL;
        `;

        try {
            await sequelize.query(query);
            console.log("✅ Column 'viva_outcome' added successfully!");
        } catch (e) {
            if (e.original && e.original.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ Column 'viva_outcome' already exists.");
            } else {
                throw e;
            }
        }

    } catch (err) {
        console.error("❌ Failed to update schema:", err);
    } finally {
        await sequelize.close();
    }
}

fixSchema();
