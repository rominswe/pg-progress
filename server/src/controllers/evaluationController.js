import initModels from '../models/init-models.js';
import { sequelize } from '../config/config.js';

const models = initModels(sequelize);
const { defense_evaluations, master_stu, supervisor, documents_uploads } = models;

// Find student by ID (Restricted to supervisor's department)
export const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const supervisorId = req.user.id || req.user.sup_id;
        const userRole = req.user.role_id;

        // 1. Find supervisor's department
        const sup = await supervisor.findByPk(supervisorId);

        // Admins can see everyone, Supervisors only their department
        const whereClause = { master_id: id };

        if (userRole === 'SUV' && sup) {
            whereClause.Dep_Code = sup.Dep_Code;
        } else if (userRole === 'SUV' && !sup) {
            // Fallback: if supervisor record not found, deny for safety
            return res.status(403).json({ error: 'Access denied: Supervisor record not found' });
        }

        const student = await master_stu.findOne({
            where: whereClause,
            attributes: ['FirstName', 'LastName']
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found in your department' });
        }

        res.json({ name: `${student.FirstName} ${student.LastName}` });
    } catch (err) {
        console.error('Find Student Error:', err);
        res.status(500).json({ error: 'Failed to find student' });
    }
};

// Create a new defense evaluation
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

        // Validate required fields
        if (!studentName || !studentId || !defenseType || !semester || !supervisorName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate ratings
        if (!knowledgeRating || !presentationRating || !responseRating || !organizationRating || !overallRating) {
            return res.status(400).json({ error: 'All ratings are required' });
        }

        // ✅ NEW VALIDATION: Check if student exists
        const student = await master_stu.findOne({
            where: { master_id: studentId }
        });

        if (!student) {
            return res.status(404).json({
                error: 'Student Not Found',
                message: `Student with ID "${studentId}" does not exist in the system. Please verify the student ID and try again.`
            });
        }

        // ✅ NEW VALIDATION: Check if student has submitted Final Thesis
        const finalThesis = await documents_uploads.findOne({
            where: {
                master_id: studentId,
                document_type: 'Final Thesis'
            }
        });

        if (!finalThesis) {
            return res.status(403).json({
                error: 'Final Thesis Not Submitted',
                message: `Student "${student.FirstName} ${student.LastName}" (${studentId}) has not submitted their Final Thesis yet. Evaluation cannot be performed until the Final Thesis is submitted.`,
                studentName: `${student.FirstName} ${student.LastName}`
            });
        }

        // Optional: Check if Final Thesis is approved (uncomment if needed)
        // if (finalThesis.status !== 'Approved') {
        //     return res.status(403).json({ 
        //         error: 'Final Thesis Not Approved',
        //         message: `The Final Thesis for student "${student.FirstName} ${student.LastName}" is still ${finalThesis.status}. Please wait for approval before evaluation.`
        //     });
        // }

        // Create evaluation
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
            evaluation_date: evaluationDate || new Date()
        });

        res.status(201).json({
            message: 'Evaluation submitted successfully',
            evaluation
        });

    } catch (err) {
        console.error('Create Evaluation Error:', err);
        res.status(500).json({ error: 'Failed to submit evaluation' });
    }
};

// Get evaluations for a specific student (for student feedback page)
export const getStudentEvaluations = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }

        const evaluations = await defense_evaluations.findAll({
            where: { student_id: studentId },
            order: [['created_at', 'DESC']]
        });

        res.json({ evaluations });

    } catch (err) {
        console.error('Get Student Evaluations Error:', err);
        res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
};

// Get all evaluations (for admin/supervisor overview)
export const getAllEvaluations = async (req, res) => {
    try {
        // Only fetch evaluations for students that exist in master_stu table
        const evaluations = await defense_evaluations.findAll({
            include: [{
                model: master_stu,
                as: 'master',
                required: true, // INNER JOIN - only show evaluations for real students
                attributes: [] // We don't need student data, just filtering
            }],
            order: [['created_at', 'DESC']]
        });

        res.json({ evaluations });

    } catch (err) {
        console.error('Get All Evaluations Error:', err);
        res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
};
