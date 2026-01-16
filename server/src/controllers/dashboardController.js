import initModels from '../models/init-models.js';
import { sequelize } from '../config/config.js';
import { Op } from 'sequelize';

const models = initModels(sequelize);
const { defense_evaluations, progress_updates, master_stu } = models;

export const getSupervisorStats = async (req, res) => {
    try {
        const supervisorId = req.user.id || req.user.sup_id;

        // Find supervisor's department
        const supervisorModel = models.supervisor;
        const sup = await supervisorModel.findByPk(supervisorId);
        const depCode = sup ? sup.Dep_Code : 'CGS';

        // 1. Total Students in Department
        const totalStudents = await master_stu.count({
            where: { Dep_Code: depCode, role_id: 'STU' }
        });

        // 2. Pending Reviews (Progress Updates with status 'Pending Review')
        const pendingReviews = await progress_updates.count({
            where: { status: 'Pending Review' }
        });

        // 3. Thesis Approved (Final Thesis evaluations)
        const thesisApproved = await defense_evaluations.count({
            where: { defense_type: 'Final Thesis' }
        });

        // 4. Proposals Reviewed (Proposal Defense evaluations)
        const proposalsReviewed = await defense_evaluations.count({
            where: { defense_type: 'Proposal Defense' }
        });

        res.json({
            totalStudents,
            pendingReviews,
            thesisApproved,
            proposalsReviewed
        });
    } catch (err) {
        console.error('Get Supervisor Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getExaminerStudents = async (req, res) => {
    try {
        const examinerId = req.user.id || req.user.examiner_id;

        // Find examiner's department
        const examinerModel = models.examiner;
        const examiner = await examinerModel.findByPk(examinerId);

        if (!examiner) {
            return res.status(404).json({ error: 'Examiner not found' });
        }

        const depCode = examiner.Dep_Code;

        // 1. Find all students who have at least one 'Pass' evaluation from a Supervisor
        const approvedBySupervisor = await models.defense_evaluations.findAll({
            where: {
                evaluator_role: 'SUV',
                final_comments: { [Op.like]: 'Pass%' }
            },
            attributes: ['student_id', 'defense_type']
        });

        if (approvedBySupervisor.length === 0) {
            return res.json([]);
        }

        const studentIds = approvedBySupervisor.map(e => e.student_id);

        // 2. Fetch submissions for these students in this department
        // We'll show all documents that match a 'Pass' evaluation type
        // mapping 'Proposal Defense' -> 'Research Proposal' and 'Final Thesis' -> 'Final Thesis'

        const submissions = await models.documents_uploads.findAll({
            where: {
                master_id: { [Op.in]: studentIds },
                Dep_Code: depCode,
                [Op.or]: [
                    { document_type: 'Research Proposal' },
                    { document_type: 'Final Thesis' }
                ]
            },
            include: [
                {
                    model: models.master_stu,
                    as: 'master',
                    include: [
                        {
                            model: models.studinfo,
                            as: 'stu',
                            attributes: ['FirstName', 'LastName', 'EmailId']
                        },
                        {
                            model: models.program_info,
                            as: 'Prog_Code_program_info',
                            attributes: ['Prog_Name']
                        }
                    ]
                }
            ],
            order: [['uploaded_at', 'DESC']]
        });

        // 3. Search for existing evaluations BY THIS EXAMINER
        const examinerEvaluations = await models.defense_evaluations.findAll({
            where: {
                evaluator_role: 'EXA',
                evaluator_id: examinerId
            }
        });

        // Map to structure for the frontend
        const result = submissions.map(doc => {
            const student = doc.master;
            const stuInfo = student.stu;
            const program = student.Prog_Code_program_info;

            // Find matching supervisor approval
            const supEval = approvedBySupervisor.find(e =>
                e.student_id === student.master_id &&
                ((doc.document_type === 'Research Proposal' && e.defense_type === 'Proposal Defense') ||
                    (doc.document_type === 'Final Thesis' && e.defense_type === 'Final Thesis'))
            );

            // If no matching 'Pass' evaluation for this document type, we skip it
            // (Wait, the findAll already filtered studentIds, but didn't match document type strictly)
            if (!supEval) return null;

            // Check if THIS EXAMINER already evaluated it
            const myEval = examinerEvaluations.find(e =>
                e.student_id === student.master_id &&
                e.defense_type === supEval.defense_type
            );

            const status = myEval ? 'Submitted' : 'Pending';

            return {
                id: `${student.master_id}-${doc.document_type}`, // Unique key
                fullName: `${stuInfo.FirstName} ${stuInfo.LastName}`,
                studentId: student.master_id,
                programme: program ? program.Prog_Name : 'N/A',
                thesisTitle: doc.document_name,
                defenseType: supEval.defense_type,
                status: status,
                documentId: doc.doc_up_id,
                documentPath: doc.file_path,
                uploadedAt: doc.uploaded_at,
                evaluationData: myEval || null
            };
        }).filter(Boolean);

        res.json(result);

    } catch (err) {
        console.error('Get Examiner Students Error:', err);
        res.status(500).json({ error: 'Failed to fetch examiner dashboard' });
    }
};
