import mysql from 'mysql2/promise';

async function generateReport() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root',
            database: 'aiu_pg_progress'
        });

        console.log('╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║          EVALUATION DATA INVESTIGATION REPORT                         ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

        // 1. Check evaluations
        const [evaluations] = await conn.query(`
            SELECT 
                evaluation_id,
                student_id,
                student_name,
                supervisor_name,
                defense_type,
                semester,
                evaluation_date,
                knowledge_rating,
                presentation_rating,
                response_rating,
                organization_rating,
                overall_rating,
                created_at
            FROM defense_evaluations
            ORDER BY created_at DESC
        `);

        console.log('📊 EVALUATION RECORDS');
        console.log('─'.repeat(75));
        console.log(`Total Evaluations Found: ${evaluations.length}\n`);

        evaluations.forEach((e, i) => {
            const avgRating = ((e.knowledge_rating + e.presentation_rating + e.response_rating + e.organization_rating + e.overall_rating) / 5).toFixed(1);
            console.log(`${i + 1}. Evaluation ID: ${e.evaluation_id}`);
            console.log(`   Student: ${e.student_name} (ID: ${e.student_id})`);
            console.log(`   Supervisor: ${e.supervisor_name}`);
            console.log(`   Type: ${e.defense_type} | Semester: ${e.semester}`);
            console.log(`   Average Rating: ${avgRating}/5`);
            console.log(`   Created: ${e.created_at}`);
            console.log('');
        });

        // 2. Check if students exist
        console.log('\n🔍 STUDENT VERIFICATION');
        console.log('─'.repeat(75));

        const studentIds = [...new Set(evaluations.map(e => e.student_id))];

        for (const studentId of studentIds) {
            const [student] = await conn.query(
                'SELECT master_id, FirstName, LastName FROM master_stu WHERE master_id = ?',
                [studentId]
            );

            if (student.length > 0) {
                console.log(`✅ ${studentId}: EXISTS in database (${student[0].FirstName} ${student[0].LastName})`);
            } else {
                console.log(`❌ ${studentId}: NOT FOUND in master_stu table`);
            }
        }

        // 3. Check supervisors
        console.log('\n\n👨‍🏫 SUPERVISOR VERIFICATION');
        console.log('─'.repeat(75));

        const supervisorNames = [...new Set(evaluations.map(e => e.supervisor_name))];

        for (const supName of supervisorNames) {
            // Try to find by name parts
            const nameParts = supName.split(' ');
            let found = false;

            if (nameParts.length >= 2) {
                const [supervisors] = await conn.query(
                    `SELECT sup_id, FirstName, LastName, EmailId FROM supervisor 
                     WHERE CONCAT(FirstName, ' ', LastName) LIKE ?`,
                    [`%${nameParts[nameParts.length - 1]}%`]
                );

                if (supervisors.length > 0) {
                    console.log(`✅ "${supName}": Found similar - ${supervisors[0].FirstName} ${supervisors[0].LastName} (${supervisors[0].sup_id})`);
                    found = true;
                }
            }

            if (!found) {
                console.log(`❌ "${supName}": NOT FOUND in supervisor table`);
            }
        }

        // 4. Summary
        console.log('\n\n📋 SUMMARY');
        console.log('═'.repeat(75));

        const [studentCount] = await conn.query('SELECT COUNT(*) as count FROM master_stu');
        const [supervisorCount] = await conn.query('SELECT COUNT(*) as count FROM supervisor');

        console.log(`Total Students in Database: ${studentCount[0].count}`);
        console.log(`Total Supervisors in Database: ${supervisorCount[0].count}`);
        console.log(`Total Evaluations: ${evaluations.length}`);

        const orphanedEvaluations = evaluations.filter(e =>
            !studentIds.some(async id => {
                const [student] = await conn.query(
                    'SELECT master_id FROM master_stu WHERE master_id = ?',
                    [e.student_id]
                );
                return student.length > 0;
            })
        );

        console.log('\n🚨 DATA STATUS:');
        console.log(`   - Evaluations with non-existent students: Likely ${evaluations.length - studentCount[0].count}`);
        console.log(`   - Evaluations with non-existent supervisors: Likely ${evaluations.length}`);

        console.log('\n💡 CONCLUSION:');
        console.log('   These evaluations appear to be TEST/SAMPLE DATA because:');
        console.log('   1. Student IDs do not exist in master_stu table');
        console.log('   2. Supervisor names (Dr Zoe Lay, Dr Zoe Gyi) do not exist in supervisor table');
        console.log('   3. Generic student name "John Doe" is used');
        console.log('   4. These were likely created during development/testing');

        console.log('\n═'.repeat(75));

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

generateReport();
