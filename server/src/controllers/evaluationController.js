import EvaluationService from '../services/evaluationService.js';
import { pgstudinfo } from '../config/config.js';
import { Op } from 'sequelize';
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await pgstudinfo.findOne({
            where: {
                [Op.or]: [
                    { pgstud_id: id },
                    { stu_id: id }
                ]
            },
            attributes: ['pgstud_id', 'FirstName', 'LastName', 'stu_id']
        });

        if (!student) return sendError(res, 'Student not found', 404);

        // Check for Final Thesis status
        const { documents_uploads } = await import('../config/config.js');
        const finalThesis = await documents_uploads.findOne({
            where: {
                pg_student_id: student.pgstud_id,
                document_type: 'Final Thesis'
            },
            order: [['uploaded_at', 'DESC']]
        });

        sendSuccess(res, "Student found", {
            name: `${student.FirstName} ${student.LastName}`,
            pgstud_id: student.pgstud_id,
            stu_id: student.stu_id,
            finalThesisStatus: finalThesis ? finalThesis.status : null
        });
    } catch (err) {
        console.error('getStudentById error:', err);
        sendError(res, 'Failed to find student', 500);
    }
};

export const createEvaluation = async (req, res) => {
    try {
        const { studentId } = req.body;

        // Resolve authoritative pg_student_id
        const student = await pgstudinfo.findOne({
            where: {
                [Op.or]: [
                    { pgstud_id: studentId },
                    { stu_id: studentId }
                ]
            }
        });

        if (!student) return sendError(res, "Student not found", 404);

        const evaluationData = {
            ...req.body,
            pg_student_id: student.pgstud_id,
            defense_type: req.body.defenseType,
            knowledge_rating: req.body.knowledgeRating,
            presentation_rating: req.body.presentationRating,
            response_rating: req.body.responseRating,
            organization_rating: req.body.organizationRating,
            overall_rating: req.body.overallRating,
            final_comments: req.body.finalComments,
            evaluator_role: req.user.role_id,
            evaluator_id: req.user.pgstaff_id || req.user.id
        };

        const evaluation = await EvaluationService.createDefenseEvaluation(evaluationData);
        sendSuccess(res, "Evaluation submitted successfully", { evaluation }, 201);
    } catch (err) {
        console.error('Create Evaluation Error:', err);
        sendError(res, err.message || 'Failed to submit evaluation', err.status || 500);
    }
};

export const getStudentEvaluations = async (req, res) => {
    try {
        const { studentId } = req.params;
        const evaluations = await EvaluationService.getEvaluationsByStudent(studentId);
        sendSuccess(res, "Evaluations fetched successfully", { evaluations });
    } catch (err) {
        sendError(res, 'Failed to fetch evaluations', 500);
    }
};

export const getAllEvaluations = async (req, res) => {
    try {
        const evaluations = await EvaluationService.getAllEvaluations();
        sendSuccess(res, "Evaluations fetched successfully", { evaluations });
    } catch (err) {
        sendError(res, 'Failed to fetch evaluations', 500);
    }
};
