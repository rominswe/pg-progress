# Audit Logging and Activity Tracking System

This document describes the comprehensive audit logging and activity tracking system implemented in the PG Progress application.

## Overview

The audit logging system provides complete visibility into user activities, system events, and security-related actions. It supports compliance requirements, troubleshooting, and accountability tracking.

## Features

### 🔍 **Comprehensive Logging**
- **Authentication Events**: Login, logout, failed attempts, session management
- **User Management**: Account creation, updates, role changes, verification
- **Document Operations**: Upload, download, version control, deletion
- **Progress Tracking**: Stage changes, approvals, updates
- **System Events**: API access, security alerts, maintenance activities
- **Notification Events**: Creation, delivery, user interactions

### 📊 **Advanced Querying**
- Filter by user, action type, entity, date range
- Pagination support for large datasets
- Export capabilities (JSON/CSV) for compliance reporting
- Real-time statistics and analytics

### 🔒 **Security Integration**
- RBAC-compliant access controls
- Session tracking and correlation
- IP address and user agent logging
- Suspicious activity detection

### 🏗️ **Database Schema**

```sql
CREATE TABLE audit_logs (
  audit_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  user_role VARCHAR(20) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id VARCHAR(100) NULL,
  details TEXT NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NULL,
  session_id VARCHAR(255) NULL,
  status ENUM('SUCCESS', 'FAILURE', 'WARNING') NOT NULL DEFAULT 'SUCCESS',
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_action (user_id, action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_timestamp (created_at),
  INDEX idx_status (status)
);
```

## API Endpoints

### Audit Log Management

```
GET    /api/audit/logs              # Get audit logs with filtering
GET    /api/audit/logs/:id          # Get specific audit log
GET    /api/audit/stats             # Get audit statistics
GET    /api/audit/constants         # Get audit constants
GET    /api/audit/export            # Export audit logs
POST   /api/audit/cleanup           # Clean up old logs (admin only)
```

### Query Parameters

- `userId`: Filter by user ID
- `action`: Filter by action type
- `entityType`: Filter by entity type
- `entityId`: Filter by entity ID
- `status`: Filter by status (SUCCESS/FAILURE/WARNING)
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `limit`: Number of records (default: 50)
- `offset`: Pagination offset (default: 0)
- `sortBy`: Sort field (default: created_at)
- `sortOrder`: Sort order (ASC/DESC, default: DESC)

## Usage Examples

### Basic Logging

```javascript
import { auditLog, AUDIT_ACTIONS, AUDIT_STATUS } from './utils/audit.js';

// Log a user action
await auditLog({
  userId: 'user@example.com',
  action: AUDIT_ACTIONS.DOCUMENT_UPLOAD,
  userRole: 'STU',
  entityType: 'DOCUMENT',
  entityId: 'doc123',
  details: 'Uploaded thesis chapter 1',
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
  sessionId: req.session?.id
});
```

### Querying Audit Logs

```javascript
import { getAuditLogs } from './utils/audit.js';

// Get recent login attempts
const loginLogs = await getAuditLogs({
  action: AUDIT_ACTIONS.LOGIN,
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  limit: 100
});

// Get failed authentication attempts
const failedLogins = await getAuditLogs({
  action: AUDIT_ACTIONS.LOGIN_FAILED,
  status: AUDIT_STATUS.FAILURE,
  limit: 50
});
```

### Activity Tracking Middleware

The system automatically logs API access for authenticated requests:

```javascript
// This is automatically added to all routes
app.use(logApiAccess); // Logs all authenticated API calls
```

## Action Types

### Authentication & Session
- `LOGIN` - Successful login
- `LOGOUT` - User logout
- `LOGIN_FAILED` - Failed login attempt
- `SESSION_EXPIRED` - Session timeout
- `ACCOUNT_VERIFICATION` - Email verification

### User Management
- `USER_CREATED` - New user registration
- `USER_UPDATED` - Profile updates
- `USER_DELETED` - Account deletion
- `USER_ROLE_CHANGED` - Role modifications
- `USER_VERIFIED` - Account verification

### Document Operations
- `DOCUMENT_UPLOAD` - File uploads
- `DOCUMENT_DOWNLOAD` - File downloads
- `DOCUMENT_DELETE` - File deletion
- `DOCUMENT_VERSION_CREATED` - Version updates
- `DOCUMENT_REVIEW` - Review actions

### Progress Tracking
- `PROGRESS_CREATED` - New progress entries
- `PROGRESS_UPDATED` - Progress modifications
- `PROGRESS_STAGE_CHANGED` - Stage transitions

### System & Security
- `API_ACCESS` - API endpoint access
- `SECURITY_ALERT` - Security events
- `SUSPICIOUS_ACTIVITY` - Suspicious behavior
- `ACCESS_DENIED` - Permission failures
- `SYSTEM_MAINTENANCE` - Admin operations

## Entity Types

- `USER` - User accounts
- `DOCUMENT` - Document files
- `PROGRESS` - Progress records
- `NOTIFICATION` - Notification records
- `SESSION` - User sessions
- `SYSTEM` - System operations
- `ROLE` - User roles
- `PERMISSION` - Access permissions

## Status Types

- `SUCCESS` - Operation completed successfully
- `FAILURE` - Operation failed
- `WARNING` - Operation completed with warnings

## Migration

To migrate from the old audit log system:

```bash
# Run the migration script
npm run migrate
```

This will:
1. Backup the existing `AuditLog` table
2. Create the new `audit_logs` table
3. Migrate existing data with appropriate mappings
4. Update indexes for optimal performance

## Maintenance

### Cleanup Old Logs

```javascript
import { cleanupAuditLogs } from './utils/audit.js';

// Remove logs older than 1 year
await cleanupAuditLogs(365);
```

### Monitor Log Growth

Regular monitoring of log table size is recommended:

```sql
SELECT
  COUNT(*) as total_logs,
  MIN(created_at) as oldest_log,
  MAX(created_at) as newest_log
FROM audit_logs;
```

## Security Considerations

1. **Access Control**: Audit logs are only accessible to administrators
2. **Data Retention**: Implement appropriate retention policies
3. **Encryption**: Consider encrypting sensitive log data at rest
4. **Integrity**: Logs should be tamper-proof for compliance
5. **Performance**: Monitor query performance on large datasets

## Compliance

This audit system supports:
- **GDPR**: User activity tracking and data access logging
- **SOX**: Financial system activity monitoring
- **ISO 27001**: Information security event logging
- **Educational Compliance**: Student data access tracking

## Troubleshooting

### Common Issues

1. **High Database Load**: Add appropriate indexes or archive old logs
2. **Large Log Files**: Implement log rotation and cleanup policies
3. **Performance Issues**: Use pagination and limit result sets
4. **Missing Logs**: Check middleware order and error handling

### Debug Logging

Enable debug logging to troubleshoot audit issues:

```javascript
// In server.js
process.env.AUDIT_DEBUG = 'true';
```

## Future Enhancements

- Real-time log streaming
- Advanced analytics and reporting
- Integration with SIEM systems
- Automated alerting for suspicious activities
- Log encryption and digital signatures