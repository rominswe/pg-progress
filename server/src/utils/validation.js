import { body, param, query, validationResult } from 'express-validator';
import { logSecurityEvent } from './audit.js';

/* ================= VALIDATION ERROR HANDLER ================= */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log security event for validation failures
    logSecurityEvent(
      req.session?.user?.email || req.body?.email || 'unknown',
      'VALIDATION_FAILED',
      `Validation failed for ${req.originalUrl}: ${errors.array().map(err => err.msg).join(', ')}`,
      req.ip,
      req.get('user-agent'),
      req.session?.id
    );

    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/* ================= INPUT SANITIZATION ================= */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/* ================= COMMON VALIDATION RULES ================= */

// Email validation
export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address')
  .isLength({ max: 255 })
  .withMessage('Email must be less than 255 characters');

// Password validation
export const validatePassword = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be between 8 and 128 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');

// Role validation
export const validateRole = body('role_id')
  .isIn(['CGSADM', 'SUV', 'STU', 'EXA', 'EXCGS'])
  .withMessage('Invalid role specified');

// User ID validation
export const validateUserId = param('id')
  .isInt({ min: 1 })
  .withMessage('User ID must be a positive integer');

// File upload validation
export const validateFileUpload = (allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      logSecurityEvent(
        req.session?.user?.email || 'unknown',
        'INVALID_FILE_TYPE',
        `Attempted to upload file with invalid type: ${req.file.mimetype}`,
        req.ip,
        req.get('user-agent'),
        req.session?.id
      );
      return res.status(400).json({
        error: 'Invalid file type',
        allowedTypes
      });
    }

    // Check file size
    if (req.file.size > maxSize) {
      logSecurityEvent(
        req.session?.user?.email || 'unknown',
        'FILE_TOO_LARGE',
        `Attempted to upload file too large: ${req.file.size} bytes`,
        req.ip,
        req.get('user-agent'),
        req.session?.id
      );
      return res.status(400).json({
        error: 'File too large',
        maxSize: `${maxSize / (1024 * 1024)}MB`
      });
    }

    next();
  };
};

/* ================= AUTHENTICATION VALIDATION ================= */
export const validateLogin = [
  validateEmail,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRole,
  handleValidationErrors
];

export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
  validatePassword,
  validateRole,
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  handleValidationErrors
];

export const validatePasswordReset = [
  validateEmail,
  handleValidationErrors
];

export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  validatePassword,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors
];

/* ================= USER MANAGEMENT VALIDATION ================= */
export const validateUserUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Pending'])
    .withMessage('Invalid status value'),
  body('role_id')
    .optional()
    .isIn(['CGSADM', 'SUV', 'STU', 'EXA', 'EXCGS'])
    .withMessage('Invalid role specified'),
  handleValidationErrors
];

/* ================= DOCUMENT VALIDATION ================= */
export const validateDocumentUpload = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters')
    .customSanitizer(sanitizeInput),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
    .customSanitizer(sanitizeInput),
  body('documentType')
    .optional()
    .isIn(['thesis', 'proposal', 'report', 'other'])
    .withMessage('Invalid document type'),
  handleValidationErrors
];

export const validateDocumentReview = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Document ID must be a positive integer'),
  body('status')
    .isIn(['approved', 'rejected', 'revision_required'])
    .withMessage('Invalid status value'),
  body('comments')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Comments must be less than 2000 characters')
    .customSanitizer(sanitizeInput),
  handleValidationErrors
];

/* ================= PROGRESS VALIDATION ================= */
export const validateProgressUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Progress ID must be a positive integer'),
  body('stage')
    .optional()
    .isIn(['draft', 'submitted', 'under_review', 'revision_required', 'approved', 'rejected'])
    .withMessage('Invalid progress stage'),
  body('comments')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Comments must be less than 2000 characters')
    .customSanitizer(sanitizeInput),
  body('percentage')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Percentage must be between 0 and 100'),
  handleValidationErrors
];

/* ================= NOTIFICATION VALIDATION ================= */
export const validateNotificationCreate = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters')
    .customSanitizer(sanitizeInput),
  body('message')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
    .customSanitizer(sanitizeInput),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'error', 'success'])
    .withMessage('Invalid notification type'),
  body('recipientIds')
    .optional()
    .isArray()
    .withMessage('Recipient IDs must be an array'),
  body('recipientIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Recipient ID must be a positive integer'),
  handleValidationErrors
];

/* ================= QUERY PARAMETER VALIDATION ================= */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'status', 'email'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  handleValidationErrors
];

/* ================= SQL INJECTION PREVENTION ================= */
export const validateSqlInjection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    /('|(\\x27)|(\\x2D\\x2D)|(\\#)|(\\x23)|(\-\-)|(\;)|(\\x3B))/i,
    /(<script|javascript:|on\w+=)/i
  ];

  const checkValue = (value, field) => {
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          logSecurityEvent(
            req.session?.user?.email || 'unknown',
            'SQL_INJECTION_ATTEMPT',
            `Potential SQL injection attempt in field ${field}: ${value.substring(0, 100)}`,
            req.ip,
            req.get('user-agent'),
            req.session?.id
          );
          return res.status(400).json({
            error: 'Invalid input detected',
            field
          });
        }
      }
    }
  };

  // Check all request data
  const checkObject = (obj, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fieldName = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        checkObject(value, fieldName);
      } else {
        checkValue(value, fieldName);
      }
    }
  };

  checkObject(req.body);
  checkObject(req.query);
  checkObject(req.params);

  next();
};