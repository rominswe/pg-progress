import initModels from '../models/init-models.js';
import { sequelize } from '../config/config.js';

const models = initModels(sequelize);
const { defense_evaluations, examiner } = models;

export const createDefenseEvaluation = async (req, res) => {
    try {
        const examinerId = req.user.id || req.user.examiner_id;
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
            evaluation_date
        } = req.body;

        // Fetch examiner name for 'supervisor_name' field (Wait, the model has supervisor_name?)
        // Let's check the model again. It has 'supervisor_name'. 
        // In this context, it might be the 'Evaluator Name', so we use the examiner's name.

        const examinerData = await examiner.findByPk(examinerId);
        if (!examinerData) {
            return res.status(404).json({ error: 'Examiner not found' });
        }

        const evaluatorName = `${examinerData.FirstName} ${examinerData.LastName}`;

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
            supervisor_name: evaluatorName, // Using examiner name here as they are the evaluator
            evaluation_date: evaluation_date || new Date(),
        });

        res.status(201).json({ message: 'Evaluation submitted successfully', data: newEvaluation });

    } catch (error) {
        console.error('Create Defense Evaluation Error:', error);
        res.status(500).json({ error: 'Failed to submit evaluation' });
    }
};

export const getDefenseEvaluationsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const evaluations = await defense_evaluations.findAll({
            where: { student_id: studentId },
            order: [['evaluation_date', 'DESC']]
        });
        res.json(evaluations);
    } catch (error) {
        console.error('Get Defense Evaluations Error:', error);
        res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
};
