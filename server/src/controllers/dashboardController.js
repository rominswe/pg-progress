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
