import mysql from 'mysql2/promise';

async function checkStudents() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root',
            database: 'aiu_pg_progress'
        });

        console.log('✅ Connected to database\n');

        // Check master_stu table
        const [students] = await conn.query(`
            SELECT 
                master_id,
                FirstName,
                LastName,
                EmailId,
                Dep_Code,
                Prog_Code
            FROM master_stu
            ORDER BY master_id
            LIMIT 10
        `);

        console.log('👨‍🎓 Students in master_stu table:\n');
        students.forEach((s, i) => {
            console.log(`${i + 1}. ${s.FirstName} ${s.LastName} (${s.master_id})`);
            console.log(`   Email: ${s.EmailId}`);
            console.log(`   Department: ${s.Dep_Code} | Program: ${s.Prog_Code}`);
            console.log('');
        });

        const [countResult] = await conn.query('SELECT COUNT(*) as count FROM master_stu');
        console.log(`📊 Total Students: ${countResult[0].count}`);

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkStudents();
