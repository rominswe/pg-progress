import mysql from 'mysql2/promise';

async function checkEvaluations() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root',
            database: 'aiu_pg_progress'
        });

        console.log('✅ Connected to database\n');

        // Count total evaluations
        const [countResult] = await conn.query('SELECT COUNT(*) as count FROM defense_evaluations');
        console.log(`📊 Total Evaluations: ${countResult[0].count}\n`);

        // Get all evaluations
        const [evaluations] = await conn.query(`
            SELECT 
                evaluation_id,
                student_id,
                student_name,
                supervisor_name,
                defense_type,
                semester,
                evaluation_date,
                created_at
            FROM defense_evaluations
            ORDER BY created_at DESC
        `);

        console.log('📋 Evaluation Records:\n');
        evaluations.forEach((e, i) => {
            console.log(`${i + 1}. ID: ${e.evaluation_id}`);
            console.log(`   Student: ${e.student_name} (${e.student_id})`);
            console.log(`   Supervisor: ${e.supervisor_name}`);
            console.log(`   Type: ${e.defense_type}`);
            console.log(`   Semester: ${e.semester}`);
            console.log(`   Evaluation Date: ${e.evaluation_date}`);
            console.log(`   Created At: ${e.created_at}`);
            console.log('');
        });

        // Check if these students exist in master_stu table
        console.log('🔍 Checking if students exist in master_stu table:\n');
        for (const e of evaluations) {
            const [student] = await conn.query(
                'SELECT master_id, FirstName, LastName FROM master_stu WHERE master_id = ?',
                [e.student_id]
            );
            if (student.length > 0) {
                console.log(`✅ ${e.student_id} exists: ${student[0].FirstName} ${student[0].LastName}`);
            } else {
                console.log(`❌ ${e.student_id} NOT FOUND in master_stu table`);
            }
        }

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkEvaluations();
