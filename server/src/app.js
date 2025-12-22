import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger.js";
import { logApiAccess } from "./middleware/activityTracking.js";
/* ================= SWAGGER DOCUMENTATION ================= */
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
/* ================= SECURITY MIDDLEWARE ================= */
import {
  securityHeaders,
  enforceHttps,
  preventHpp,
  limitRequestSize,
  corsOptions,
  logSuspiciousActivity,
  requestTimeout
} from "./middleware/security.js";
import {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  adminLimiter
} from "./middleware/rateLimiting.js";
import { validateSqlInjection } from "./utils/validation.js";
/* ================= ROUTES ================= */
import authRoutes from "./routes/authRoutes.js";
import empinfoRoutes from "./routes/empinfoRoutes.js";
import masterStuRoutes from "./routes/masterstuRoutes.js";
import programInfoRoutes from "./routes/programinfoRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import roleRoutes from "./routes/rolesRoutes.js";
import studentinfoRoutes from "./routes/studentInfoRoutes.js";
import supervisorRoutes from "./routes/supervisorRoutes.js";
import supervisoryMeetingRoutes from "./routes/supervisoryMeetingRoutes.js";
import tblDepartmentsRoutes from "./routes/tblDepartmentsRoutes.js";
import examinerRoutes from "./routes/examinerRoutes.js";
import visitingStaffRoutes from "./routes/visitingStaffRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import cgsRoutes from "./routes/cgsRoutes.js";
import notificationRoutes from "./routes/notifications.js";

/* ===== System / Security ===== */
import adminRoutes from "./routes/adminRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import loginAttemptRoutes from "./routes/loginAttemptRoutes.js";

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

// Fallback to .env if environment-specific file doesn't exist
if (!process.env.SESSION_SECRET) {
  dotenv.config({ path: '.env' });
}

import session from 'express-session';
import { RedisStore } from 'connect-redis';
import redisClient from './config/redis.js';

const app = express();

// ================= SECURITY MIDDLEWARE (ORDER MATTERS) =================
// 1. HTTPS Enforcement (before other middleware)
app.use(enforceHttps);

// 2. Security Headers
app.use(securityHeaders);

// 3. Request Size Limiting
app.use(limitRequestSize);

// 4. Suspicious Activity Logging
app.use(logSuspiciousActivity);

// 5. HTTP Parameter Pollution Protection
app.use(preventHpp);

// 6. CORS Configuration
app.use(cors(corsOptions));

// 7. Rate Limiting (General)
app.use('/api/v1/', generalLimiter);

// 8. Request Timeout
app.use(requestTimeout());

// 9. SQL Injection Prevention
app.use(validateSqlInjection);
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  name: 'sessionId', // Change default cookie name for security
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'strict', // CSRF protection
  },
}));
app.use(express.json());
app.use(cookieParser());
app.use(logger);
app.use(logApiAccess);

/* ================= SWAGGER CONFIGURATION ================= */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Postgraduate Progress Tracking API',
    version: '1.0.0',
    description: 'Comprehensive API for postgraduate progress tracking system with RBAC, audit logging, and secure file management',
    contact: {
      name: 'API Support',
      email: 'support@pgprogress.edu'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://api.pgprogress.edu/api/v1' 
        : `http://localhost:${process.env.PORT || 5000}/api/v1`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
      },
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sessionId',
        description: 'Session-based authentication using sessionId cookie'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' },
          error: { type: 'string', example: 'Error code' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', format: 'email', example: 'user@university.edu' },
          role: { type: 'string', example: 'student' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'student@university.edu' },
          password: { type: 'string', format: 'password', minLength: 8, example: 'SecurePass123!' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'role'],
        properties: {
          email: { type: 'string', format: 'email', example: 'student@university.edu' },
          password: { type: 'string', format: 'password', minLength: 8, example: 'SecurePass123!' },
          role: { type: 'string', enum: ['student', 'supervisor', 'admin'], example: 'student' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' }
        }
      }
    }
  },
  security: [
    { bearerAuth: [] },
    { sessionAuth: [] }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/models/*.js'] // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJSDoc(options);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    syntaxHighlight: {
      activate: true,
      theme: 'arta'
    },
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      // Add authorization header if token exists in localStorage (for browser testing)
      const token = localStorage.getItem('authToken');
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      return req;
    }
  }
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/* ================= HEALTH CHECK ENDPOINT ================= */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

/* ================= API ROUTES (v1) ================= */
// Authentication routes with specific rate limiting
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/forgot-password", passwordResetLimiter);
app.use("/api/v1/auth/reset-password", passwordResetLimiter);
app.use("/api/v1/auth", authRoutes);

// RBAC Test Routes (for development/testing)
import rbacTestRoutes from "./routes/rbacTestRoutes.js";
app.use("/api/v1/rbac", rbacTestRoutes);

// General API routes
app.use("/api/v1/empinfo", empinfoRoutes);
app.use("/api/v1/masterstu", masterStuRoutes);
app.use("/api/v1/cgs", cgsRoutes);
app.use("/api/v1/programs", programInfoRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/studentsinfo", studentinfoRoutes);
app.use("/api/v1/supervisors", supervisorRoutes);
app.use("/api/v1/examiners", examinerRoutes);
app.use("/api/v1/visiting-staff", visitingStaffRoutes);
app.use("/api/v1/supervisory-meetings", supervisoryMeetingRoutes);

// File upload routes with upload rate limiting
app.use("/api/v1/documents", uploadLimiter);
app.use("/api/v1/documents", documentRoutes);

// Admin routes with admin rate limiting
app.use("/api/v1/admin", adminLimiter);
app.use("/api/v1/admin", adminRoutes);

// Audit routes (read-only, less restrictive)
app.use("/api/v1/audit", auditLogRoutes);
app.use("/api/v1/loginattempts", loginAttemptRoutes);

// Notifications
app.use("/api/v1/notifications", notificationRoutes);
export default app;