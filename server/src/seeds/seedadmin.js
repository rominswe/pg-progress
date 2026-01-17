import dotenv from "dotenv";
import path from "node:path";
import { sequelize, empinfo, pgstaffinfo, pgstaff_roles, roles } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const ADMIN_EMAIL = "admin@aiu.edu.my";
    const ADMIN_PASSWORD = "Admin@123";
    const EMP_ID = "EMP-CGS-001";
    const PG_STAFF_ID = "CGSADM001"; // Unified ID format
    const ROLE_ID = "CGSADM";
    const DEP_CODE = "CGS";

    // 1. Verify Role Existence
    const adminRole = await roles.findByPk(ROLE_ID);
    if (!adminRole) {
      console.warn(`⚠️ Role ${ROLE_ID} not found. Ensure your roles table is seeded first.`);
    }

    // 2. Clean up existing records to allow re-seeding
    await pgstaff_roles.destroy({ where: { pg_staff_id: PG_STAFF_ID } });
    await pgstaffinfo.destroy({ where: { EmailId: ADMIN_EMAIL } });
    await empinfo.destroy({ where: { EmailId: ADMIN_EMAIL } });

    console.log("Cleaning old admin records...");

    // 3. Create record in University Source (empinfo)
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
      Status: 1, // int as per your DESCRIBE
      role: ROLE_ID,
      location: "Main Campus",
      Country: "Malaysia",
      Isverified: true
    });

    // 4. Create record in Postgrad System (pgstaffinfo)
    await pgstaffinfo.create({
      pg_staff_id: PG_STAFF_ID,
      emp_id: emp.emp_id,
      FirstName: emp.FirstName,
      LastName: emp.LastName,
      EmailId: ADMIN_EMAIL,
      Password: ADMIN_PASSWORD,
      Gender: emp.Gender,
      Dob: emp.Dob,
      Address: emp.Address,
      Phonenumber: emp.Phonenumber,
      Status: "Active", // Enum: Active, Inactive, Pending
      RegDate: new Date(),
      Affiliation: "Albukhary International University",
      Country: "Malaysia",
      EndDate: new Date("2038-01-19T03:14:07Z"),
      IsVerified: true, // tinyint(1)
      // Note: Academic_Rank and Honorifics can be null for CGSADM
    });

    await pgstaff_roles.create({
      pg_staff_id: PG_STAFF_ID,
      role_id: ROLE_ID,
      role_level: null,
      employment_type: "Internal",
      Dep_Code: DEP_CODE,
    });

    console.log("---");
    console.log("🎉 CGS Admin seeded successfully in pgstaffinfo!");
    console.log("📧 Email:", ADMIN_EMAIL);
    console.log("🔑 Password:", ADMIN_PASSWORD);
    console.log("🆔 PG ID:", PG_STAFF_ID);

  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedAdmin();