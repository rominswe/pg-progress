import cron from 'node-cron';
import { createNotification, NOTIFICATION_TYPES } from './notifications.js';
import { progress, master_stu, supervisor } from '../config/config.js';

/**
 * Notification scheduler for automated notifications
 */
class NotificationScheduler {
  constructor() {
    this.scheduledJobs = new Map();
  }

  /**
   * Start the notification scheduler
   */
  start() {
    console.log('Starting notification scheduler...');

    // Daily deadline reminders (9 AM)
    this.scheduleJob('deadline-reminders', '0 9 * * *', this.sendDeadlineReminders.bind(this));

    // Weekly progress reminders (Monday 10 AM)
    this.scheduleJob('weekly-progress-reminders', '0 10 * * 1', this.sendWeeklyProgressReminders.bind(this));

    // Verification reminders (every 3 days)
    this.scheduleJob('verification-reminders', '0 8 */3 * *', this.sendVerificationReminders.bind(this));

    // Meeting reminders (1 hour before)
    this.scheduleJob('meeting-reminders', '0 * * * *', this.sendMeetingReminders.bind(this));

    console.log('Notification scheduler started successfully');
  }

  /**
   * Stop the notification scheduler
   */
  stop() {
    console.log('Stopping notification scheduler...');

    for (const [name, job] of this.scheduledJobs) {
      job.destroy();
      console.log(`Stopped scheduled job: ${name}`);
    }

    this.scheduledJobs.clear();
    console.log('Notification scheduler stopped');
  }

  /**
   * Schedule a cron job
   */
  scheduleJob(name, cronExpression, task) {
    try {
      const job = cron.schedule(cronExpression, task, {
        scheduled: false // Don't start immediately
      });

      this.scheduledJobs.set(name, job);
      job.start();

      console.log(`Scheduled job '${name}' with cron: ${cronExpression}`);

    } catch (error) {
      console.error(`Failed to schedule job '${name}':`, error);
    }
  }

