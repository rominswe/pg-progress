import {
    sequelize,
    defense_evaluations,
    master_stu,
    supervisor,
    examiner_assignments,
    programInfo
} from '../config/config.js';

const models = {
    defense_evaluations,
    master_stu,
    supervisor,
    examiner_assignments,
    program_info: programInfo // map programInfo to models.program_info expected by code
};

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

// Get students assigned to the examiner (Explicit Assignment)
export const getAssignedStudents = async (req, res) => {
    try {
        const examinerId = req.user.id;
        if (!examinerId) return res.status(403).json({ error: "Not authorized as Examiner" });

        // Fetch assignments with Student details
        const assignments = await models.examiner_assignments.findAll({
            where: { examiner_id: examinerId, status: 'Active' },
            include: [
                {
                    model: models.master_stu,
                    as: 'student',
                    attributes: ['master_id', 'stu_id', 'FirstName', 'LastName', 'Prog_Code', 'Status'],
                    include: [{
                        model: models.program_info,
                        as: 'Prog_Code_program_info',
                        attributes: ['prog_name']
                    }]
                }
            ]
        });

        const studentList = await Promise.all(assignments.map(async (assignment) => {
            const stu = assignment.student;
            if (!stu) return null;

            // Check if this student has been evaluated by this examiner
            // We can check by Supervisor Name (Examiner Name) AND student ID for now
            const evaluation = await defense_evaluations.findOne({
                where: {
                    student_id: stu.master_id,
                    supervisor_name: req.user.FirstName // Better: add examiner_id to defense_evaluations later
                },
                order: [['created_at', 'DESC']]
            });

            return {
                id: stu.master_id,
                studentId: stu.stu_id,
                fullName: `${stu.FirstName} ${stu.LastName}`,
                programme: stu.Prog_Code_program_info?.prog_name || stu.Prog_Code,
                thesisTitle: "Research Proposal Framework", // Placeholder title
                status: evaluation ? 'Submitted' : 'Pending',
                evaluationData: evaluation || null
            };
        }));

        res.json({ students: studentList.filter(s => s !== null) });

    } catch (err) {
        console.error("Get Assigned Students Error:", err);
        res.status(500).json({ error: "Failed to fetch assigned students" });
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
            vivaOutcome, // New Field
            evaluationDate
        } = req.body;

        // Validate required fields
        if (!studentName || !studentId || !defenseType || !semester || !supervisorName || !vivaOutcome) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate ratings
        if (!knowledgeRating || !presentationRating || !responseRating || !organizationRating || !overallRating) {
            return res.status(400).json({ error: 'All ratings are required' });
        }

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
            supervisor_name: supervisorName || `${req.user.FirstName} ${req.user.LastName}`, // This is acting as "Examiner Name" in this context
            viva_outcome: vivaOutcome,
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
        const evaluations = await defense_evaluations.findAll({
            order: [['created_at', 'DESC']]
        });

        res.json({ evaluations });

    } catch (err) {
        console.error('Get All Evaluations Error:', err);
        res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
};
