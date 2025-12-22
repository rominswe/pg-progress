import { role } from "../config/config.js";

/**
 * Role-Based Access Control (RBAC) Configuration
 * Maps database roles to permissions and hierarchies
 */

// Role definitions from database
export const ROLES = {
  // Administrative Roles
  CGSADM: 'CGS Admin',
  EXCGS: 'Executive of CGS',
  HRD: 'Human Resources Director',

  // Academic Leadership
  SCID: 'School Of Computing and Informatics Dean',
  SBSSD: 'School Of Business and Social Science Dean',
  SEHSD: 'School Of Education & Human Sciences Dean',
  CFGSD: 'Centre for Foundation and General Studies Dean',
  CFLD: 'Language Center Dean',

  // Department Executives
  EXEC: 'Executives SCI',
  EXEB: 'Executives Business',
  EXES: 'Executives Human Science',

  // Academic Roles
  SUV: 'Supervisor',
  EXA: 'Examiner',

  // Support Roles
  SAD: 'Student Affair Director',
  ISU: 'International Student Unit',
  SGH: 'Security Guard',

  // User Roles
  STU: 'Student'
};

// Permission definitions
export const PERMISSIONS = {
  // User Management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',

  // Student Management
  MANAGE_STUDENTS: 'manage_students',
  VIEW_STUDENT_PROGRESS: 'view_student_progress',
  APPROVE_STUDENT_ACTIONS: 'approve_student_actions',

  // Supervisor Management
  MANAGE_SUPERVISORS: 'manage_supervisors',
  ASSIGN_SUPERVISOR: 'assign_supervisor',

  // Examiner Management
  MANAGE_EXAMINERS: 'manage_examiners',
  ASSIGN_EXAMINER: 'assign_examiner',

  // Academic Management
  MANAGE_PROGRAMS: 'manage_programs',
  MANAGE_DEPARTMENTS: 'manage_departments',
  VIEW_ALL_PROGRESS: 'view_all_progress',

  // Document Management
  UPLOAD_DOCUMENTS: 'upload_documents',
  REVIEW_DOCUMENTS: 'review_documents',
  APPROVE_DOCUMENTS: 'approve_documents',

  // System Administration
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_SYSTEM: 'manage_system',
  VIEW_ANALYTICS: 'view_analytics',

  // Security
  MANAGE_SECURITY: 'manage_security',
  VIEW_LOGIN_ATTEMPTS: 'view_login_attempts'
};

// Role-Permission mapping
export const ROLE_PERMISSIONS = {
  // CGS Admin - Full system access
  CGSADM: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_SUPERVISORS,
    PERMISSIONS.MANAGE_EXAMINERS,
    PERMISSIONS.MANAGE_PROGRAMS,
    PERMISSIONS.MANAGE_DEPARTMENTS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SECURITY,
    PERMISSIONS.VIEW_LOGIN_ATTEMPTS
  ],

  // Executive of CGS - High-level management
  EXCGS: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_SUPERVISORS,
    PERMISSIONS.MANAGE_EXAMINERS,
    PERMISSIONS.MANAGE_PROGRAMS,
    PERMISSIONS.MANAGE_DEPARTMENTS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_ANALYTICS
  ],

  // HR Director - User and personnel management
  HRD: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_SUPERVISORS,
    PERMISSIONS.MANAGE_EXAMINERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_LOGIN_ATTEMPTS
  ],

  // Deans - Department-level management
  SCID: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_SUPERVISORS,
    PERMISSIONS.MANAGE_EXAMINERS,
    PERMISSIONS.MANAGE_PROGRAMS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS,
    PERMISSIONS.VIEW_AUDIT_LOGS
  ],

  SBSSD: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_SUPERVISORS,
    PERMISSIONS.MANAGE_EXAMINERS,
    PERMISSIONS.MANAGE_PROGRAMS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS,
    PERMISSIONS.VIEW_AUDIT_LOGS
  ],

  SEHSD: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_SUPERVISORS,
    PERMISSIONS.MANAGE_EXAMINERS,
    PERMISSIONS.MANAGE_PROGRAMS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS,
    PERMISSIONS.VIEW_AUDIT_LOGS
  ],

  CFGSD: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_PROGRAMS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS
  ],

  CFLD: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_PROGRAMS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS
  ],

  // Department Executives
  EXEC: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_SUPERVISORS,
    PERMISSIONS.MANAGE_EXAMINERS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS
  ],

  EXEB: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_SUPERVISORS,
    PERMISSIONS.MANAGE_EXAMINERS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS
  ],

  EXES: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_SUPERVISORS,
    PERMISSIONS.MANAGE_EXAMINERS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS
  ],

  // Supervisors - Academic supervision
  SUV: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.VIEW_STUDENT_PROGRESS,
    PERMISSIONS.APPROVE_STUDENT_ACTIONS,
    PERMISSIONS.ASSIGN_SUPERVISOR,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.REVIEW_DOCUMENTS
  ],

  // Examiners - Assessment and evaluation
  EXA: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.VIEW_STUDENT_PROGRESS,
    PERMISSIONS.APPROVE_STUDENT_ACTIONS,
    PERMISSIONS.ASSIGN_EXAMINER,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.APPROVE_DOCUMENTS
  ],

  // Student Affairs Director
  SAD: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.VIEW_STUDENT_PROGRESS,
    PERMISSIONS.APPROVE_STUDENT_ACTIONS,
    PERMISSIONS.VIEW_AUDIT_LOGS
  ],

  // International Student Unit
  ISU: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.VIEW_STUDENT_PROGRESS
  ],

  // Security Guard - Limited access
  SGH: [
    PERMISSIONS.READ_USER
  ],

  // Students - Basic access
  STU: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.UPLOAD_DOCUMENTS
  ]
};

