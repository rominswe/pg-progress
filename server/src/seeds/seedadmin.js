import dotenv from "dotenv";
import path from "node:path";
import { sequelize, empinfo, cgs, role, auditLog } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const ADMIN_EMAIL = "admin@aiu.edu.my";
    const ADMIN_PASSWORD = "Admin@123"; // Change after seeding for security
    const EMP_ID = "EMP-CGS-001";
    const ROLE_ID = "CGSADM";
    const DEP_CODE = "CGS";

    const adminRole = await role.findByPk(ROLE_ID);
    if (!adminRole) throw new Error(`Role ${ROLE_ID} does not exist`);

    // Delete previous admin if exists
    await cgs.destroy({ where: { emp_id: EMP_ID } });
    await empinfo.destroy({ where: { emp_id: EMP_ID } });

    // Create empinfo record
    const emp = await empinfo.create({
      emp_id: EMP_ID,
      FirstName: "System",
      LastName: "Administrator",
      EmailId: ADMIN_EMAIL,
      Password: ADMIN_PASSWORD,
      Gender: "Male",
      Dob: "1990-01-01",
      Dep_Code: DEP_CODE,
      Address: "CGS Office",
      Phonenumber: "0000000000",
      Status: "1",
      role: ROLE_ID,
      location: "Main Campus",
    });

    // Create CGS admin record
    const Admin = await cgs.create({
      cgs_id: "CGS-ADMIN-001",
      emp_id: emp.emp_id,
      EmailId: ADMIN_EMAIL,
      Password: ADMIN_PASSWORD,
      FirstName: emp.FirstName,
      LastName: emp.LastName,
      Phonenumber: emp.Phonenumber,
      StartDate: new Date(),
      EndDate: "2099-12-31",
      role_id: ROLE_ID,
      Dep_Code: DEP_CODE,
      IsVerified: true,
      Status: "Active",
      RegDate: new Date(),
      MustChangePassword: 0,
    });

    // Audit log
    await auditLog.create({
      email: ADMIN_EMAIL,
      role_id: ROLE_ID,
      event: "SEED_CGS_ADMIN",
      ip: "--",
      userAgent: "Seeder Script",
      timestamp: new Date(),
    });

    console.log("🎉 CGS Admin seeded successfully!");
    console.log("📧 Email:", ADMIN_EMAIL);
    console.log("🔑 Password:", ADMIN_PASSWORD);

  } catch (error) {
    console.error("❌ Seeder failed:", error.message);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedAdmin();