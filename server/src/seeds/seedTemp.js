import dotenv from "dotenv";
import path from "node:path";
import { sequelize, studentinfo } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function seedTwoStudents() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const students = [
      {
        stu_id: "AIU23102132",
        Dep_Code: "SCI",
        Prog_Code: "CS",
        FirstName: "Ye Min",
        LastName: "Myat",
        EmailId: "ye.myat@student.aiu.edu.my",
        Password: "Student@123", // hashed by hook
        Gender: "Male",
        Dob: "2003-01-01",
        Acad_Year: "2024/2025",
        Exp_GraduatedYear: "2026",
        Address: "SCI Hostel",
        Av_leave: "30",
        Phonenumber: "0101234567",
        Status: 1,
        RegDate: new Date(),
        role: "STU",
        location: "Main Campus",
        ID_Image: "default-id.png",
        Country: "Malaysia",
        Passport: null,
        Roomnum: "R-231",
        Vcode: null,
        Isverified: 1,
      },
      {
        stu_id: "AIU23102103",
        Dep_Code: "SCI",
        Prog_Code: "CS",
        FirstName: "Myat Min",
        LastName: "Khant",
        EmailId: "myat.khant@student.aiu.edu.my",
        Password: "Student@123", // hashed by hook
        Gender: "Male",
        Dob: "2003-01-01",
        Acad_Year: "2024/2025",
        Exp_GraduatedYear: "2026",
        Address: "SCI Hostel",
        Av_leave: "30",
        Phonenumber: "0107654321",
        Status: 1,
        RegDate: new Date(),
        role: "STU",
        location: "Main Campus",
        ID_Image: "default-id.png",
        Country: "Malaysia",
        Passport: null,
        Roomnum: "R-232",
        Vcode: null,
        Isverified: 1,
      },
    ];

    // Remove existing records if they exist
    await studentinfo.destroy({
      where: { stu_id: students.map((s) => s.stu_id) },
    });

    // Insert new records
    await studentinfo.bulkCreate(students, { individualHooks: true });

    console.log("🎉 2 student records seeded successfully!");
  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedTwoStudents();