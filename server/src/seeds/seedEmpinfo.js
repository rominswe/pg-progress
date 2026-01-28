import dotenv from "dotenv";
import path from "node:path";
import { sequelize, empinfo } from "../config/config.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const ROLES = [
  { code: "SUV", label: "Supervisor" },
  { code: "CGSS", label: "CGS Staff" },
  { code: "EXA", label: "Examiner" },
  { code: "SCID", label: "School Of Computing and Informatics Dean" },
  { code: "SBSSD", label: "School Of Business and Social Sciences Dean" },
  { code: "SEHSD", label: "School Of Education and Humanities Dean" },
];

const DEPARTMENTS = ["SCI", "SBSS", "CGS", "SEHS"];

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

// Neutral family surnames (OK for any gender)
const SURNAMES = [
  "Doe","Smith","Tan","Lim","Lee","Ng","Chan","Wong","Cheong","Ong",
  "Kaur","Singh","Khan","Hassan","Ismail","Ibrahim","Rahman","Aziz","Hamzah","Yusof",
  "Zainal","Kamal","Latif","Salleh","Basri","Saad","Sulaiman","Harun","Roslan","Nor"
];

// Father names used to build Bin/Binti patronymics
const FATHER_NAMES = [
  "Ahmad","Ali","Hassan","Ibrahim","Ismail","Kamal","Latif","Rahman","Salleh","Yusof",
  "Zainal","Hamzah","Harun","Saad","Aziz","Basri","Sulaiman","Nor","Roslan","Khan"
];

function makeNameGenerator({ gender, totalNeeded, globalUsed }) {
  const firstPool = gender === "Male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;

  // Build last name pool for this gender: surnames + Bin/Binti options
  const patronymics = FATHER_NAMES.map(n =>
    gender === "Male" ? `Bin ${n}` : `Binti ${n}`
  );
  const lastPool = [...SURNAMES, ...patronymics];

  // Deterministic-ish cartesian walk (no repeats) + uniqueness guard
  let fi = 0;
  let li = 0;

  return function nextUniqueName() {
    // Safety: Ensure we can supply enough unique combos
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

      // advance indices (cartesian product iteration)
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

async function seedEmpInfo() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const employees = [];
    const TOTAL = 500;

    // One shared set so no duplicates across male/female pools too
    const usedFullNames = new Set();

    // Count how many of each gender we’ll need based on your parity rule
    const maleNeeded = Math.floor(TOTAL / 2);        // i even
    const femaleNeeded = TOTAL - maleNeeded;         // i odd

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
      const role = ROLES[i % ROLES.length];
      const dep = DEPARTMENTS[i % DEPARTMENTS.length];

      const empId = `AIU${String(i).padStart(6, "0")}`;
      const gender = i % 2 === 0 ? "Male" : "Female";

      const name =
        gender === "Male" ? nextMaleName() : nextFemaleName();

      employees.push({
        emp_id: empId,
        FirstName: name.FirstName,
        LastName: name.LastName,
        EmailId: `user${i}.${role.code.toLowerCase()}@aiu.edu.my`,
        Password: "Password@123", // hashed by model hook
        Gender: gender,
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

    await empinfo.destroy({
      where: { emp_id: employees.map(e => e.emp_id) },
    });

    await empinfo.bulkCreate(employees, {
      individualHooks: true,
    });

    console.log("🎉 500 empinfo records seeded with unique, gender-aware names");
  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedEmpInfo();
