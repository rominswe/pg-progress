import { defense_evaluations, pgstaffinfo } from '../config/config.js';
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const createDefenseEvaluation = async (req, res) => {
    try {
        const examinerId = req.user.pg_staff_id || req.user.id;
        const evaluatorName = req.user.name; // Standard name from session

        const {
            student_id,
            student_name,
            defense_type,
            semester,
            knowledge_rating,
            presentation_rating,
            response_rating,
            organization_rating,
            overall_rating,
            strengths,
            weaknesses,
            recommendations,
            final_comments,
            viva_outcome,
            evaluation_date
        } = req.body;

        const newEvaluation = await defense_evaluations.create({
            student_id,
            student_name,
            defense_type,
            semester,
            knowledge_rating,
            presentation_rating,
            response_rating,
            organization_rating,
            overall_rating,
            strengths,
            weaknesses,
            recommendations,
            final_comments,
            viva_outcome,
            supervisor_name: evaluatorName,
            evaluation_date: evaluation_date || new Date(),
            evaluator_role: 'EXA',
            evaluator_id: examinerId
        });

        sendSuccess(res, 'Evaluation submitted successfully', { evaluation: newEvaluation }, 201);

    } catch (error) {
        console.error('Create Defense Evaluation Error:', error);
        sendError(res, 'Failed to submit evaluation', 500);
    }
};

export const getDefenseEvaluationsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const evaluations = await defense_evaluations.findAll({
            where: { student_id: studentId },
            order: [['evaluation_date', 'DESC']]
        });
        sendSuccess(res, 'Evaluations fetched successfully', { evaluations });
    } catch (error) {
        console.error('Get Defense Evaluations Error:', error);
        sendError(res, 'Failed to fetch evaluations', 500);
    }
};
