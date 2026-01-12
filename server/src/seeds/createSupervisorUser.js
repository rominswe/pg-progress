import dotenv from "dotenv";
import path from "node:path";
import { sequelize, supervisor, empinfo, loginAttempt } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function createValidSupervisor() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected");

        // 1. Clear Lockouts
        await loginAttempt.destroy({ where: {}, truncate: true });
        console.log("🔓 Cleared all login lockouts.");

        // 2. Find a base employee to promote (One who is intended to be a Supervisor)
        // Based on seedEmpinfo.js, users with 'suv' in email or role 'SUV'
        const targetEmailLike = "%suv@aiu.edu.my";

        // Let's try to find a specific one or the first available 'SUV' role employee
        const baseEmployee = await empinfo.findOne({
            where: { role: 'SUV' }
        });

        if (!baseEmployee) {
            console.error(`❌ Could not find valid base record for a Supervisor in empinfo.`);
            console.error("   Please run 'node src/seeds/seedEmpinfo.js' first.");
            return;
        }

        console.log(`Found Employee: ${baseEmployee.EmailId}`);

        // 3. Create or Update supervisor record
        const [user, created] = await supervisor.findOrCreate({
            where: { emp_id: baseEmployee.emp_id },
            defaults: {
                sup_id: "SUV00001", // manual ID
                emp_id: baseEmployee.emp_id,
                FirstName: baseEmployee.FirstName,
                LastName: baseEmployee.LastName,
                EmailId: baseEmployee.EmailId,
                Password: "Supervisor@123", // Will be hashed by hook
                Phonenumber: baseEmployee.Phonenumber || "0123456789",
                Dep_Code: baseEmployee.Dep_Code,
                role_id: "SUV",
                Status: "Active",
                RegDate: new Date(),
                StartDate: new Date(),
                EndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
                IsVerified: 1,
                MustChangePassword: 0 // Allow immediate login
            }
        });

        if (!created) {
            // If exists, ensure password is reliable and status is Active
            user.Password = "Supervisor@123";
            user.Status = "Active";
            user.MustChangePassword = 0;
            user.IsVerified = 1;
            await user.save();
            console.log("♻️  Reset existing supervisor login.");
        } else {
            console.log("✅ Created new supervisor login.");
        }

        console.log("\n===========================================");
        console.log("LOGIN CREDENTIALS:");
        console.log(`User: ${baseEmployee.EmailId}`);
        console.log("Pass: Supervisor@123");
        console.log("===========================================\n");

    } catch (error) {
        console.error("❌ Failed:", error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

createValidSupervisor();
