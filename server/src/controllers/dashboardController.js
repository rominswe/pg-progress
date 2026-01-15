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

        // Find students in the same department who have uploaded 'Research Proposal'
        // We join documents_uploads -> master_stu -> studinfo
        // And check if document_type is 'Research Proposal'

        const submissions = await models.documents_uploads.findAll({
            where: {
                Dep_Code: depCode,
                document_type: 'Research Proposal'
                // We might want to filter by status, e.g., only 'Pending' or 'Approved' by supervisor?
                // For now, let's fetch all so the examiner can see them.
            },
            include: [
                {
                    model: models.master_stu,
                    as: 'master',
                    include: [
                        {
                            model: models.studinfo,
                            as: 'stu',
                            attributes: ['FirstName', 'LastName', 'EmailId', 'Program']
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

        // Search for existing evaluations for these students + defense type
        const existingEvaluations = await models.defense_evaluations.findAll({
            where: {
                defense_type: 'Proposal Defense'
            }
        });

        // Map to a cleaner structure for the frontend
        const students = submissions.map(doc => {
            const student = doc.master;
            const stuInfo = student.stu;
            const program = student.Prog_Code_program_info;

            // Check if already evaluated
            const evaluation = existingEvaluations.find(e => e.student_id === student.master_id);
            const status = evaluation ? 'Submitted' : 'Pending';

            return {
                id: student.master_id, // Use master_id as the unique key
                fullName: `${stuInfo.FirstName} ${stuInfo.LastName}`,
                studentId: student.master_id,
                programme: program ? program.Prog_Name : 'N/A',
                thesisTitle: doc.document_name, // Using document Name as proxy for thesis title or user can see the doc name
                status: status,
                documentId: doc.doc_up_id,
                documentPath: doc.file_path,
                uploadedAt: doc.uploaded_at,
                evaluationData: evaluation || null
            };
        });

        res.json(students);

    } catch (err) {
        console.error('Get Examiner Students Error:', err);
        res.status(500).json({ error: 'Failed to fetch examiner dashboard' });
    }
};
