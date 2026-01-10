import dotenv from "dotenv";
import path from "node:path";
import { empinfo, studentinfo } from "./config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function debugDB() {
    try {
        console.log("🔍 Starting DB Debug...");

        // Test Employee ID from seeds
        const testEmpId = "AIU000001";
        console.log(`\n--- Querying empinfo for ${testEmpId} ---`);
        const emp = await empinfo.findOne({
            where: { emp_id: testEmpId },
            logging: console.log
        });

        if (emp) {
            console.log("✅ Emp Found!");
            console.log("Raw Values:", emp.dataValues);
            console.log("Get() Values:", emp.get());
        } else {
            console.log("❌ Emp NOT Found");
        }

        // Test Student ID from seeds
        const testStuId = "AIU000001";
        console.log(`\n--- Querying studentinfo for ${testStuId} ---`);
        const stu = await studentinfo.findOne({
            where: { stu_id: testStuId },
            logging: console.log
        });

        if (stu) {
            console.log("✅ Student Found!");
            console.log("Raw Values:", stu.dataValues);
        } else {
            console.log("❌ Student NOT Found");
        }

    } catch (err) {
        console.error("❌ DB Debug Failed:", err);
    } finally {
        process.exit();
    }
}

debugDB();
