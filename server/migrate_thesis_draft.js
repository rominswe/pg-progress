import mysql from 'mysql2/promise';

async function updateThesisDraftToFinalThesis() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root',
            database: 'aiu_pg_progress'
        });

        console.log('╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║     UPDATE: Thesis Draft → Final Thesis                              ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

        // Check current "Thesis Draft" records
        const [thesisDrafts] = await conn.query(
            `SELECT doc_up_id, master_id, document_name, document_type, uploaded_at 
             FROM documents_uploads 
             WHERE document_type = 'Thesis Draft'`
        );

        console.log(`📊 Found ${thesisDrafts.length} records with "Thesis Draft"\n`);

        if (thesisDrafts.length > 0) {
            console.log('Records to be updated:');
            thesisDrafts.forEach((doc, i) => {
                console.log(`${i + 1}. ${doc.document_name} (Student: ${doc.master_id})`);
            });

            console.log('\n🔄 Updating records...\n');

            // Update all "Thesis Draft" to "Final Thesis"
            const [result] = await conn.query(
                `UPDATE documents_uploads 
                 SET document_type = 'Final Thesis' 
                 WHERE document_type = 'Thesis Draft'`
            );

            console.log(`✅ Successfully updated ${result.affectedRows} record(s)\n`);
        } else {
            console.log('ℹ️  No "Thesis Draft" records found to update\n');
        }

        // Verify the update
        const [finalThesis] = await conn.query(
            `SELECT doc_up_id, master_id, document_name, document_type, uploaded_at 
             FROM documents_uploads 
             WHERE document_type = 'Final Thesis'`
        );

        console.log(`📋 Current "Final Thesis" records: ${finalThesis.length}\n`);
        if (finalThesis.length > 0) {
            finalThesis.forEach((doc, i) => {
                console.log(`${i + 1}. ${doc.document_name} (Student: ${doc.master_id})`);
            });
        }

        console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║     UPDATE COMPLETE                                                   ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝');

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

updateThesisDraftToFinalThesis();
