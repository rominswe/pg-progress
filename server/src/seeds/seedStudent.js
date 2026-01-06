import dotenv from "dotenv";
import path from "node:path";
import { sequelize, studentinfo, master_stu, auditLog } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function seedStudent() {
  try {
    await sequelize.authenticate();
    const STU_ID = "STU2024001";
    const EMAIL = "student@aiu.edu.my";
    const ROLE_ID = "STU";

    // Clean up existing
    await master_stu.destroy({ where: { stu_id: STU_ID } });
    await studentinfo.destroy({ where: { stu_id: STU_ID } });

    // 1. Create studinfo
    const info = await studentinfo.create({
      stu_id: STU_ID,
      Dep_Code: "CGS",
      Prog_Code: "MER",
      FirstName: "John",
      LastName: "Doe",
      EmailId: EMAIL,
      Password: "Student@123",
      Gender: "Male",
      Dob: "1998-05-15",
      Acad_Year: "2024",
      Exp_GraduatedYear: "2027",
      Address: "Student Residence Block A",
      Av_leave: "15",
      Phonenumber: "0123456789",
      Status: 1,
      role: ROLE_ID,
      location: "Main Campus",
      ID_Image: "default.png",
      Isverified: 1
    });

    // 2. Create master_stu
    await master_stu.create({
      master_id: "MSTR-STU-001",
      stu_id: info.stu_id,
      FirstName: info.FirstName,
      LastName: info.LastName,
      EmailId: EMAIL,
      Password: "Student@123", // Will be hashed by hooks
      Dep_Code: info.Dep_Code,
      Prog_Code: info.Prog_Code,
      role_id: ROLE_ID,
      Status: "Active",
      StartDate: new Date(),
      EndDate: "2027-12-31",
      IsVerified: true,
      MustChangePassword: 0
    });

    await auditLog.create({
      email: EMAIL, role_id: ROLE_ID, event: "SEED_STUDENT",
      ip: "--", userAgent: "Seeder", timestamp: new Date()
    });

    console.log("🎉 Student seeded: ", EMAIL);
  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await sequelize.close();
  }
}
seedStudent();