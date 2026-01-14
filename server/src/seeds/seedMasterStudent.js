import dotenv from "dotenv";
import path from "node:path";
import {
    sequelize,
    studentinfo,
    master_stu,
    role,
    programInfo,
    tbldepartments
} from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const PROGRAMS = [
    { code: "MBMR", name: "Master of Business Management", dep: "SBSS" },
    { code: "MER", name: "Master of Engineering Research", dep: "SEHS" },
    { code: "DPBM", name: "Doctor of Philosophy (Business)", dep: "SBSS" },
    { code: "DPE", name: "Doctor of Philosophy (Engineering)", dep: "SEHS" },
];

async function seedMasterData() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected for Master Student seeding");

        // 1. Ensure Dependencies
        // a. Programs
        for (const prog of PROGRAMS) {
            await programInfo.findOrCreate({
                where: { Prog_Code: prog.code },
                defaults: {
                    Prog_Name: prog.name,
                    Dep_Code: prog.dep,
                    Prog_Level: prog.code.startsWith('D') ? "PhD" : "Master",
                    Dur_Sem: 4
                }
            });
        }
        console.log("✅ Programs synced");

        // b. Students (studentinfo) - Ensure specific test candidates exist
        const CANDIDATES = [
            { id: "AIU23001", name: "Ahmad Albab", dep: "SBSS", prog: "MBMR" },
            { id: "AIU23002", name: "Siti Sarah", dep: "SEHS", prog: "MER" },
            { id: "AIU23003", name: "David Teoh", dep: "SBSS", prog: "DPBM" },
        ];

        for (const cand of CANDIDATES) {
            // Check studentinfo
            // Note: studentinfo might already exist from seedStudent.js, but we want guarantees
            const [stu, created] = await studentinfo.findOrCreate({
                where: { stu_id: cand.id },
                defaults: {
                    FirstName: cand.name.split(' ')[0],
                    LastName: cand.name.split(' ').slice(1).join(' '),
                    EmailId: `${cand.id.toLowerCase()}@aiu.edu.my`,
                    Password: 'Student@123',
                    Dep_Code: cand.dep,
                    Prog_Code: cand.prog,
                    Status: 1,
                    role: 'STU',
                    RegDate: new Date(),
                    Isverified: 1,
                    // Required fields for studinfo
                    Gender: "Male",
                    Dob: "2000-01-01",
                    Acad_Year: "2024/2025",
                    Exp_GraduatedYear: "2026",
                    Address: "AIU Hostel",
                    Av_leave: "30",
                    Phonenumber: "0123456789",
                    location: "Campus",
                    ID_Image: "default.png"
                }
            });

            // Check master_stu
            await master_stu.findOrCreate({
                where: { master_id: cand.id }, // Same ID for simplicity
                defaults: {
                    stu_id: cand.id,
                    FirstName: stu.FirstName,
                    LastName: stu.LastName,
                    EmailId: stu.EmailId,
                    Password: stu.Password,
                    Dep_Code: cand.dep,
                    Prog_Code: cand.prog,
                    role_id: 'STU',
                    Status: 'Active',
                    StartDate: new Date(),
                    EndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
                    IsVerified: 1,
                    MustChangePassword: 0
                }
            });
        }

        console.log("🎉 Master Students seeded!");

    } catch (err) {
        console.error("❌ Seeding failed:", err);
    } finally {
        await sequelize.close();
    }
}

seedMasterData();