// Role hierarchy for inheritance
export const ROLE_HIERARCHY = {
  CGSADM: ['EXCGS', 'HRD', 'SCID', 'SBSSD', 'SEHSD', 'CFGSD', 'CFLD', 'EXEC', 'EXEB', 'EXES', 'SUV', 'EXA', 'SAD', 'ISU', 'SGH', 'STU'],
  EXCGS: ['SCID', 'SBSSD', 'SEHSD', 'CFGSD', 'CFLD', 'EXEC', 'EXEB', 'EXES', 'SUV', 'EXA', 'SAD', 'ISU', 'SGH', 'STU'],
  HRD: ['SUV', 'EXA', 'SAD', 'ISU', 'SGH', 'STU'],
  SCID: ['EXEC', 'SUV', 'EXA', 'STU'],
  SBSSD: ['EXEB', 'SUV', 'EXA', 'STU'],
  SEHSD: ['EXES', 'SUV', 'EXA', 'STU'],
  CFGSD: ['SUV', 'EXA', 'STU'],
  CFLD: ['SUV', 'EXA', 'STU'],
  EXEC: ['SUV', 'EXA', 'STU'],
  EXEB: ['SUV', 'EXA', 'STU'],
  EXES: ['SUV', 'EXA', 'STU'],
  SAD: ['ISU', 'SGH', 'STU'],
  SUV: ['STU'],
  EXA: ['STU'],
  ISU: ['STU'],
  SGH: [],
  STU: []
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) return false;
  return ROLE_PERMISSIONS[userRole].includes(permission);
};

/**
 * Check if a role can access another role's data (hierarchy check)
 */
export const canAccessRole = (userRole, targetRole) => {
  if (!userRole || !targetRole) return false;
  if (userRole === targetRole) return true;

  const accessibleRoles = ROLE_HIERARCHY[userRole] || [];
  return accessibleRoles.includes(targetRole);
};

/**
 * Get all permissions for a role including inherited ones
 */
export const getAllPermissions = (userRole) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) return [];
  return [...ROLE_PERMISSIONS[userRole]];
};

/**
 * Validate role exists in database
 */
export const validateRole = async (roleId) => {
  try {
    const roleRecord = await role.findByPk(roleId);
    return !!roleRecord;
  } catch (error) {
    console.error('Role validation error:', error);
    return false;
  }
};

/**
 * Get role information from database
 */
export const getRoleInfo = async (roleId) => {
  try {
    const roleRecord = await role.findByPk(roleId);
    return roleRecord ? {
      id: roleRecord.role_id,
      name: roleRecord.role_name,
      department: roleRecord.Dep_Code,
      created: roleRecord.Creation_Date
    } : null;
  } catch (error) {
    console.error('Role info retrieval error:', error);
    return null;
  }
};