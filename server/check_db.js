import { progress_updates, defense_evaluations } from './src/config/config.js';
import { Op } from 'sequelize';

async function test() {
    try {
        const totalUpdates = await progress_updates.count();
        const approvedThesis = await defense_evaluations.count({ where: { defense_type: 'thesis_defense' } });
        const proposalReviews = await defense_evaluations.count({ where: { defense_type: 'proposal_defense' } });

        console.log(JSON.stringify({
            totalUpdates,
            approvedThesis,
            proposalReviews
        }, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
