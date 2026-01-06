import dotenv from "dotenv";
import path from "node:path";
import { sequelize, empinfo, examiner, auditLog } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function seedExaminer() {
  try {
    await sequelize.authenticate();
    const EMP_ID = "EMP-EXM-888";
    const EMAIL = "examiner@aiu.edu.my";
    const ROLE_ID = "EXM";

    await examiner.destroy({ where: { emp_id: EMP_ID } });
    await empinfo.destroy({ where: { emp_id: EMP_ID } });

    // 1. Create empinfo
    const emp = await empinfo.create({
      emp_id: EMP_ID,
      FirstName: "Prof. Sarah",
      LastName: "Wilson",
      EmailId: EMAIL,
      Password: "Examiner@123",
      Gender: "Female",
      Dob: "1980-02-28",
      Dep_Code: "SOCS",
      Address: "Academic Wing B",
      Phonenumber: "0112223334",
      Status: 1,
      role: ROLE_ID,
      location: "Research Center",
      Isverified: 1
    });

    // 2. Create examiner portal record
    await examiner.create({
      examiner_id: "EXM-2024-001",
      emp_id: emp.emp_id,
      FirstName: emp.FirstName,
      LastName: emp.LastName,
      EmailId: EMAIL,
      Password: "Examiner@123",
      Phonenumber: emp.Phonenumber,
      role_id: ROLE_ID,
      Dep_Code: emp.Dep_Code,
      Status: "Active",
      StartDate: new Date(),
      EndDate: "2028-12-31",
      IsVerified: true,
      MustChangePassword: 0
    });

    await auditLog.create({
      email: EMAIL, role_id: ROLE_ID, event: "SEED_EXAMINER",
      ip: "--", userAgent: "Seeder", timestamp: new Date()
    });

    console.log("🎉 Examiner seeded: ", EMAIL);
  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await sequelize.close();
  }
}
seedExaminer();