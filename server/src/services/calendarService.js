import { defense_evaluations, progress_updates, documents_uploads, pgstudinfo, tbldepartments, program_info, studinfo, role_assignment } from '../config/config.js';
import { Op } from 'sequelize';
import notificationService from './notificationService.js';

class CalendarService {
    /**
     * Get all events relevant to a specific student
     */
    async getStudentEvents(pgstud_id) {
        const student = await pgstudinfo.findByPk(pgstud_id);
        if (!student) throw new Error('Student not found');

        const [defenses, updates, uploads] = await Promise.all([
            defense_evaluations.findAll({ where: { pg_student_id: pgstud_id } }),
            progress_updates.findAll({ where: { pg_student_id: pgstud_id } }),
            documents_uploads.findAll({ where: { pg_student_id: pgstud_id } })
        ]);

        const events = [];

        // 1. Defense Evaluations
        defenses.forEach(d => {
            events.push({
                id: `defense-${d.evaluation_id}`,
                title: `${d.defense_type}: ${d.viva_outcome || 'Scheduled'}`,
                start: d.evaluation_date,
                allDay: true,
                type: 'DEFENSE',
                color: '#ef4444', // Red
                metadata: d
            });
        });

        // 2. Progress Updates
        updates.forEach(u => {
            events.push({
                id: `progress-${u.update_id}`,
                title: `Progress Update: ${u.title}`,
                start: u.submission_date,
                allDay: true,
                type: 'PROGRESS',
                color: '#f59e0b', // Yellow/Amber
                metadata: u
            });
        });

        // 3. Document Uploads (Deadlines/Milestones)
        uploads.forEach(up => {
            events.push({
                id: `upload-${up.doc_up_id}`,
                title: `${up.document_type} Uploaded`,
                start: up.uploaded_at,
                allDay: false,
                type: 'DOCUMENT',
                color: '#3b82f6', // Blue
                metadata: up
            });
        });

        // 4. Personalized Deadlines (Calculated)
        const deadlines = this.calculateStudentDeadlines(student);
        deadlines.forEach(dl => {
            events.push({
                id: dl.id,
                title: dl.title,
                start: dl.date,
                allDay: true,
                type: 'DEADLINE',
                color: '#8b5cf6', // Purple
                metadata: { isDeadline: true }
            });
        });

        return events;
    }

    /**
     * Get all events for a staff member (assigned students' defenses)
     */
    async getStaffEvents(pgstaff_id) {
        // Get students assigned to this staff member
        const assignedStudents = await role_assignment.findAll({
            where: { pg_staff_id: pgstaff_id, status: 'Approved' },
            attributes: ['pg_student_id']
        });

        const studentIds = assignedStudents.map(a => a.pg_student_id);
        if (studentIds.length === 0) return [];

        const defenses = await defense_evaluations.findAll({
            where: { pg_student_id: { [Op.in]: studentIds } },
            include: [{
                model: pgstudinfo,
                as: 'pg_student',
                include: [{ model: studinfo, as: 'stu' }]
            }]
        });

        return defenses.map(d => ({
            id: `defense-${d.evaluation_id}`,
            title: `${d.pg_student?.stu?.FirstName || 'Student'} - ${d.defense_type}`,
            start: d.evaluation_date,
            allDay: true,
            type: 'DEFENSE',
            color: '#ef4444',
            metadata: d
        }));
    }

    /**
     * Get all events for CGS Admin (Master View)
     */
    async getAllEvents() {
        const defenses = await defense_evaluations.findAll({
            include: [{
                model: pgstudinfo,
                as: 'pg_student',
                include: [{ model: studinfo, as: 'stu' }]
            }]
        });

        return defenses.map(d => ({
            id: `defense-${d.evaluation_id}`,
            title: `[${d.defense_type}] ${d.pg_student?.stu?.FirstName || 'Unknown'}`,
            start: d.evaluation_date,
            allDay: true,
            type: 'DEFENSE',
            color: '#ef4444',
            metadata: d
        }));
    }

    /**
     * Calculate administrative deadlines for a student
     */
    calculateStudentDeadlines(student) {
        const regDate = new Date(student.RegDate);
        const endDate = new Date(student.EndDate);
        const isDoctoral = student.role_level === 'Doctoral Student';

        const deadlines = [
            { id: 'grad-deadline', title: 'Expected Graduation', date: endDate }
        ];

        // Example Logic: Proposal due 6 months (Master) or 12 months (Doctoral) after registration
        const proposalMonths = isDoctoral ? 12 : 6;
        const proposalDueDate = new Date(regDate);
        proposalDueDate.setMonth(proposalDueDate.getMonth() + proposalMonths);

        deadlines.push({
            id: 'proposal-deadline',
            title: 'Research Proposal Deadline',
            date: proposalDueDate
        });

        return deadlines;
    }

    /**
     * Automated check for upcoming deadlines (to be run via CRON or interval)
     */
    async checkUpcomingDeadlines() {
        const students = await pgstudinfo.findAll({ where: { Status: 'Active' } });
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        const today = new Date();

        for (const student of students) {
            const deadlines = this.calculateStudentDeadlines(student);
            for (const dl of deadlines) {
                const dlDate = new Date(dl.date);
                // Simple date match for "7 days before"
                if (dlDate.toDateString() === sevenDaysLater.toDateString()) {
                    await notificationService.createNotification({
                        userId: student.pgstud_id,
                        roleId: student.role_id,
                        title: 'Upcoming Deadline Alert',
                        message: `Your ${dl.title} is approaching on ${dlDate.toLocaleDateString()}. Please ensure all documents are submitted.`,
                        type: 'CALENDAR_ALERT'
                    });
                }
            }
        }
    }
}

export default new CalendarService();
