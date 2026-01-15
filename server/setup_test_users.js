import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { sequelize } from './src/config/config.js';
import initModels from './src/models/init-models.js';

const setupTestUsers = async () => {
    try {
        await sequelize.authenticate();
        const models = initModels(sequelize);
        console.log("Setting up test users...");

        const passwordHash = await bcrypt.hash('123456', 10);

        // 1. Setup Examiner
        let examiner = await models.examiner.findOne();
        if (examiner) {
            examiner.Password = passwordHash;
            await examiner.save();
            console.log(`EXAMINER: ${examiner.EmailId} / 123456`);
        } else {
            console.error("No examiner found!");
        }

        // 2. Setup Student (same dep)
        if (examiner) {
            let student = await models.master_stu.findOne({
                where: { Dep_Code: examiner.Dep_Code },
                include: [{ model: models.studinfo, as: 'stu' }]
            });

            if (student && student.stu) {
                // Update password in studinfo
                student.stu.Password = passwordHash;
                await student.stu.save();
                console.log(`STUDENT: ${student.stu.EmailId} / 123456`);

                // Ensure Document
                const [doc, created] = await models.documents_uploads.findOrCreate({
                    where: {
                        master_id: student.master_id,
                        document_type: 'Research Proposal'
                    },
                    defaults: {
                        uploaded_by: student.master_id,
                        role_id: 'STU',
                        document_name: 'Test_Proposal.pdf',
                        document_type: 'Research Proposal',
                        file_path: 'uploads/test_proposal.pdf',
                        file_size_kb: 1000,
                        status: 'Pending',
                        Dep_Code: examiner.Dep_Code
                    }
                });
                console.log(`Student Document Status: ${created ? 'Created' : 'Exists'}`);

            } else {
                console.error("No student found in examiner department!");
            }
        }

        // 3. Setup Supervisor
        let supervisor = await models.supervisor.findOne();
        if (supervisor) {
            // Supervisor might be in empinfo or supervisor table depending on auth. 
            // Usually auth checks empinfo or specific table. The models show Supervisor has Password field?
            // Let's check model. 
            // Supervisor model definition was not fully viewed, but usually it links to EmpInfo.
            // Let's assume Supervisor table has Password or EmpInfo has it.
            // Based on `examiner` having Password, `supervisor` likely does too.
            if (supervisor.Password !== undefined) {
                supervisor.Password = passwordHash;
                await supervisor.save();
            }
            // Also check EmpInfo if linked
            if (supervisor.emp_id) {
                const emp = await models.empinfo.findByPk(supervisor.emp_id);
                if (emp) {
                    emp.Password = passwordHash;
                    await emp.save();
                }
            }
            console.log(`SUPERVISOR: ${supervisor.EmailId} / 123456`);
        }


        const credentials = {
            examiner: examiner ? examiner.EmailId : null,
            student: (student && student.stu) ? student.stu.EmailId : null,
            supervisor: supervisor ? supervisor.EmailId : null,
            password: '123456'
        };


        const { default: fs } = await import('fs');
        fs.writeFileSync('test_creds.json', JSON.stringify(credentials, null, 2));
        console.log("Credentials saved to test_creds.json");

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

setupTestUsers();
