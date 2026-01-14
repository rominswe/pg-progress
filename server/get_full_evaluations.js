import mysql from 'mysql2/promise';

async function getFullEvaluationDetails() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root',
            database: 'aiu_pg_progress'
        });

        console.log('✅ Connected to database\n');
        console.log('='.repeat(80));
        console.log('FULL EVALUATION DETAILS');
        console.log('='.repeat(80) + '\n');

        const [evaluations] = await conn.query(`
            SELECT * FROM defense_evaluations ORDER BY created_at DESC
        `);

        evaluations.forEach((e, i) => {
            console.log(`\n📝 EVALUATION #${i + 1}`);
            console.log('-'.repeat(80));
            console.log(`Evaluation ID: ${e.evaluation_id}`);
            console.log(`Student Name: ${e.student_name}`);
            console.log(`Student ID: ${e.student_id}`);
            console.log(`Supervisor Name: ${e.supervisor_name}`);
            console.log(`Defense Type: ${e.defense_type}`);
            console.log(`Semester: ${e.semester}`);
            console.log(`Evaluation Date: ${e.evaluation_date}`);
            console.log(`Created At: ${e.created_at}`);
            console.log(`\nRatings:`);
            console.log(`  - Knowledge: ${e.knowledge_rating}/5`);
            console.log(`  - Presentation: ${e.presentation_rating}/5`);
            console.log(`  - Response: ${e.response_rating}/5`);
            console.log(`  - Organization: ${e.organization_rating}/5`);
            console.log(`  - Overall: ${e.overall_rating}/5`);
            console.log(`\nComments:`);
            console.log(`  - Strengths: ${e.strengths || 'N/A'}`);
            console.log(`  - Weaknesses: ${e.weaknesses || 'N/A'}`);
            console.log(`  - Recommendations: ${e.recommendations || 'N/A'}`);
            console.log(`  - Final Comments: ${e.final_comments || 'N/A'}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log(`TOTAL EVALUATIONS: ${evaluations.length}`);
        console.log('='.repeat(80));

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getFullEvaluationDetails();
