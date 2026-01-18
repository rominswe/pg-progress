import dotenv from "dotenv";
import path from "node:path";
import { sequelize, empinfo } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const ROLES = [
  { code: "SUV", label: "Supervisor" },
  { code: "CGSS", label: "CGS Staff" },
  { code: "EXA", label: "Examiner" },
];

const DEPARTMENTS = ["SCI", "SBSS", "CGS", "SEHS"];

async function seedEmpInfo() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const employees = [];

    for (let i = 1; i <= 50; i++) {
      const role = ROLES[i % ROLES.length];
      const dep = DEPARTMENTS[i % DEPARTMENTS.length];

      const empId = `AIU${String(i).padStart(6, "0")}`;

      employees.push({
        emp_id: empId,
        FirstName: `User${i}`,
        LastName: role.label,
        EmailId: `user${i}.${role.code.toLowerCase()}@aiu.edu.my`,
        Password: "Password@123", // hashed by model hook
        Gender: i % 2 === 0 ? "Male" : "Female",
        Dob: "1992-01-01",
        Dep_Code: dep,
        Address: `${dep} Building`,
        Phonenumber: `01${Math.floor(100000000 + Math.random() * 900000000)}`,
        Status: 1,
        role: role.code,
        location: "Main Campus",
        Country: "Malaysia",
        Passport: null,
        Vcode: null,
        Isverified: 1,
      });
    }

    // Optional cleanup (safe re-run)
    await empinfo.destroy({
      where: {
        emp_id: employees.map(e => e.emp_id),
      },
    });

    await empinfo.bulkCreate(employees, {
        individualHooks: true, // 🔐 run bcrypt hooks per record
    });
    console.log("🎉 50 empinfo records seeded with AIU IDs successfully");

  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedEmpInfo();