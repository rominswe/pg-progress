// Import the class-based model from config.js
import { progress as Progress, master_stu, supervisor, examiner, auditLog } from "../config/config.js";
import { logAuthEvent } from "../utils/authSecurity.js";
import { createNotification, NOTIFICATION_TYPES } from "../utils/notifications.js";
import { auditLog as auditLogger, AUDIT_ACTIONS, AUDIT_STATUS, ENTITY_TYPES } from "../utils/audit.js";

/* ================= PROGRESS STAGES ================= */
export const PROGRESS_STAGES = {
  PROPOSAL: 'Proposal',
  SUPERVISOR_REVIEW: 'Supervisor Review',
  DRAFT: 'Draft',
  FINAL: 'Final',
  EXAMINED: 'Examined',
  COMPLETED: 'Completed'
};

/* ================= STAGE TRANSITIONS & AUTHORIZATION ================= */
export const STAGE_PERMISSIONS = {
  [PROGRESS_STAGES.PROPOSAL]: ['STU'], // Students can submit proposal
  [PROGRESS_STAGES.SUPERVISOR_REVIEW]: ['SUV', 'CGSADM'], // Supervisors and admins can review
  [PROGRESS_STAGES.DRAFT]: ['STU'], // Students can submit draft
  [PROGRESS_STAGES.FINAL]: ['STU'], // Students can submit final
  [PROGRESS_STAGES.EXAMINED]: ['EXA', 'CGSADM'], // Examiners and admins can mark as examined
  [PROGRESS_STAGES.COMPLETED]: ['CGSADM', 'EXCGS'] // Only senior admins can complete
};

/* ================= VALID TRANSITIONS ================= */
export const VALID_TRANSITIONS = {
  [PROGRESS_STAGES.PROPOSAL]: [PROGRESS_STAGES.SUPERVISOR_REVIEW],
  [PROGRESS_STAGES.SUPERVISOR_REVIEW]: [PROGRESS_STAGES.DRAFT, PROGRESS_STAGES.PROPOSAL], // Can go back to proposal
  [PROGRESS_STAGES.DRAFT]: [PROGRESS_STAGES.FINAL, PROGRESS_STAGES.SUPERVISOR_REVIEW], // Can go back to review
  [PROGRESS_STAGES.FINAL]: [PROGRESS_STAGES.EXAMINED, PROGRESS_STAGES.DRAFT], // Can go back to draft
  [PROGRESS_STAGES.EXAMINED]: [PROGRESS_STAGES.COMPLETED, PROGRESS_STAGES.FINAL], // Can go back to final
  [PROGRESS_STAGES.COMPLETED]: [] // Terminal state
};

