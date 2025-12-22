# Security Implementation Guide

This document outlines the comprehensive security measures implemented in the PG Progress backend application.

## 🔒 Security Features Overview

### 1. Rate Limiting & Brute Force Protection

#### Implementation
- **express-rate-limit** middleware for request throttling
- Redis-backed rate limiting for distributed environments
- Different limits for different endpoint types

#### Rate Limits
```javascript
// General API endpoints
max: 100 requests per 15 minutes

// Authentication endpoints
max: 5 login attempts per 15 minutes

// Password reset
max: 3 requests per hour

// File uploads
max: 10 uploads per hour

// Admin actions
max: 20 actions per hour
```

#### Configuration
```bash
# Environment variables
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Input Validation & Sanitization

#### express-validator Integration
- Comprehensive input validation for all endpoints
- Automatic error handling and security event logging
- Custom sanitization functions for XSS prevention

#### Validation Rules
```javascript
// Email validation
- Required, valid format, normalized
- Length limit: 255 characters

// Password validation
- Minimum 8 characters
- Must contain uppercase, lowercase, and numbers
- Maximum 128 characters

// File uploads
- Type validation (PDF, DOC, DOCX only)
- Size limits (10MB maximum)
- Content validation
```

#### SQL Injection Prevention
- Pattern-based detection for suspicious input
- Automatic blocking and logging of attempts
- Comprehensive request body/query/params checking

### 3. HTTPS & Transport Security

#### HTTPS Enforcement
```javascript
// Automatic redirection to HTTPS in production
if (process.env.NODE_ENV === 'production' && !req.secure) {
  res.redirect(`https://${req.header('host')}${req.url}`);
}
```

#### Secure Cookies
```javascript
cookie: {
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  httpOnly: true,    // Prevent XSS access
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  sameSite: 'strict' // CSRF protection
}
```

### 4. CORS Configuration

#### Secure CORS Setup
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy violation"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

#### Environment Configuration
```bash
# Development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Production
ALLOWED_ORIGINS=https://yourdomain.com
```

### 5. Security Headers (Helmet.js)

#### Content Security Policy
```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"]
  }
}
```

#### Additional Headers
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS filtering
- `Strict-Transport-Security` - HSTS enforcement
- `Referrer-Policy: strict-origin-when-cross-origin`

### 6. Additional Security Measures

#### HTTP Parameter Pollution Protection
```javascript
import hpp from 'hpp';
app.use(hpp({
  whitelist: ['recipientIds', 'fileIds', 'userIds']
}));
```

#### Request Size Limiting
```javascript
// 10MB maximum request size
const contentLength = parseInt(req.headers['content-length']);
if (contentLength > 10 * 1024 * 1024) {
  return res.status(413).json({ error: 'Request too large' });
}
```

#### Request Timeout
```javascript
// 30 second timeout for all requests
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    res.status(408).json({ error: 'Request timeout' });
  }, 30000);

  res.on('finish', () => clearTimeout(timeout));
  next();
});
```

#### Suspicious Activity Monitoring
```javascript
// Log unusual request patterns
if (req.url.length > 2000) {
  logSecurityEvent('LONG_URL_DETECTED', { url: req.url });
}
```

## 🔍 Security Event Logging

### Audit Trail Categories
- Rate limit violations
- Validation failures
- SQL injection attempts
- File upload violations
- Suspicious activity
- Authentication failures

### Log Structure
```javascript
{
  userId: "user@example.com",
  action: "RATE_LIMIT_EXCEEDED",
  userRole: "SYSTEM",
  entityType: "SECURITY",
  details: "Rate limit exceeded for /api/auth/login",
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  sessionId: "session_123",
  status: "WARNING"
}
```

## 🛡️ Route Protection

### Authentication Middleware
```javascript
// All routes require authentication
router.use(protect(['STU', 'SUV', 'EXA', 'CGSADM']));
```

### RBAC Integration
```javascript
// Permission-based access control
router.post('/upload',
  requirePermission(PERMISSIONS.UPLOAD_DOCUMENTS),
  uploadDocument
);
```

### Input Validation Integration
```javascript
// Comprehensive validation
router.post('/login',
  validateLogin,
  login
);
```

## 📊 Security Monitoring

### Health Check Endpoint
```bash
GET /health
# Returns system status and security metrics
```

### Security Metrics
- Rate limit hits per endpoint
- Validation failure rates
- Security event counts
- Failed authentication attempts

## 🔧 Configuration

### Environment Variables
```bash
# Security settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://yourdomain.com
VALID_API_KEYS=key1,key2,key3

# Session security
SESSION_SECRET=your-secure-secret-here
JWT_SECRET=your-jwt-secret-here
```

### File Upload Security
```javascript
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

## 🚨 Security Incident Response

### Automated Responses
1. **Rate Limit Exceeded**: Temporary IP blocking, security event logging
2. **SQL Injection Detected**: Request blocking, security alert
3. **Validation Failure**: Input sanitization, security logging
4. **Suspicious Activity**: Enhanced monitoring, potential blocking

### Manual Investigation
1. Check audit logs for security events
2. Review IP addresses and user agents
3. Analyze request patterns
4. Update security rules if needed

## 🔄 Security Updates

### Regular Maintenance
- Update dependencies regularly
- Review and update security headers
- Monitor security advisories
- Update rate limiting rules based on usage patterns

### Security Testing
```bash
# Run security tests
npm run security-test

# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

## 📚 Security Best Practices

### Development
- Never commit secrets to version control
- Use environment-specific configurations
- Implement comprehensive input validation
- Log security events appropriately

### Production
- Use HTTPS exclusively
- Implement proper firewall rules
- Regular security audits
- Monitor logs for suspicious activity

### Monitoring
- Set up alerts for security events
- Regular log review
- Performance monitoring
- Security metric tracking

## 🆘 Emergency Contacts

In case of security incidents:
1. Immediately isolate affected systems
2. Preserve logs and evidence
3. Contact security team
4. Follow incident response plan
5. Notify affected users if necessary

## 📋 Compliance

This security implementation helps meet common security standards:
- OWASP Top 10 protection
- GDPR compliance for data protection
- SOC 2 security controls
- Industry best practices for web application security