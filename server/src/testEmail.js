import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

import { sendVerificationEmail } from "./utils/loginEmail.js";

const fakeUser = {
  FirstName: "John",
  LastName: "Doe",
  EmailId: "ro.swe@student.aiu.edu.my" // you can send to yourself
};

const fakeToken = "testtoken123";
const fakeTempPassword = "Temp1234";
const roleId = "STU"; // any role

(async () => {
  try {
    await sendVerificationEmail(fakeUser, fakeToken, fakeTempPassword, roleId);
    console.log("✅ Test email sent successfully!");
  } catch (err) {
    console.error("❌ Test email failed:", err);
  }
})();