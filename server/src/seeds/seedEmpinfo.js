import dotenv from "dotenv";
import path from "node:path";
import { sequelize, empinfo, cgs, supervisor, examiner } from "../config/config.js";

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
    const supervisors = [];
    const examiners = [];
    const cgsStaff = [];

    // Cleanup existing data
    await examiner.destroy({ where: {} }); // Delete children first due to FK? Usually safer. 
    // Actually if cascade isn't set, might be tricky. But let's try standard destroy.
    await supervisor.destroy({ where: {} });
    await cgs.destroy({ where: {} });

    // We can't easily destroy empinfo if it has constrained children, but let's assume empty state or handle errors silently.
    // For now, let's just create new ones or update if exists?
    // Using simple destroy for dev env.
    await empinfo.destroy({ where: {} });


    for (let i = 1; i <= 50; i++) {
      const role = ROLES[i % ROLES.length];
      const dep = DEPARTMENTS[i % DEPARTMENTS.length];

      const empId = `AIU${String(i).padStart(6, "0")}`;
      const commonData = {
        FirstName: `User${i}`,
        LastName: role.label,
        EmailId: `user${i}.${role.code.toLowerCase()}@aiu.edu.my`,
        Password: "Password@123", // hashed by model hook
        Phonenumber: `01${Math.floor(100000000 + Math.random() * 900000000)}`,
        role_id: role.code,
        Dep_Code: dep,
        Status: "Active", // Enum value
        IsVerified: 1,
        StartDate: new Date("2024-01-01"),
        EndDate: new Date("2030-12-31"),
        MustChangePassword: 1
      };

      employees.push({
        ...commonData,
        emp_id: empId,
        Gender: i % 2 === 0 ? "Male" : "Female",
        Dob: "1992-01-01",
        Address: `${dep} Building`,
        Status: 1, // empinfo uses integer status? checking model...
        // empinfo model status is integer? let's check Step 556 line 39: Status: 1.
        role: role.code,
        location: "Main Campus",
        Country: "Malaysia",
        Passport: null,
        Vcode: null,
      });

      // Specialized tables
      const specializedData = {
        ...commonData,
        emp_id: empId,
        Status: "Active" // Enum for specialized tables
      };

      if (role.code === "SUV") {
        supervisors.push({ ...specializedData, sup_id: `SUV${String(i).padStart(6, '0')}` });
      } else if (role.code === "EXA") {
        examiners.push({ ...specializedData, examiner_id: `EXA${String(i).padStart(6, '0')}` });
      } else if (role.code === "CGSS") {
        cgsStaff.push({ ...specializedData, cgs_id: `CGS${String(i).padStart(6, '0')}` });
      }
    }

    // --- ADD CUSTOM DEMO EXAMINER ---
    const demoEmpId = "AIU999999";
    const demoEmail = "examiner@aiu.edu.my";
    const demoPass = "examiner@123";

    employees.push({
      emp_id: demoEmpId,
      FirstName: "Demo",
      LastName: "Examiner",
      EmailId: demoEmail,
      Password: demoPass,
      Phonenumber: "0123456789",
      role_id: "EXA",
      Dep_Code: "CGS",
      Status: 1,
      IsVerified: 1,
      StartDate: new Date(),
      EndDate: new Date("2030-12-31"),
      MustChangePassword: 0,
      Gender: "Male",
      Dob: "1980-01-01",
      Address: "Main Office",
      location: "Main Campus",
      Country: "Malaysia",
    });

    examiners.push({
      examiner_id: "EXA999999",
      emp_id: demoEmpId,
      FirstName: "Demo",
      LastName: "Examiner",
      EmailId: demoEmail,
      Password: demoPass,
      Phonenumber: "0123456789",
      role_id: "EXA",
      Dep_Code: "CGS",
      Status: "Active",
      IsVerified: 1,
      StartDate: new Date(),
      EndDate: new Date("2030-12-31"),
      MustChangePassword: 0
    });
    // --------------------------------

    // 1. Create EmpInfo Parents
    await empinfo.bulkCreate(employees, { individualHooks: true });
    console.log(`✅ Seeded ${employees.length} EmpInfo records`);

    // 2. Create Specialized Children
    if (supervisors.length) await supervisor.bulkCreate(supervisors, { individualHooks: true });
    if (examiners.length) await examiner.bulkCreate(examiners, { individualHooks: true });
    if (cgsStaff.length) await cgs.bulkCreate(cgsStaff, { individualHooks: true });

    console.log(`✅ Seeded: ${supervisors.length} Supervisors, ${examiners.length} Examiners, ${cgsStaff.length} CGS Staff`);

  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedEmpInfo();