import rateLimit from 'express-rate-limit';
import { logSecurityEvent } from '../utils/audit.js';

/* ================= GENERAL API RATE LIMITING ================= */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    // Log security event for rate limit violations
    logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl,
      method: req.method
    });

    res.status(options.statusCode).json(options.message);
  },
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/health' || req.path.startsWith('/static/');
  }
});

/* ================= AUTHENTICATION RATE LIMITING ================= */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    // Log security event for auth rate limit violations
    logSecurityEvent('AUTH_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      email: req.body?.email,
      endpoint: req.originalUrl
    });

    res.status(options.statusCode).json(options.message);
  },
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
  skipFailedRequests: false // Count failed attempts
});

/* ================= PASSWORD RESET RATE LIMITING ================= */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset requests from this IP, please try again after 1 hour.',
    retryAfter: 60 * 60 // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logSecurityEvent('PASSWORD_RESET_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      email: req.body?.email
    });

    res.status(options.statusCode).json(options.message);
  }
});

/* ================= FILE UPLOAD RATE LIMITING ================= */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 file uploads per hour
  message: {
    error: 'Too many file uploads from this IP, please try again after 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logSecurityEvent('UPLOAD_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.originalUrl
    });

    res.status(options.statusCode).json(options.message);
  }
});

/* ================= ADMIN ACTIONS RATE LIMITING ================= */
export const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit admin actions to 20 per hour
  message: {
    error: 'Too many admin actions from this IP, please try again after 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logSecurityEvent('ADMIN_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      user: req.session?.user?.email,
      endpoint: req.originalUrl
    });

    res.status(options.statusCode).json(options.message);
  }
});