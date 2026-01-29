import { defense_evaluations, progress_updates, pgstudinfo, documents_uploads, studinfo, program_info, role_assignment, pgstaffinfo, notifications, milestones } from '../config/config.js';
import { Op } from 'sequelize';
import roleAssignmentService from './roleAssignmentService.js';

class DashboardService {
    async getSupervisorStats(depCode, userId, roleId) {
        const isSupervisor = ['SUV', 'EXA'].includes(roleId);
        let studentFilter = {};

        if (isSupervisor) {
            const assignedIds = await roleAssignmentService.getAssignedStudentIds(userId);
            if (assignedIds.length === 0) {
                return {
                    totalStudents: 0,
                    pendingReviews: 0,
                    thesisApproved: 0,
                    proposalsReviewed: 0
                };
            }
            studentFilter = { pgstud_id: { [Op.in]: assignedIds } };
        } else {
            studentFilter = { Dep_Code: depCode }; // For admins/staff
        }

        const [totalStudents, pendingReviews, thesisApproved, proposalsReviewed] = await Promise.all([
            pgstudinfo.count({
                where: {
                    ...studentFilter,
                    Status: { [Op.in]: ['Active', 'Pending'] }
                }
            }),
            progress_updates.count({
                where: { status: 'Pending Review' },
                include: [{
                    model: pgstudinfo,
                    as: 'pg_student',
                    where: studentFilter,
                    required: true
                }]
            }),
            defense_evaluations.count({
                where: { defense_type: 'Final Thesis', final_comments: { [Op.like]: 'Pass%' } },
                include: [{
                    model: pgstudinfo,
                    as: 'pg_student',
                    where: studentFilter,
                    required: true
                }]
            }),
            defense_evaluations.count({
                where: { defense_type: 'Proposal Defense', final_comments: { [Op.like]: 'Pass%' } },
                include: [{
                    model: pgstudinfo,
                    as: 'pg_student',
                    where: studentFilter,
                    required: true
                }]
            })
        ]);

        return {
            totalStudents,
            pendingReviews,
            thesisApproved,
            proposalsReviewed
        };
    }

    async getExaminerDashboardData(examinerId) {
        // 1. Get assigned students (Examiners are assigned via role_assignment)
        const assignedStudentIds = await roleAssignmentService.getAssignedStudentIds(examinerId);

        if (assignedStudentIds.length === 0) return [];

        // 2. Get relevant submissions
        // We ONLY look for Final Thesis for examiners.
        const submissions = await documents_uploads.findAll({
            where: {
                pg_student_id: { [Op.in]: assignedStudentIds },
                document_type: 'Final Thesis'
            },
            include: [
                {
                    model: pgstudinfo,
                    as: 'pg_student',
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

        if (submissions.length === 0) return [];

        const studentIdsWithDocs = [...new Set(submissions.map(s => s.pg_student_id))];

        // 3. Get evaluations (Supervisor for pass check, Examiner for history)
        const allEvaluations = await defense_evaluations.findAll({
            where: {
                pg_student_id: { [Op.in]: studentIdsWithDocs }
            },
            order: [['evaluation_date', 'DESC']]
        });

        // 4. Map results
        return submissions.map((doc, index) => {
            const student = doc.pg_student;
            if (!student) return null;

            const stuInfo = student.stu;
            const program = student.Prog_Code_program_info;

            // Use the next document version's date as a limit for this version's evaluation
            const uploadDate = new Date(doc.uploaded_at);
            const nextUploadDate = index > 0 ? new Date(submissions[index - 1].uploaded_at) : null;

            // Find if there is a supervisor pass for Final Thesis
            const supEval = allEvaluations.find(e =>
                e.pg_student_id === student.pgstud_id &&
                e.evaluator_role === 'SUV' &&
                (e.viva_outcome === 'Pass' || (e.final_comments && e.final_comments.startsWith('Pass'))) &&
                e.defense_type === 'Final Thesis'
            );

            // Find if I have evaluated this SPECIFIC version
            const myEval = allEvaluations.find(e => {
                const evalDate = new Date(e.evaluation_date);
                const isMatching = e.pg_student_id === student.pgstud_id &&
                    e.evaluator_role === 'EXA' &&
                    e.evaluator_id === examinerId &&
                    e.defense_type === 'Final Thesis';

                if (!isMatching) return false;

                const isAfterThis = evalDate >= uploadDate;
                const isBeforeNext = nextUploadDate ? evalDate < nextUploadDate : true;
                return isAfterThis && isBeforeNext;
            });

            // Fallback for visual continuity
            const mostRelevantEval = myEval || allEvaluations.find(e =>
                e.pg_student_id === student.pgstud_id &&
                e.evaluator_role === 'EXA' &&
                e.evaluator_id === examinerId &&
                e.defense_type === 'Final Thesis' &&
                new Date(e.evaluation_date) >= uploadDate
            );

            // Classification Logic
            let listType = null;

            if (doc.status === 'Approved') {
                listType = 'active';
            } else if (myEval || mostRelevantEval) {
                listType = 'history';
            } else if (doc.status === 'Pending' && supEval) {
                listType = 'active';
            } else if (['Completed', 'Rejected', 'Resubmit'].includes(doc.status)) {
                listType = 'history';
            }

            if (!listType) return null;

            return {
                id: `${student.pgstud_id}-${doc.document_type}-${doc.doc_up_id}`,
                fullName: stuInfo ? `${stuInfo.FirstName} ${stuInfo.LastName}` : 'Unknown Student',
                studentId: student.stu_id,
                programme: program ? program.Prog_Name : 'N/A',
                thesisTitle: doc.document_name,
                defenseType: doc.document_type === 'Research Proposal' ? 'Proposal Defense' : 'Final Thesis',
                status: doc.status,
                documentId: doc.doc_up_id,
                documentPath: doc.file_path,
                uploadedAt: doc.uploaded_at,
                evaluationData: myEval || (doc.status !== 'Approved' ? mostRelevantEval : null),
                type: listType
            };
        }).filter(Boolean);
    }

    async getRecentActivities(depCode, roleId, userId) {
        const whereClause = {};
        const isSupervisor = ['SUV', 'EXA'].includes(roleId);

        if (isSupervisor) {
            const assignedIds = await roleAssignmentService.getAssignedStudentIds(userId);
            if (!assignedIds.length) return [];
            whereClause.pg_student_id = { [Op.in]: assignedIds };
        }

        const studentInclude = {
            model: pgstudinfo,
            as: 'pg_student',
            attributes: ['pgstud_id', 'FirstName', 'LastName', 'Dep_Code']
        };

        if (!isSupervisor && depCode) {
            studentInclude.where = { Dep_Code: depCode };
        }

        const documents = await documents_uploads.findAll({
            where: whereClause,
            include: [studentInclude],
            order: [['uploaded_at', 'DESC']],
            limit: 6
        });

        return documents.map(doc => {
            const student = doc.pg_student;
            const studentName = student ? `${student.FirstName} ${student.LastName}` : 'Unknown Student';

            return {
                id: doc.doc_up_id,
                studentName,
                documentType: doc.document_type || 'Document',
                status: doc.status,
                details: doc.document_name,
                date: doc.uploaded_at
            };
        });
    }
}

export default new DashboardService();
