import { examiner, visiting_staff, role } from "./src/config/config.js";

async function testExa() {
    try {
        const email = 'examiner@aiu.edu.my';
        console.log(`Testing with email: ${email}`);

        const user = await examiner.findOne({
            where: { EmailId: email },
            include: [{ model: role, as: 'role' }]
        });

        if (user) {
            console.log("Found in examiner table:");
            console.log("- ID:", user.examiner_id || user.emp_id);
            console.log("- Role:", user.role?.role_id);
            console.log("- Status:", user.Status);
        } else {
            console.log("NOT found in examiner table. Checking visiting_staff...");
            const vUser = await visiting_staff.findOne({
                where: { EmailId: email },
                include: [{ model: role, as: 'role' }]
            });
            if (vUser) {
                console.log("Found in visiting_staff table:");
                console.log("- ID:", vUser.vs_id || vUser.emp_id);
                console.log("- Role:", vUser.role?.role_id);
            } else {
                console.log("NOT found in any table.");
            }
        }
    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        process.exit();
    }
}

testExa();
