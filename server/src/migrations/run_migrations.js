import { sequelize } from '../config/config.js';
import auditLogMigration from '../migrations/audit_log_migration.js';

/**
 * Database Migration Runner
 * Run this script to migrate the audit log table structure
 */

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run audit log migration
    console.log('📋 Running audit log migration...');
    await auditLogMigration.up();

    console.log('✅ All migrations completed successfully');

    // Close connection
    await sequelize.close();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Migration failed:', error);

    // Attempt rollback on failure
    try {
      console.log('🔄 Attempting rollback...');
      await auditLogMigration.down();
      console.log('✅ Rollback completed');
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError);
    }

    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };