import mysql from 'mysql2/promise';

async function testValidation() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root',
            database: 'aiu_pg_progress'
        });

        console.log('╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║          THESIS DRAFT VALIDATION TEST                                 ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

        // Get all students
        const [students] = await conn.query('SELECT master_id, FirstName, LastName FROM master_stu');

        console.log('📊 STUDENTS IN DATABASE:\n');
        for (const student of students) {
            console.log(`Student: ${student.FirstName} ${student.LastName} (${student.master_id})`);

            // Check if they have thesis draft
            const [thesisDraft] = await conn.query(
                `SELECT doc_up_id, document_name, status, uploaded_at 
                 FROM documents_uploads 
                 WHERE master_id = ? AND document_type = 'Thesis Draft'`,
                [student.master_id]
            );

            if (thesisDraft.length > 0) {
                console.log(`  ✅ HAS THESIS DRAFT: ${thesisDraft[0].document_name}`);
                console.log(`     Status: ${thesisDraft[0].status}`);
                console.log(`     Uploaded: ${thesisDraft[0].uploaded_at}`);
                console.log(`     → CAN BE EVALUATED ✓`);
            } else {
                console.log(`  ❌ NO THESIS DRAFT SUBMITTED`);
                console.log(`     → CANNOT BE EVALUATED ✗`);
            }
            console.log('');
        }

        // Summary
        const [withThesis] = await conn.query(`
            SELECT COUNT(DISTINCT master_id) as count 
            FROM documents_uploads 
            WHERE document_type = 'Thesis Draft'
        `);

        const [totalStudents] = await conn.query('SELECT COUNT(*) as count FROM master_stu');

        console.log('\n═══════════════════════════════════════════════════════════════════════');
        console.log('SUMMARY:');
        console.log(`  Total Students: ${totalStudents[0].count}`);
        console.log(`  Students with Thesis Draft: ${withThesis[0].count}`);
        console.log(`  Students ready for evaluation: ${withThesis[0].count}`);
        console.log(`  Students NOT ready: ${totalStudents[0].count - withThesis[0].count}`);
        console.log('═══════════════════════════════════════════════════════════════════════\n');

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testValidation();
