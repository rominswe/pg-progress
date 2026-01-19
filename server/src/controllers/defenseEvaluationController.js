import EvaluationService from '../services/evaluationService.js';
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const createDefenseEvaluation = async (req, res) => {
    try {
        const examinerId = req.user.pgstaff_id || req.user.id;

        const evaluationDate = req.body.evaluation_date ? new Date(req.body.evaluation_date) : new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (evaluationDate < today) {
            return sendError(res, 'Cannot schedule a defense for a past date', 400);
        }

        const evaluationData = {
            ...req.body,
            pg_student_id: req.body.student_id,
            evaluator_role: 'EXA',
            evaluator_id: examinerId,
            evaluation_date: evaluationDate
        };

        const newEvaluation = await EvaluationService.createDefenseEvaluation(evaluationData);
        sendSuccess(res, 'Evaluation submitted successfully', { evaluation: newEvaluation }, 201);
    } catch (error) {
        console.error('Create Defense Evaluation Error:', error);
        sendError(res, error.message || 'Failed to submit evaluation', error.status || 500);
    }
};

export const getDefenseEvaluationsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const evaluations = await EvaluationService.getEvaluationsByStudent(studentId);
        sendSuccess(res, 'Evaluations fetched successfully', { evaluations });
    } catch (error) {
        console.error('Get Defense Evaluations Error:', error);
        sendError(res, 'Failed to fetch evaluations', 500);
    }
};
