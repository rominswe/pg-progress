import { sequelize } from '../config/config.js';

const migration = {
  up: async () => {
    try {
      console.log('Starting audit log table migration...');

      // Check if the old table exists
      const [tables] = await sequelize.query("SHOW TABLES LIKE 'AuditLog'");
      const oldTableExists = tables.length > 0;

      if (oldTableExists) {
        console.log('Migrating existing AuditLog table...');

        // Rename old table
        await sequelize.query("RENAME TABLE AuditLog TO audit_logs_backup");

        // Create new audit_logs table with proper structure
        await sequelize.query(`
          CREATE TABLE audit_logs (
            audit_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL COMMENT 'User identifier (email, ID, etc.)',
            user_role VARCHAR(20) NOT NULL COMMENT 'User role at time of action',
            action VARCHAR(100) NOT NULL COMMENT 'Action performed',
            entity_type VARCHAR(50) NULL COMMENT 'Type of entity affected',
            entity_id VARCHAR(100) NULL COMMENT 'ID of the affected entity',
            details TEXT NULL COMMENT 'Detailed description of the action',
            old_values JSON NULL COMMENT 'Previous values before change',
            new_values JSON NULL COMMENT 'New values after change',
            ip_address VARCHAR(45) NOT NULL COMMENT 'Client IP address',
            user_agent TEXT NULL COMMENT 'Browser/client user agent',
            session_id VARCHAR(255) NULL COMMENT 'Session identifier for tracking',
            status ENUM('SUCCESS', 'FAILURE', 'WARNING') NOT NULL DEFAULT 'SUCCESS' COMMENT 'Outcome of the action',
            error_message TEXT NULL COMMENT 'Error details if action failed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of the action',
            INDEX idx_user_action (user_id, action),
            INDEX idx_entity (entity_type, entity_id),
            INDEX idx_timestamp (created_at),
            INDEX idx_status (status)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Migrate data from old table to new table
        await sequelize.query(`
          INSERT INTO audit_logs (
            user_id, user_role, action, ip_address, user_agent, status, created_at
          )
          SELECT
            email,
            role_id,
            CASE
              WHEN event = 'LOGIN_SUCCESS' THEN 'LOGIN'
              WHEN event = 'LOGIN_FAIL' THEN 'LOGIN_FAILED'
              WHEN event = 'LOGOUT' THEN 'LOGOUT'
              WHEN event = 'REGISTER' THEN 'USER_CREATED'
              WHEN event = 'VERIFY' THEN 'ACCOUNT_VERIFICATION'
              WHEN event = 'UPDATE_PROFILE' THEN 'USER_UPDATED'
              WHEN event = 'UPLOAD_DOCUMENT' THEN 'DOCUMENT_UPLOAD'
              WHEN event = 'DOWNLOAD_DOCUMENT' THEN 'DOCUMENT_DOWNLOAD'
              WHEN event = 'UPDATE_DOCUMENT' THEN 'DOCUMENT_VERSION_CREATED'
              WHEN event = 'DELETE_DOCUMENT' THEN 'DOCUMENT_DELETE'
              WHEN event = 'PROGRESS_UPDATE' THEN 'PROGRESS_UPDATED'
              ELSE event
            END,
            ip,
            userAgent,
            'SUCCESS',
            timestamp
          FROM audit_logs_backup
        `);

        console.log('Data migration completed. Old table backed up as audit_logs_backup');

      } else {
        console.log('Creating new audit_logs table...');

        // Create new audit_logs table
        await sequelize.query(`
          CREATE TABLE audit_logs (
            audit_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL COMMENT 'User identifier (email, ID, etc.)',
            user_role VARCHAR(20) NOT NULL COMMENT 'User role at time of action',
            action VARCHAR(100) NOT NULL COMMENT 'Action performed',
            entity_type VARCHAR(50) NULL COMMENT 'Type of entity affected',
            entity_id VARCHAR(100) NULL COMMENT 'ID of the affected entity',
            details TEXT NULL COMMENT 'Detailed description of the action',
            old_values JSON NULL COMMENT 'Previous values before change',
            new_values JSON NULL COMMENT 'New values after change',
            ip_address VARCHAR(45) NOT NULL COMMENT 'Client IP address',
            user_agent TEXT NULL COMMENT 'Browser/client user agent',
            session_id VARCHAR(255) NULL COMMENT 'Session identifier for tracking',
            status ENUM('SUCCESS', 'FAILURE', 'WARNING') NOT NULL DEFAULT 'SUCCESS' COMMENT 'Outcome of the action',
            error_message TEXT NULL COMMENT 'Error details if action failed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of the action',
            INDEX idx_user_action (user_id, action),
            INDEX idx_entity (entity_type, entity_id),
            INDEX idx_timestamp (created_at),
            INDEX idx_status (status)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
      }

      console.log('Audit log migration completed successfully');

    } catch (error) {
      console.error('Audit log migration failed:', error);
      throw error;
    }
  },

  down: async () => {
    try {
      console.log('Rolling back audit log migration...');

      // Drop new table
      await sequelize.query("DROP TABLE IF EXISTS audit_logs");

      // Restore old table if backup exists
      const [tables] = await sequelize.query("SHOW TABLES LIKE 'audit_logs_backup'");
      if (tables.length > 0) {
        await sequelize.query("RENAME TABLE audit_logs_backup TO AuditLog");
        console.log('Restored original AuditLog table from backup');
      }

      console.log('Audit log rollback completed');

    } catch (error) {
      console.error('Audit log rollback failed:', error);
      throw error;
    }
  }
};

export default migration;