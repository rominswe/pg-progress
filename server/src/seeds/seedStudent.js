import dotenv from "dotenv";
import path from "node:path";
import { sequelize, studentinfo } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

// Programs grouped by level
const PROGRAM_POOLS = {
  postgraduate: [
    { code: "MBMR", dep: "SBSS" },
    { code: "MER", dep: "SEHS" },
    { code: "DPBM", dep: "SBSS" },
    { code: "DPE", dep: "SEHS" },
  ],
  other: [
    { code: "BBA", dep: "SBSS" },
    { code: "BBAHRM", dep: "SBSS" },
    { code: "BBAM", dep: "SBSS" },
    { code: "BE", dep: "SBSS" },
    { code: "BFIF", dep: "SBSS" },
    { code: "BPIR", dep: "SBSS" },
    { code: "BSD", dep: "SBSS" },
    { code: "CS", dep: "SCI" },
    { code: "BECE", dep: "SEHS" },
    { code: "BEE", dep: "SEHS" },
    { code: "BMC", dep: "SEHS" },
    { code: "CFA", dep: "CFGS" },
    { code: "CFC", dep: "CFGS" },
    { code: "LC", dep: "CFL" },
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedStudInfo() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const students = [];
    const TOTAL = 200;
    const POSTGRAD_COUNT = 120;

    for (let i = 1; i <= TOTAL; i++) {
      const pool =
        i <= POSTGRAD_COUNT
          ? PROGRAM_POOLS.postgraduate
          : PROGRAM_POOLS.other;

      const program = pickRandom(pool);
      const stuId = `AIU${String(i).padStart(6, "0")}`;

      students.push({
        stu_id: stuId,
        Dep_Code: program.dep,
        Prog_Code: program.code,
        FirstName: `Student${i}`,
        LastName: "AIU",
        EmailId: `student${i}@aiu.edu.my`,
        Password: "Student@123", // hashed by hook
        Gender: i % 2 === 0 ? "Male" : "Female",
        Dob: "2001-01-01",
        Acad_Year: "2024/2025",
        Exp_GraduatedYear:
          program.code.startsWith("D") ? "2029" :
          program.code.startsWith("M") ? "2027" : "2026",
        Address: `${program.dep} Hostel`,
        Av_leave: "30",
        Phonenumber: `01${Math.floor(100000000 + Math.random() * 900000000)}`,
        Status: 1,
        RegDate: new Date(),
        role: "STU",
        location: "Main Campus",
        ID_Image: "default-id.png",
        Country: "Malaysia",
        Passport: null,
        Roomnum: `R-${200 + i}`,
        Vcode: null,
        Isverified: 1,
      });
    }

    // Safe re-run cleanup
    await studentinfo.destroy({
      where: { stu_id: students.map(s => s.stu_id) },
    });

    await studentinfo.bulkCreate(students, {
      individualHooks: true,
  });
    console.log("🎉 200 student records seeded (postgraduate-heavy)");

  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedStudInfo();