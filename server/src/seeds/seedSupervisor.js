import dotenv from "dotenv";
import path from "node:path";
import { sequelize, empinfo, supervisor, auditLog } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function seedSupervisor() {
  try {
    await sequelize.authenticate();
    const EMP_ID = "EMP-SUP-999";
    const EMAIL = "supervisor@aiu.edu.my";
    const ROLE_ID = "SUV";

    await supervisor.destroy({ where: { emp_id: EMP_ID } });
    await empinfo.destroy({ where: { emp_id: EMP_ID } });

    // 1. Create empinfo
    const emp = await empinfo.create({
      emp_id: EMP_ID,
      FirstName: "Dr. Robert",
      LastName: "Brown",
      EmailId: EMAIL,
      Password: "Supervisor@123",
      Gender: "Male",
      Dob: "1975-10-20",
      Dep_Code: "CGS",
      Address: "Faculty Office 10",
      Phonenumber: "0198887776",
      Status: 1,
      role: ROLE_ID,
      location: "Faculty Building",
      Isverified: 1
    });

    // 2. Create supervisor portal record
    await supervisor.create({
      sup_id: "SUP-2024-001",
      emp_id: emp.emp_id,
      FirstName: emp.FirstName,
      LastName: emp.LastName,
      EmailId: EMAIL,
      Password: "Supervisor@123",
      Phonenumber: emp.Phonenumber,
      role_id: ROLE_ID,
      Dep_Code: emp.Dep_Code,
      Status: "Active",
      StartDate: new Date(),
      EndDate: "2030-01-01",
      IsVerified: true,
      MustChangePassword: 0
    });

    await auditLog.create({
      email: EMAIL, role_id: ROLE_ID, event: "SEED_SUPERVISOR",
      ip: "--", userAgent: "Seeder", timestamp: new Date()
    });

    console.log("🎉 Supervisor seeded: ", EMAIL);
  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await sequelize.close();
  }
}
seedSupervisor();