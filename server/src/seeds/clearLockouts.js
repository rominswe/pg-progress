import { loginAttempt } from "../config/config.js";
import { sequelize } from "../config/config.js";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function clearLockouts() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected");

        await loginAttempt.destroy({
            where: {},
            truncate: true
        });

        console.log("✅ All login attempts cleared. Accounts unlocked.");

    } catch (err) {
        console.error("❌ Failed to clear lockouts:", err);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

clearLockouts();
