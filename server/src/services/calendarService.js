import { defense_evaluations, progress_updates, documents_uploads, pgstudinfo, tbldepartments, program_info, studinfo, role_assignment, milestones } from '../config/config.js';
import { Op } from 'sequelize';
import notificationService from './notificationService.js';

class CalendarService {
    /**
     * Get all events relevant to a specific student
     */
    async getStudentEvents(pgstud_id) {
        const student = await pgstudinfo.findByPk(pgstud_id);
        if (!student) throw new Error('Student not found');

        const [defenses, updates, uploads, customDeadlines] = await Promise.all([
            defense_evaluations.findAll({ where: { pg_student_id: pgstud_id } }),
            progress_updates.findAll({ where: { pg_student_id: pgstud_id } }),
            documents_uploads.findAll({ where: { pg_student_id: pgstud_id } }),
            milestones.findAll({
                where: { pgstudent_id: pgstud_id },
                attributes: ['name', 'deadline_date', 'reason']
            })
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

        // 4. Personalized Deadlines (Calculated + Overridden)
        const systemDeadlines = this.calculateStudentDeadlines(student);

        systemDeadlines.forEach(sdl => {
            // Check if we have a custom override for this milestone
            const custom = customDeadlines.find(cd => {
                if (!cd.name || !sdl.milestoneName) return false;
                return cd.name.toLowerCase() === sdl.milestoneName.toLowerCase();
            });
            const dateToUse = custom ? custom.deadline_date : sdl.date;
            const isOverridden = !!custom;

            events.push({
                id: sdl.id,
                title: isOverridden ? `${sdl.title} (Adjusted)` : sdl.title,
                start: dateToUse,
                allDay: true,
                type: 'DEADLINE',
                color: isOverridden ? '#7c3aed' : '#8b5cf6', // Darker purple for overrides
                metadata: {
                    isDeadline: true,
                    isOverridden,
                    originalDate: sdl.date,
                    reason: custom?.reason
                }
            });
        });

        return events;
    }

    /**
     * Get all events for a staff member (assigned students' defenses)
     */
    /**
     * Get all events for a staff member (assigned students' defenses & deadlines)
     */
    async getStaffEvents(pgstaff_id) {
        // Get students assigned to this staff member
        const assignedStudents = await role_assignment.findAll({
            where: { pg_staff_id: pgstaff_id, status: 'Approved' },
            include: [{
                model: pgstudinfo,
                as: 'pg_student',
                include: [{ model: studinfo, as: 'stu' }]
            }]
        });

        const studentIds = assignedStudents.map(a => a.pg_student_id);
        if (studentIds.length === 0) return [];

        const [defenses, customDeadlines] = await Promise.all([
            defense_evaluations.findAll({
                where: { pg_student_id: { [Op.in]: studentIds } },
                include: [{ model: pgstudinfo, as: 'pg_student', include: [{ model: studinfo, as: 'stu' }] }]
            }),
            milestones.findAll({
                where: { pgstudent_id: { [Op.in]: studentIds } },
                attributes: ['name', 'pgstudent_id', 'deadline_date']
            })
        ]);

        const events = [];

        // 1. Defenses
        defenses.forEach(d => {
            events.push({
                id: `defense-${d.evaluation_id}`,
                title: `${d.pg_student?.stu?.FirstName || 'Student'} - ${d.defense_type}`,
                start: d.evaluation_date,
                allDay: true,
                type: 'DEFENSE',
                color: '#ef4444',
                metadata: d
            });
        });

        // 2. Deadlines for each assigned student
        for (const assignment of assignedStudents) {
            const student = assignment.pg_student;
            const stuName = student?.stu?.FirstName || 'Student';
            const stuCustoms = customDeadlines.filter(cd => cd.pgstudent_id === student.pgstud_id);
            const systemDeadlines = this.calculateStudentDeadlines(student);

            systemDeadlines.forEach(sdl => {
                const custom = stuCustoms.find(cd => {
                    if (!cd.name || !sdl.milestoneName) return false;
                    return cd.name.toLowerCase() === sdl.milestoneName.toLowerCase();
                });
                const dateToUse = custom ? custom.deadline_date : sdl.date;
                const isOverridden = !!custom;

                events.push({
                    id: `dl-${student.pgstud_id}-${sdl.id}`,
                    title: `[${stuName}] ${sdl.title}${isOverridden ? ' (Adj)' : ''}`,
                    start: dateToUse,
                    allDay: true,
                    type: 'DEADLINE',
                    color: isOverridden ? '#7c3aed' : '#8b5cf6',
                    metadata: { studentId: student.pgstud_id, isOverridden }
                });
            });
        }

        return events;
    }

    /**
     * Get all events for CGS Admin (Master View)
     */
    async getAllEvents() {
        const [defenses, students] = await Promise.all([
            defense_evaluations.findAll({
                include: [{ model: pgstudinfo, as: 'pg_student', include: [{ model: studinfo, as: 'stu' }] }]
            }),
            pgstudinfo.findAll({
                where: { Status: 'Active' },
                include: [{ model: studinfo, as: 'stu' }]
            })
        ]);

        const studentIds = students.map(s => s.pgstud_id);
        const customDeadlines = await milestones.findAll({
            where: { pgstudent_id: { [Op.in]: studentIds } },
            attributes: ['name', 'pgstudent_id', 'deadline_date']
        });

        const events = [];

        // 1. Defenses
        defenses.forEach(d => {
            events.push({
                id: `defense-${d.evaluation_id}`,
                title: `[DEFENSE] ${d.pg_student?.stu?.FirstName || 'Unknown'} - ${d.defense_type}`,
                start: d.evaluation_date,
                allDay: true,
                type: 'DEFENSE',
                color: '#ef4444',
                metadata: d
            });
        });

        // 2. Deadlines for all active students
        for (const student of students) {
            const stuName = student.stu?.FirstName || 'Student';
            const stuCustoms = customDeadlines.filter(cd => cd.pgstudent_id === student.pgstud_id);
            const systemDeadlines = this.calculateStudentDeadlines(student);

            systemDeadlines.forEach(sdl => {
                const custom = stuCustoms.find(cd => {
                    if (!cd.name || !sdl.milestoneName) return false;
                    return cd.name.toLowerCase() === sdl.milestoneName.toLowerCase();
                });
                const dateToUse = custom ? custom.deadline_date : sdl.date;
                const isOverridden = !!custom;

                events.push({
                    id: `dl-${student.pgstud_id}-${sdl.id}`,
                    title: `[${stuName}] ${sdl.title}${isOverridden ? ' (Adj)' : ''}`,
                    start: dateToUse,
                    allDay: true,
                    type: 'DEADLINE',
                    color: isOverridden ? '#7c3aed' : '#8b5cf6',
                    metadata: { studentId: student.pgstud_id, isOverridden }
                });
            });
        }

        return events;
    }

    /**
     * Calculate administrative deadlines for a student
     */
    calculateStudentDeadlines(student) {
        const regDate = new Date(student.RegDate);
        const endDate = new Date(student.EndDate);
        const isDoctoral = student.role_level === 'Doctoral Student';

        const deadlines = [
            { id: 'grad-deadline', title: 'Expected Graduation', date: endDate, docType: 'Final Thesis', milestoneName: 'Final Thesis' }
        ];

        // 1. Research Proposal
        const proposalMonths = isDoctoral ? 12 : 6;
        const proposalDate = new Date(regDate);
        proposalDate.setMonth(proposalDate.getMonth() + proposalMonths);
        deadlines.push({ id: 'proposal-deadline', title: 'Research Proposal', date: proposalDate, docType: 'Research Proposal', milestoneName: 'Research Proposal' });

        // 2. Literature Review
        const litDate = new Date(proposalDate);
        litDate.setMonth(litDate.getMonth() + 4);
        deadlines.push({ id: 'lit-review-deadline', title: 'Literature Review', date: litDate, docType: 'Literature Review', milestoneName: 'Literature Review' });

        // 3. Methodology Chapter
        const methDate = new Date(litDate);
        methDate.setMonth(methDate.getMonth() + 4);
        deadlines.push({ id: 'methodology-deadline', title: 'Methodology Chapter', date: methDate, docType: 'Methodology Chapter', milestoneName: 'Methodology Chapter' });

        // 4. Data Collection & Analysis
        const dataDate = new Date(methDate);
        dataDate.setMonth(dataDate.getMonth() + 6);
        deadlines.push({ id: 'data-collection-deadline', title: 'Data Collection & Analysis', date: dataDate, docType: 'Data Collection & Analysis', milestoneName: 'Data Collection & Analysis' });

        return deadlines;
    }

    /**
     * Automated check for upcoming deadlines (to be run via CRON or interval)
     */
    async checkUpcomingDeadlines() {
        const students = await pgstudinfo.findAll({ where: { Status: 'Active' } });
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        for (const student of students) {
            // Fetch custom deadlines for this student
            const customDeadlines = await milestones.findAll({
                where: { pgstudent_id: student.pgstud_id },
                attributes: ['name', 'deadline_date']
            });
            const systemDeadlines = this.calculateStudentDeadlines(student);

            for (const sdl of systemDeadlines) {
                const custom = customDeadlines.find(cd => {
                    if (!cd.name || !sdl.milestoneName) return false;
                    return cd.name.toLowerCase() === sdl.milestoneName.toLowerCase();
                });
                const dlDate = new Date(custom ? custom.deadline_date : sdl.date);

                // Simple date match for "7 days before"
                if (dlDate.toDateString() === sevenDaysLater.toDateString()) {
                    await notificationService.createNotification({
                        userId: student.pgstud_id,
                        roleId: 'STU',
                        title: 'Upcoming Deadline Alert',
                        message: `Your deadline for "${sdl.title}" is approaching on ${dlDate.toLocaleDateString()}. Please ensure all documents are submitted.`,
                        type: 'CALENDAR_ALERT'
                    });
                }
            }
        }
    }
}

export default new CalendarService();
