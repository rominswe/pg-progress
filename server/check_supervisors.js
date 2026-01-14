import mysql from 'mysql2/promise';

async function checkSupervisors() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root',
            database: 'aiu_pg_progress'
        });

        console.log('✅ Connected to database\n');

        // Check supervisors
        console.log('👨‍🏫 Checking Supervisor Records:\n');
        const [supervisors] = await conn.query(`
            SELECT 
                sup_id,
                FirstName,
                LastName,
                EmailId,
                Dep_Code
            FROM supervisor
            ORDER BY sup_id
        `);

        supervisors.forEach((s, i) => {
            console.log(`${i + 1}. ${s.FirstName} ${s.LastName} (${s.sup_id})`);
            console.log(`   Email: ${s.EmailId}`);
            console.log(`   Department: ${s.Dep_Code}`);
            console.log('');
        });

        // Check if "Dr Zoe Lay" and "Dr Zoe Gyi" exist
        console.log('🔍 Searching for "Dr Zoe Lay" and "Dr Zoe Gyi":\n');

        const [zoeLayResults] = await conn.query(
            "SELECT * FROM supervisor WHERE FirstName LIKE '%Zoe%' AND LastName LIKE '%Lay%'"
        );
        const [zoeGyiResults] = await conn.query(
            "SELECT * FROM supervisor WHERE FirstName LIKE '%Zoe%' AND LastName LIKE '%Gyi%'"
        );

        if (zoeLayResults.length > 0) {
            console.log('✅ Found Dr Zoe Lay:', zoeLayResults[0]);
        } else {
            console.log('❌ Dr Zoe Lay NOT FOUND in supervisor table');
        }

        if (zoeGyiResults.length > 0) {
            console.log('✅ Found Dr Zoe Gyi:', zoeGyiResults[0]);
        } else {
            console.log('❌ Dr Zoe Gyi NOT FOUND in supervisor table');
        }

        console.log('\n📊 Total Supervisors:', supervisors.length);

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkSupervisors();
