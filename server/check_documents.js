import mysql from 'mysql2/promise';

async function checkDocuments() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root',
            database: 'aiu_pg_progress'
        });

        console.log('📄 DOCUMENT TYPES IN SYSTEM:\n');
        const [types] = await conn.query('SELECT DISTINCT document_type FROM documents_uploads');
        types.forEach(t => console.log('  -', t.document_type));

        console.log('\n📋 ALL UPLOADED DOCUMENTS:\n');
        const [docs] = await conn.query(`
            SELECT 
                master_id, 
                document_name, 
                document_type, 
                status, 
                uploaded_at 
            FROM documents_uploads 
            ORDER BY uploaded_at DESC
        `);

        docs.forEach(d => {
            console.log(`  Student: ${d.master_id}`);
            console.log(`  Type: ${d.document_type}`);
            console.log(`  Name: ${d.document_name}`);
            console.log(`  Status: ${d.status}`);
            console.log(`  Uploaded: ${d.uploaded_at}`);
            console.log('');
        });

        console.log(`\n📊 Total Documents: ${docs.length}`);

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDocuments();
