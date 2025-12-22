import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { sequelize, empinfo, cgs, role, auditLog } from "../config/config.js";

dotenv.config();

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const ADMIN_EMAIL = "admin@aiu.edu.my";
    const ADMIN_PASSWORD = "Admin@123"; // change after seeding
    const EMP_ID = "EMP-CGS-001";
    const ROLE_ID = "CGSADM";
    const DEP_CODE = "CGS";

    // Check role
    const adminRole = await role.findByPk(ROLE_ID);
    if (!adminRole) throw new Error(`Role ${ROLE_ID} does not exist`);

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Create or get empinfo
    const [emp] = await empinfo.findOrCreate({
      where: { emp_id: EMP_ID },
      defaults: {
        emp_id: EMP_ID,
        FirstName: "System",
        LastName: "Administrator",
        EmailId: ADMIN_EMAIL,
        Password: hashedPassword,
        Gender: "Other",
        Dob: "1990-01-01",
        Dep_Code: DEP_CODE,
        Address: "CGS Office",
        Phonenumber: "0000000000",
        Status: 1,
        role: ROLE_ID,
        location: "Main Campus",
      },
    });

    // Create or get CGS admin
    const [admin, created] = await cgs.findOrCreate({
      where: { emp_id: EMP_ID },
      defaults: {
        cgs_id: "CGS-ADMIN-001",
        emp_id: emp.emp_id,
        EmailId: ADMIN_EMAIL,
        Password: hashedPassword,
        FirstName: emp.FirstName,
        LastName: emp.LastName,
        Phonenumber: emp.Phonenumber,
        StartDate: new Date(),
        EndDate: new Date("2099-12-31"),
        role_id: ROLE_ID,
        Dep_Code: DEP_CODE,
        Status: "Active",
        IsVerified: 1,
        MustChangePassword: false,
        RegDate: new Date(),
      },
    });

    if (!created) {
      console.log("⚠️ CGS Admin already exists. Seeder skipped.");
    } else {
      // Audit log
      await auditLog.create({
        email: ADMIN_EMAIL,
        role_id: ROLE_ID,
        event: "SEED_CGS_ADMIN",
        ip: "127.0.0.1",
        userAgent: "Seeder Script",
        timestamp: new Date(),
      });

      console.log("🎉 CGS Admin seeded successfully");
      console.log("📧 Email:", ADMIN_EMAIL);
      console.log("🔑 Password:", ADMIN_PASSWORD);
    }
  } catch (error) {
    console.error("❌ Seeder failed:", error.message);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedAdmin();