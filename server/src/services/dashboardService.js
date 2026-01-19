import { defense_evaluations, progress_updates, pgstudinfo, documents_uploads, studinfo, program_info } from '../config/config.js';
import { Op } from 'sequelize';

class DashboardService {
    async getSupervisorStats(depCode) {
        const [totalStudents, pendingReviews, thesisApproved, proposalsReviewed] = await Promise.all([
            pgstudinfo.count({ where: { Dep_Code: depCode, Status: 'Active' } }),
            progress_updates.count({ where: { status: 'Pending Review' } }),
            defense_evaluations.count({
                where: { defense_type: 'Final Thesis', final_comments: { [Op.like]: 'Pass%' } }
            }),
            defense_evaluations.count({
                where: { defense_type: 'Proposal Defense', final_comments: { [Op.like]: 'Pass%' } }
            })
        ]);

        return {
            totalStudents,
            pendingReviews,
            thesisApproved,
            proposalsReviewed
        };
    }

    async getExaminerDashboardData(examinerId, depCode) {
        // 1. Get all students approved by supervisors
        const approvedBySupervisor = await defense_evaluations.findAll({
            where: {
                evaluator_role: 'SUV',
                final_comments: { [Op.like]: 'Pass%' }
            },
            attributes: ['pg_student_id', 'defense_type']
        });

        if (approvedBySupervisor.length === 0) return [];

        const studentIds = approvedBySupervisor.map(e => e.pg_student_id);

        // 2. Get relevant submissions
        const submissions = await documents_uploads.findAll({
            where: {
                pg_student_id: { [Op.in]: studentIds },
                [Op.or]: [
                    { document_type: 'Research Proposal' },
                    { document_type: 'Final Thesis' }
                ]
            },
            include: [
                {
                    model: pgstudinfo,
                    as: 'pg_student',
                    where: { Dep_Code: depCode },
                    include: [
                        {
                            model: studinfo,
                            as: 'stu',
                            attributes: ['FirstName', 'LastName', 'EmailId']
                        },
                        {
                            model: program_info,
                            as: 'Prog_Code_program_info',
                            attributes: ['Prog_Name']
                        }
                    ]
                }
            ],
            order: [['uploaded_at', 'DESC']]
        });

        // 3. Get examiner's own evaluations
        const examinerEvaluations = await defense_evaluations.findAll({
            where: {
                evaluator_role: 'EXA',
                evaluator_id: examinerId
            }
        });

        // 4. Map and filter
        return submissions.map(doc => {
            const student = doc.pg_student;
            if (!student) return null;

            const stuInfo = student.stu;
            const program = student.Prog_Code_program_info;

            const supEval = approvedBySupervisor.find(e =>
                e.pg_student_id === student.pgstud_id &&
                ((doc.document_type === 'Research Proposal' && e.defense_type === 'Proposal Defense') ||
                    (doc.document_type === 'Final Thesis' && e.defense_type === 'Final Thesis'))
            );

            if (!supEval) return null;

            const myEval = examinerEvaluations.find(e =>
                e.pg_student_id === student.pgstud_id &&
                e.defense_type === supEval.defense_type
            );

            return {
                id: `${student.pgstud_id}-${doc.document_type}`,
                fullName: stuInfo ? `${stuInfo.FirstName} ${stuInfo.LastName}` : 'Unknown Student',
                studentId: student.pgstud_id,
                programme: program ? program.Prog_Name : 'N/A',
                thesisTitle: doc.document_name,
                defenseType: supEval.defense_type,
                status: myEval ? 'Submitted' : 'Pending',
                documentId: doc.doc_up_id,
                documentPath: doc.file_path,
                uploadedAt: doc.uploaded_at,
                evaluationData: myEval || null
            };
        }).filter(Boolean);
    }
}

export default new DashboardService();
