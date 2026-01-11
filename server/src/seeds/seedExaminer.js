import dotenv from "dotenv";
import path from "node:path";
import {
  sequelize,
  empinfo,
  examiner,
  role,
  auditLog
} from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function seedExaminer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Use an existing empinfo ID
    const EMP_ID = "AIU000002";       // must exist in empinfo
    const EXAMINER_ID = "EXA2024001"; // new examiner ID
    const EMAIL = "examiner@aiu.edu.my";
    const PASSWORD = "Examiner@456";  // bcrypt will hash
    const ROLE_ID = "EXA";            // must match the role in your roles table
    const DEP_CODE = "CGS";           // same as empinfo Dep_Code

    // Check role exists
    const examinerRole = await role.findByPk(ROLE_ID);
    if (!examinerRole) throw new Error(`Role ${ROLE_ID} does not exist`);

    // Get the existing empinfo row
    const emp = await empinfo.findByPk(EMP_ID);
    if (!emp) throw new Error(`Empinfo ${EMP_ID} does not exist`);

    // Clean old examiner with the same ID
    await examiner.destroy({ where: { examiner_id: EXAMINER_ID } });

    // Create examiner record
    await examiner.create({
      examiner_id: EXAMINER_ID,
      emp_id: emp.emp_id,
      FirstName: emp.FirstName,
      LastName: emp.LastName,
      EmailId: EMAIL,
      Password: PASSWORD, // hashed by model hook
      Phonenumber: emp.Phonenumber,
      role_id: ROLE_ID,
      Dep_Code: DEP_CODE,
      Status: "Active",
      StartDate: new Date(),
      EndDate: "2028-12-31",
      IsVerified: true,
      MustChangePassword: 1
    });

    // Audit log (optional)
    await auditLog.create({
      email: EMAIL,
      role_id: ROLE_ID,
      event: "SEED_EXAMINER",
      ip: "--",
      userAgent: "Seeder Script",
      timestamp: new Date()
    });

    console.log("🎉 Examiner seeded successfully!");
    console.log("📧 Email:", EMAIL);
    console.log("🔑 Password:", PASSWORD);

  } catch (error) {
    console.error("❌ Seeder failed:", error.message);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedExaminer();