// Get all progress records
export const getAllProgress = async (req, res) => {
  try {
    const progressRecords = await Progress.findAll();
    res.json(progressRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single progress record by progress_id
export const getProgressById = async (req, res) => {
  try {
    const record = await Progress.findByPk(req.params.progress_id);
    if (!record)
      return res.status(404).json({ message: "Progress record not found" });

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new progress record
export const createProgress = async (req, res) => {
  try {
    const newRecord = await Progress.create(req.body);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a progress record
export const updateProgress = async (req, res) => {
  try {
    const record = await Progress.findByPk(req.params.progress_id);
    if (!record)
      return res.status(404).json({ message: "Progress record not found" });

    await record.update(req.body);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a progress record
export const deleteProgress = async (req, res) => {
  try {
    const record = await Progress.findByPk(req.params.progress_id);
    if (!record)
      return res.status(404).json({ message: "Progress record not found" });

    await record.destroy();
    res.json({ message: "Progress record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= STUDENT PROGRESS TRACKING ================= */

// Get progress for a specific student
export const getStudentProgress = async (req, res) => {
  try {
    const { master_id } = req.params;

    // Verify user can access this student's progress
    if (req.user.role_id === 'STU' && req.user.userId !== master_id) {
      return res.status(403).json({ error: "Access denied. Students can only view their own progress." });
    }

    const progressRecords = await Progress.findAll({
      where: { thesis_id: master_id },
      include: [{
        model: master_stu,
        as: 'student',
        attributes: ['master_id', 'FirstName', 'LastName', 'EmailId']
      }],
      order: [['date_updated', 'DESC']]
    });

    // Get current stage (most recent record)
    const currentStage = progressRecords.length > 0 ? progressRecords[0] : null;

    res.json({
      student_id: master_id,
      current_stage: currentStage,
      progress_history: progressRecords,
      total_records: progressRecords.length
    });

  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update student progress stage
export const updateStudentProgress = async (req, res) => {
  try {
    const { master_id } = req.params;
    const { new_stage, remarks, deadline, progress_percentage } = req.body;
    const { userId, role_id, table } = req.user;

    // Validate the new stage
    if (!Object.values(PROGRESS_STAGES).includes(new_stage)) {
      return res.status(400).json({
        error: "Invalid progress stage",
        valid_stages: Object.values(PROGRESS_STAGES)
      });
    }

    // Check if user has permission to update to this stage
    if (!STAGE_PERMISSIONS[new_stage].includes(role_id)) {
      return res.status(403).json({
        error: `Role ${role_id} cannot update progress to ${new_stage} stage`,
        allowed_roles: STAGE_PERMISSIONS[new_stage]
      });
    }

    // Get current progress
    const currentProgress = await Progress.findOne({
      where: { thesis_id: master_id },
      order: [['date_updated', 'DESC']]
    });

    const currentStage = currentProgress ? currentProgress.status : null;

    // Validate transition if there's a current stage
    if (currentStage && !VALID_TRANSITIONS[currentStage].includes(new_stage)) {
      return res.status(400).json({
        error: `Invalid transition from ${currentStage} to ${new_stage}`,
        valid_transitions: VALID_TRANSITIONS[currentStage]
      });
    }

    // Additional authorization checks
    if (role_id === 'SUV') {
      // Supervisors can only update students they supervise
      const student = await master_stu.findByPk(master_id);
      if (!student || student.supervisor_id !== userId) {
        return res.status(403).json({ error: "Supervisors can only update progress for their assigned students" });
      }
    }

    if (role_id === 'EXA') {
      // Examiners can only update students they examine
      const student = await master_stu.findByPk(master_id);
      if (!student || student.examiner_id !== userId) {
        return res.status(403).json({ error: "Examiners can only update progress for their assigned students" });
      }
    }

    // Create new progress record
    const newProgressRecord = await Progress.create({
      thesis_id: master_id,
      milestone_type: new_stage,
      status: new_stage,
      deadline: deadline || null,
      progress_percentage: progress_percentage || null,
      remarks: remarks || null,
      date_updated: new Date()
    });

    // Log the progress change
    await auditLogger({
      userId: req.user.email,
      action: AUDIT_ACTIONS.PROGRESS_UPDATED,
      userRole: role_id,
      entityType: ENTITY_TYPES.PROGRESS,
      entityId: newProgressRecord.progress_id.toString(),
      details: `Updated student ${master_id} progress from ${currentStage || 'None'} to ${new_stage}`,
      oldValues: currentStage ? { stage: currentStage } : null,
      newValues: { stage: new_stage, remarks, deadline, progress_percentage },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.id
    });

    // Log auth event (keeping for backward compatibility)
    await logAuthEvent(req.user.email, role_id, AUDIT_ACTIONS.PROGRESS_UPDATED, req);

    // Send notifications based on the progress update
    await sendProgressUpdateNotifications(master_id, new_stage, currentStage, role_id, userId);

    res.json({
      message: "Progress updated successfully",
      progress_record: newProgressRecord,
      previous_stage: currentStage,
      new_stage: new_stage
    });

  } catch (error) {
    console.error('Update student progress error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get progress statistics for admin/supervisor dashboard
export const getProgressStatistics = async (req, res) => {
  try {
    const { role_id, userId } = req.user;

    let whereClause = {};

    // Filter by assigned students for supervisors/examiners
    if (role_id === 'SUV') {
      const assignedStudents = await master_stu.findAll({
        where: { supervisor_id: userId },
        attributes: ['master_id']
      });
      whereClause.thesis_id = assignedStudents.map(s => s.master_id);
    } else if (role_id === 'EXA') {
      const assignedStudents = await master_stu.findAll({
        where: { examiner_id: userId },
        attributes: ['master_id']
      });
      whereClause.thesis_id = assignedStudents.map(s => s.master_id);
    }

    // Get latest progress for each student
    const latestProgress = await Progress.findAll({
      where: whereClause,
      attributes: [
        'thesis_id',
        [Progress.sequelize.fn('MAX', Progress.sequelize.col('date_updated')), 'latest_update']
      ],
      group: ['thesis_id']
    });

    const thesisIds = latestProgress.map(p => p.thesis_id);

    const currentProgressRecords = await Progress.findAll({
      where: {
        thesis_id: thesisIds
      },
      include: [{
        model: master_stu,
        as: 'student',
        attributes: ['master_id', 'FirstName', 'LastName', 'EmailId']
      }],
      order: [['date_updated', 'DESC']]
    });

    // Group by status
    const stats = {
      total_students: thesisIds.length,
      by_stage: {}
    };

    Object.values(PROGRESS_STAGES).forEach(stage => {
      stats.by_stage[stage] = [];
    });

    currentProgressRecords.forEach(record => {
      if (stats.by_stage[record.status]) {
        stats.by_stage[record.status].push({
          student_id: record.thesis_id,
          student_name: `${record.student.FirstName} ${record.student.LastName}`,
          last_updated: record.date_updated,
          remarks: record.remarks
        });
      }
    });

    res.json(stats);

  } catch (error) {
    console.error('Get progress statistics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get progress history for a student (detailed timeline)
export const getProgressHistory = async (req, res) => {
  try {
    const { master_id } = req.params;

    // Verify user can access this student's progress
    if (req.user.role_id === 'STU' && req.user.userId !== master_id) {
      return res.status(403).json({ error: "Access denied. Students can only view their own progress." });
    }

    const progressHistory = await Progress.findAll({
      where: { thesis_id: master_id },
      include: [{
        model: master_stu,
        as: 'student',
        attributes: ['master_id', 'FirstName', 'LastName', 'EmailId']
      }],
      order: [['date_updated', 'ASC']] // Chronological order
    });

    // Calculate time spent in each stage
    const timeline = progressHistory.map((record, index) => {
      const nextRecord = progressHistory[index + 1];
      const timeSpent = nextRecord ?
        new Date(nextRecord.date_updated) - new Date(record.date_updated) :
        null;

      return {
        stage: record.status,
        entered_at: record.date_updated,
        exited_at: nextRecord ? nextRecord.date_updated : null,
        time_spent_days: timeSpent ? Math.ceil(timeSpent / (1000 * 60 * 60 * 24)) : null,
        remarks: record.remarks,
        progress_percentage: record.progress_percentage,
        deadline: record.deadline
      };
    });

    res.json({
      student_id: master_id,
      timeline: timeline,
      total_stages: timeline.length,
      current_stage: timeline.length > 0 ? timeline[timeline.length - 1].stage : null
    });

  } catch (error) {
    console.error('Get progress history error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send notifications for progress updates
 */
const sendProgressUpdateNotifications = async (studentId, newStage, previousStage, updaterRole, updaterId) => {
  try {
    // Get student and related users
    const student = await master_stu.findByPk(studentId, {
      include: [
        { model: supervisor, as: 'supervisor' },
        { model: examiner, as: 'examiner' }
      ]
    });

    if (!student) return;

    // Notify student of progress update
    if (student.IsVerified) {
      await createNotification({
        recipientId: student.master_id,
        recipientRole: 'STU',
        type: NOTIFICATION_TYPES.PROGRESS_UPDATE,
        message: `Your thesis progress has been updated to ${newStage}${previousStage ? ` from ${previousStage}` : ''}.`,
        relatedEntity: {
          type: 'PROGRESS',
          id: studentId
        },
        actionUrl: '/progress'
      });
    }

    // Notify supervisor (if not the updater)
    if (student.supervisor && student.supervisor.SupID !== updaterId) {
      await createNotification({
        recipientId: student.supervisor.SupID,
        recipientRole: 'SUV',
        type: NOTIFICATION_TYPES.PROGRESS_UPDATE,
        message: `Progress for student ${student.FirstName} ${student.LastName} has been updated to ${newStage}.`,
        relatedEntity: {
          type: 'PROGRESS',
          id: studentId
        },
        actionUrl: `/students/${studentId}/progress`
      });
    }

    // Notify examiner for certain stages
    if (student.examiner && ['Final', 'Examined', 'Completed'].includes(newStage)) {
      await createNotification({
        recipientId: student.examiner.ExamID,
        recipientRole: 'EXA',
        type: NOTIFICATION_TYPES.PROGRESS_UPDATE,
        message: `Student ${student.FirstName} ${student.LastName} has reached ${newStage} stage.`,
        relatedEntity: {
          type: 'PROGRESS',
          id: studentId
        },
        actionUrl: `/students/${studentId}/progress`
      });
    }

    // Notify admins for completion
    if (newStage === PROGRESS_STAGES.COMPLETED) {
      // This would notify all CGSADM users - implementation depends on how admins are retrieved
      console.log(`Thesis completed for student ${studentId} - admin notification would be sent here`);
    }

  } catch (error) {
    console.error('Error sending progress update notifications:', error);
    // Don't throw error to avoid breaking the main flow
  }
};