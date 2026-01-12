import dotenv from "dotenv";
import path from "node:path";
import { sequelize, master_stu, studentinfo, loginAttempt } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function createValidStudent() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected");

        // 1. Clear Lockouts
        await loginAttempt.destroy({ where: {}, truncate: true });
        console.log("🔓 Cleared all login lockouts.");

        // 2. Find a base student info to promote
        // We'll use student1 or the one the user was trying if it exists in studinfo
        const targetEmail = "student1@aiu.edu.my";

        const baseStudent = await studentinfo.findOne({
            where: { EmailId: targetEmail }
        });

        if (!baseStudent) {
            console.error(`❌ Could not find valid base record for ${targetEmail} in studinfo.`);
            console.error("   Please run 'node src/seeds/seedStudent.js' first.");
            return;
        }

        // 3. Create or Update master_stu record
        // We need to match the fields required in master_stu.js
        const [user, created] = await master_stu.findOrCreate({
            where: { stu_id: baseStudent.stu_id },
            defaults: {
                master_id: "MSTU00001", // manual ID
                stu_id: baseStudent.stu_id,
                FirstName: baseStudent.FirstName,
                LastName: baseStudent.LastName,
                EmailId: baseStudent.EmailId,
                Password: "Student@123", // Will be hashed by hook
                Dep_Code: baseStudent.Dep_Code,
                Prog_Code: baseStudent.Prog_Code,
                role_id: "STU",
                Status: "Active",
                RegDate: new Date(),
                StartDate: new Date(),
                EndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
                IsVerified: 1,
                MustChangePassword: 0 // Allow immediate login
            }
        });

        if (!created) {
            // If exists, ensure password is reliable and status is Active
            user.Password = "Student@123";
            user.Status = "Active";
            user.MustChangePassword = 0;
            user.IsVerified = 1;
            await user.save();
            console.log("♻️  Reset existing student login.");
        } else {
            console.log("✅ Created new student login.");
        }

        console.log("\n===========================================");
        console.log("LOGIN CREDENTIALS:");
        console.log(`User: ${targetEmail}`);
        console.log("Pass: Student@123");
        console.log("===========================================\n");

    } catch (error) {
        console.error("❌ Failed:", error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

createValidStudent();