  /**
   * Send deadline reminders for upcoming submissions
   */
  async sendDeadlineReminders() {
    try {
      console.log('Sending deadline reminders...');

      // Get progress entries with upcoming deadlines (within 7 days)
      const upcomingDeadlines = await progress.findAll({
        where: {
          status: ['IN_PROGRESS', 'PENDING_REVIEW'],
          expected_completion_date: {
            [progress.sequelize.Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            [progress.sequelize.Op.gte]: new Date() // Not in the past
          }
        },
        include: [
          {
            model: master_stu,
            as: 'student',
            attributes: ['StuID', 'StuName', 'EmailId', 'IsVerified']
          },
          {
            model: supervisor,
            as: 'supervisor',
            attributes: ['SupID', 'SupName', 'EmailId']
          }
        ]
      });

      let reminderCount = 0;

      for (const progressEntry of upcomingDeadlines) {
        const daysUntilDeadline = Math.ceil(
          (new Date(progressEntry.expected_completion_date) - new Date()) / (1000 * 60 * 60 * 24)
        );

        // Send reminder to student
        if (progressEntry.student && progressEntry.student.IsVerified) {
          await createNotification({
            recipientId: progressEntry.student.StuID,
            recipientRole: 'STU',
            type: NOTIFICATION_TYPES.DEADLINE_REMINDER,
            message: `Your ${progressEntry.stage_name} submission is due in ${daysUntilDeadline} day(s). Please ensure all requirements are completed.`,
            relatedEntity: {
              type: 'PROGRESS',
              id: progressEntry.progress_id
            },
            actionUrl: `/progress/${progressEntry.progress_id}`
          });
          reminderCount++;
        }

        // Send reminder to supervisor
        if (progressEntry.supervisor) {
          await createNotification({
            recipientId: progressEntry.supervisor.SupID,
            recipientRole: 'SUV',
            type: NOTIFICATION_TYPES.DEADLINE_REMINDER,
            message: `Student ${progressEntry.student?.StuName || 'Unknown'} has a ${progressEntry.stage_name} submission due in ${daysUntilDeadline} day(s).`,
            relatedEntity: {
              type: 'PROGRESS',
              id: progressEntry.progress_id
            },
            actionUrl: `/progress/${progressEntry.progress_id}`
          });
          reminderCount++;
        }
      }

      console.log(`Sent ${reminderCount} deadline reminders`);

    } catch (error) {
      console.error('Error sending deadline reminders:', error);
    }
  }

  /**
   * Send weekly progress update reminders
   */
  async sendWeeklyProgressReminders() {
    try {
      console.log('Sending weekly progress reminders...');

      // Get all active students
      const activeStudents = await master_stu.findAll({
        where: {
          IsVerified: 1,
          status: 'ACTIVE'
        },
        attributes: ['StuID', 'StuName', 'EmailId']
      });

      let reminderCount = 0;

      for (const student of activeStudents) {
        await createNotification({
          recipientId: student.StuID,
          recipientRole: 'STU',
          type: NOTIFICATION_TYPES.PROGRESS_UPDATE,
          message: 'This is a weekly reminder to update your progress. Please log any recent activities or milestones achieved.',
          actionUrl: '/progress'
        });
        reminderCount++;
      }

      console.log(`Sent ${reminderCount} weekly progress reminders`);

    } catch (error) {
      console.error('Error sending weekly progress reminders:', error);
    }
  }

  /**
   * Send verification reminders to unverified users
   */
  async sendVerificationReminders() {
    try {
      console.log('Sending verification reminders...');

      // Get unverified users who haven't been reminded in the last 3 days
      const unverifiedUsers = await master_stu.findAll({
        where: {
          IsVerified: {
            [master_stu.sequelize.Op.or]: [0, null, false]
          },
          created_at: {
            [master_stu.sequelize.Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Created more than 1 day ago
          }
        },
        attributes: ['StuID', 'StuName', 'EmailId', 'created_at']
      });

      let reminderCount = 0;

      for (const user of unverifiedUsers) {
        const daysSinceCreation = Math.floor(
          (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
        );

        await createNotification({
          recipientId: user.StuID,
          recipientRole: 'STU',
          type: NOTIFICATION_TYPES.VERIFICATION_REMINDER,
          message: `Your account has been created ${daysSinceCreation} days ago but is not yet verified. Please verify your email to access all features.`,
          actionUrl: '/verify-email'
        });
        reminderCount++;
      }

      console.log(`Sent ${reminderCount} verification reminders`);

    } catch (error) {
      console.error('Error sending verification reminders:', error);
    }
  }

  /**
   * Send meeting reminders (1 hour before scheduled meetings)
   */
  async sendMeetingReminders() {
    try {
      console.log('Checking for upcoming meetings...');

      // This would integrate with a meetings table
      // For now, this is a placeholder for future implementation
      // when meeting scheduling is implemented

      console.log('Meeting reminders check completed');

    } catch (error) {
      console.error('Error sending meeting reminders:', error);
    }
  }

  /**
   * Manually trigger a specific notification job
   */
  async triggerJob(jobName) {
    const jobTasks = {
      'deadline-reminders': this.sendDeadlineReminders.bind(this),
      'weekly-progress-reminders': this.sendWeeklyProgressReminders.bind(this),
      'verification-reminders': this.sendVerificationReminders.bind(this),
      'meeting-reminders': this.sendMeetingReminders.bind(this)
    };

    const task = jobTasks[jobName];
    if (!task) {
      throw new Error(`Unknown job: ${jobName}`);
    }

    console.log(`Manually triggering job: ${jobName}`);
    await task();
    console.log(`Job ${jobName} completed`);
  }
}

// Export singleton instance
export const notificationScheduler = new NotificationScheduler();
export default notificationScheduler;