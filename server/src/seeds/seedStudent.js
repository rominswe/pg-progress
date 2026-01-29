import dotenv from "dotenv";
import path from "node:path";
import { sequelize, studinfo } from "../config/config.js";

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

// --------------------
// ✅ Unique + gender-aware name generator (same idea as emp seed)
// --------------------
const MALE_FIRST_NAMES = [
  "Ahmad","Aiman","Akmal","Alif","Amir","Anas","Arif","Ashraf","Asyraf","Azlan",
  "Daniel","Danish","Ehsan","Faiz","Farhan","Faris","Fikri","Firdaus","Hafiz","Hakim",
  "Haikal","Haris","Hilmi","Irfan","Imran","Iskandar","Izzat","Johan","Kamal","Khairol",
  "Khairul","Luqman","Malik","Mikail","Muhammad","Nabil","Nazmi","Nizar","Rafi","Raihan",
  "Ridzuan","Saif","Shafiq","Syafiq","Syahmi","Taufiq","Umar","Wafi","Yusuf","Zaki",
  "Zul","Zulhilmi","Zulkifli","Zulqarnain"
];

const FEMALE_FIRST_NAMES = [
  "Aina","Aini","Aisha","Aisyah","Alia","Alya","Amirah","Anis","Aqilah","Arina",
  "Atikah","Balqis","Dania","Diyana","Fatin","Farah","Hana","Hannah","Irdina","Izzah",
  "Jannah","Khairunnisa","Laila","Liyana","Maisarah","Marissa","Maryam","Nabila","Nadia","Nadiah",
  "Najwa","Natasha","Nurin","Nurul","Puteri","Qaisara","Rania","Sabrina","Safiya","Sarah",
  "Siti","Sofea","Syahirah","Umairah","Wardah","Yasmin","Zahra","Zainab","Zulaikha","Zurin"
];

const SURNAMES = [
  "Doe","Smith","Tan","Lim","Lee","Ng","Chan","Wong","Cheong","Ong",
  "Kaur","Singh","Khan","Hassan","Ismail","Ibrahim","Rahman","Aziz","Hamzah","Yusof",
  "Zainal","Kamal","Latif","Salleh","Basri","Saad","Sulaiman","Harun","Roslan","Nor"
];

const FATHER_NAMES = [
  "Ahmad","Ali","Hassan","Ibrahim","Ismail","Kamal","Latif","Rahman","Salleh","Yusof",
  "Zainal","Hamzah","Harun","Saad","Aziz","Basri","Sulaiman","Nor","Roslan","Khan"
];

function makeNameGenerator({ gender, totalNeeded, globalUsed }) {
  const firstPool = gender === "Male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
  const patronymics = FATHER_NAMES.map(n =>
    gender === "Male" ? `Bin ${n}` : `Binti ${n}`
  );
  const lastPool = [...SURNAMES, ...patronymics];

  let fi = 0;
  let li = 0;

  return function nextUniqueName() {
    const maxCombos = firstPool.length * lastPool.length;
    if (totalNeeded > maxCombos) {
      throw new Error(
        `Not enough unique name combinations for ${gender}. Needed=${totalNeeded}, available=${maxCombos}`
      );
    }

    while (true) {
      const first = firstPool[fi];
      const last = lastPool[li];
      const full = `${first} ${last}`;

      li++;
      if (li >= lastPool.length) {
        li = 0;
        fi++;
        if (fi >= firstPool.length) fi = 0;
      }

      if (!globalUsed.has(full)) {
        globalUsed.add(full);
        return { FirstName: first, LastName: last };
      }
    }
  };
}

async function seedStudInfo() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const students = [];
    const TOTAL = 200;
    const POSTGRAD_COUNT = 120;

    const usedFullNames = new Set();
    const maleNeeded = Math.floor(TOTAL / 2);
    const femaleNeeded = TOTAL - maleNeeded;

    const nextMaleName = makeNameGenerator({
      gender: "Male",
      totalNeeded: maleNeeded,
      globalUsed: usedFullNames,
    });

    const nextFemaleName = makeNameGenerator({
      gender: "Female",
      totalNeeded: femaleNeeded,
      globalUsed: usedFullNames,
    });

    for (let i = 1; i <= TOTAL; i++) {
      const pool =
        i <= POSTGRAD_COUNT ? PROGRAM_POOLS.postgraduate : PROGRAM_POOLS.other;

      const program = pickRandom(pool);
      const stuId = `AIU${String(i).padStart(6, "0")}`;

      const gender = i % 2 === 0 ? "Male" : "Female";
      const name = gender === "Male" ? nextMaleName() : nextFemaleName();

      students.push({
        stu_id: stuId,
        Dep_Code: program.dep,
        Prog_Code: program.code,
        FirstName: name.FirstName,
        LastName: name.LastName,
        EmailId: `student${i}@aiu.edu.my`,
        Password: "Student@123", // hashed by hook
        Gender: gender,
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

    await studinfo.destroy({
      where: { stu_id: students.map(s => s.stu_id) },
    });

    await studinfo.bulkCreate(students, {
      individualHooks: true,
    });

    console.log("🎉 200 student records seeded with unique, gender-aware names");
  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedStudInfo();