import { defense_evaluations, progress_updates, pgstudinfo, documents_uploads, studinfo, program_info } from '../config/config.js';
import { Op } from 'sequelize';
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const getSupervisorStats = async (req, res) => {
    try {
        const depCode = req.user.Dep_Code || 'CGS';

        const totalStudents = await pgstudinfo.count({
            where: { Dep_Code: depCode, Status: 'Active' }
        });

        const pendingReviews = await progress_updates.count({
            where: { status: 'Pending Review' }
        });

        const thesisApproved = await defense_evaluations.count({
            where: { defense_type: 'Final Thesis', final_comments: { [Op.like]: 'Pass%' } }
        });

        const proposalsReviewed = await defense_evaluations.count({
            where: { defense_type: 'Proposal Defense', final_comments: { [Op.like]: 'Pass%' } }
        });

        sendSuccess(res, "Supervisor stats fetched successfully", {
            totalStudents,
            pendingReviews,
            thesisApproved,
            proposalsReviewed
        });
    } catch (err) {
        console.error('Get Supervisor Stats Error:', err);
        sendError(res, 'Failed to fetch dashboard stats', 500);
    }
};

export const getExaminerStudents = async (req, res) => {
    try {
        const examinerId = req.user.pg_staff_id || req.user.id;
        const depCode = req.user.Dep_Code || 'CGS';

        const approvedBySupervisor = await defense_evaluations.findAll({
            where: {
                evaluator_role: 'SUV',
                final_comments: { [Op.like]: 'Pass%' }
            },
            attributes: ['student_id', 'defense_type']
        });

        if (approvedBySupervisor.length === 0) {
            return sendSuccess(res, "No students approved by supervisor", { students: [] });
        }

        const studentIds = approvedBySupervisor.map(e => e.student_id);

        const submissions = await documents_uploads.findAll({
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
                    model: pgstudinfo,
                    as: 'master',
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

        const examinerEvaluations = await defense_evaluations.findAll({
            where: {
                evaluator_role: 'EXA',
                evaluator_id: examinerId
            }
        });

        const result = submissions.map(doc => {
            const student = doc.master;
            if (!student) return null;

            const stuInfo = student.stu;
            const program = student.Prog_Code_program_info;

            const supEval = approvedBySupervisor.find(e =>
                e.student_id === student.pgstud_id &&
                ((doc.document_type === 'Research Proposal' && e.defense_type === 'Proposal Defense') ||
                    (doc.document_type === 'Final Thesis' && e.defense_type === 'Final Thesis'))
            );

            if (!supEval) return null;

            const myEval = examinerEvaluations.find(e =>
                e.student_id === student.pgstud_id &&
                e.defense_type === supEval.defense_type
            );

            const status = myEval ? 'Submitted' : 'Pending';

            return {
                id: `${student.pgstud_id}-${doc.document_type}`,
                fullName: stuInfo ? `${stuInfo.FirstName} ${stuInfo.LastName}` : 'Unknown Student',
                studentId: student.pgstud_id,
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

        sendSuccess(res, "Examiner students fetched successfully", { students: result });

    } catch (err) {
        console.error('Get Examiner Students Error:', err);
        sendError(res, 'Failed to fetch examiner dashboard', 500);
    }
};
