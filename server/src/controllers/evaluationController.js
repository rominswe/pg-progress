import { defense_evaluations, pgstudinfo, documents_uploads } from '../config/config.js';
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_id, Dep_Code } = req.user;

        const whereClause = { pgstud_id: id };

        if (role_id === 'SUV') {
            whereClause.Dep_Code = Dep_Code || 'CGS';
        }

        const student = await pgstudinfo.findOne({
            where: whereClause,
            attributes: ['FirstName', 'LastName']
        });

        if (!student) {
            return sendError(res, 'Student not found in your department', 404);
        }

        sendSuccess(res, "Student found", { name: `${student.FirstName} ${student.LastName}` });
    } catch (err) {
        console.error('Find Student Error:', err);
        sendError(res, 'Failed to find student', 500);
    }
};

export const createEvaluation = async (req, res) => {
    try {
        const {
            studentName,
            studentId,
            defenseType,
            semester,
            knowledgeRating,
            presentationRating,
            responseRating,
            organizationRating,
            overallRating,
            strengths,
            weaknesses,
            recommendations,
            finalComments,
            supervisorName,
            evaluationDate
        } = req.body;

        if (!studentName || !studentId || !defenseType || !semester || !supervisorName) {
            return sendError(res, 'Missing required fields', 400);
        }

        if (!knowledgeRating || !presentationRating || !responseRating || !organizationRating || !overallRating) {
            return sendError(res, 'All ratings are required', 400);
        }

        const student = await pgstudinfo.findOne({
            where: { pgstud_id: studentId }
        });

        if (!student) {
            return sendError(res, `Student with ID "${studentId}" does not exist in the system.`, 404);
        }

        const finalThesis = await documents_uploads.findOne({
            where: {
                master_id: studentId,
                document_type: 'Final Thesis'
            }
        });

        if (!finalThesis) {
            return sendError(res, `Student has not submitted their Final Thesis yet.`, 403);
        }

        const evaluation = await defense_evaluations.create({
            student_name: studentName,
            student_id: studentId,
            defense_type: defenseType,
            semester,
            knowledge_rating: knowledgeRating,
            presentation_rating: presentationRating,
            response_rating: responseRating,
            organization_rating: organizationRating,
            overall_rating: overallRating,
            strengths,
            weaknesses,
            recommendations,
            final_comments: finalComments,
            supervisor_name: supervisorName,
            evaluation_date: evaluationDate || new Date(),
            evaluator_role: req.user.role_id,
            evaluator_id: req.user.pg_staff_id || req.user.id
        });

        if (defenseType === 'Final Thesis') {
            const isPass = finalComments === 'Pass';
            const newStatus = isPass ? 'Completed' : 'Resubmit';
            await documents_uploads.update(
                { status: newStatus },
                { where: { master_id: studentId, document_type: 'Final Thesis' } }
            );
        }

        sendSuccess(res, "Evaluation submitted successfully", { evaluation }, 201);

    } catch (err) {
        console.error('Create Evaluation Error:', err);
        sendError(res, 'Failed to submit evaluation', 500);
    }
};

export const getStudentEvaluations = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!studentId) return sendError(res, 'Student ID is required', 400);

        const evaluations = await defense_evaluations.findAll({
            where: { student_id: studentId },
            order: [['created_at', 'DESC']]
        });
        sendSuccess(res, "Evaluations fetched successfully", { evaluations });
    } catch (err) {
        console.error('Get Student Evaluations Error:', err);
        sendError(res, 'Failed to fetch evaluations', 500);
    }
};

export const getAllEvaluations = async (req, res) => {
    try {
        const evaluations = await defense_evaluations.findAll({
            include: [{
                model: pgstudinfo,
                as: 'student',
                required: true,
                attributes: []
            }],
            order: [['created_at', 'DESC']]
        });
        sendSuccess(res, "Evaluations fetched successfully", { evaluations });
    } catch (err) {
        console.error('Get All Evaluations Error:', err);
        sendError(res, 'Failed to fetch evaluations', 500);
    }
};
