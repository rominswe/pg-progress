# Environment Configuration Guide

This guide explains how to configure and run the PG Progress backend application in different environments: Development, Staging, and Production.

## Environment Files

The application uses environment-specific configuration files:

- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

## Configuration Variables

### Database Configuration
```bash
DB_HOST=your-database-host
DB_PORT=3306
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
```

### Redis Configuration
```bash
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

### Session Configuration
```bash
SESSION_SECRET=your-secure-session-secret-min-32-chars
```

### Email Configuration
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Application URLs
```bash
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://another-allowed-domain.com
```

### Server Configuration
```bash
PORT=5000
NODE_ENV=development|staging|production
```

### JWT Configuration
```bash
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
```

### Security Settings
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug|info|warn|error
```

## Development Environment

### Local Development with Docker

1. **Prerequisites:**
   - Docker and Docker Compose installed
   - Node.js 18+ (for local development without Docker)

2. **Setup:**
   ```bash
   cd server
   # The .env.development file is already configured for local development
   ```

3. **Run with Docker:**
   ```bash
   docker-compose up --build
   ```

4. **Run locally (without Docker):**
   ```bash
   npm install
   npm run dev
   ```

5. **Database Setup:**
   - MySQL runs on port 3307
   - Redis runs on port 6379
   - phpMyAdmin available at http://localhost:8080

### Access Points:
- Backend API: http://localhost:5000
- Frontend User: http://localhost:5173
- Frontend Admin: http://localhost:5174

## Staging Environment

### Docker Deployment

1. **Configure `.env.staging`:**
   - Update database connection to staging database
   - Update Redis connection to staging Redis
   - Update email settings for staging
   - Update frontend/backend URLs to staging domains

2. **Run:**
   ```bash
   docker-compose -f docker-compose.staging.yaml up --build -d
   ```

### Manual Deployment

1. **Install dependencies:**
   ```bash
   npm install --production
   ```

2. **Run database migrations:**
   ```bash
   npm run migrate:staging
   ```

3. **Seed initial data:**
   ```bash
   npm run seed:staging
   ```

4. **Start the application:**
   ```bash
   npm run staging
   ```

### Access Points:
- Backend API: http://localhost:5001 (or configured port)
- Frontend User: http://localhost:5175
- Frontend Admin: http://localhost:5176

## Production Environment

### Prerequisites:
- Production database (MySQL/Aurora)
- Production Redis instance
- SSL certificates
- Reverse proxy (nginx recommended)
- Process manager (PM2 recommended)

### Deployment Steps:

1. **Configure `.env.production`:**
   - Update all production database/Redis connections
   - Update production email settings
   - Update production URLs
   - Ensure strong secrets are used

2. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

3. **Install dependencies:**
   ```bash
   npm install --production
   ```

4. **Run database migrations:**
   ```bash
   npm run migrate:prod
   ```

5. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   ```

### Docker Production (Alternative):

```bash
docker-compose -f docker-compose.production.yaml up --build -d
```

### Nginx Configuration Example:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # ... rest of the configuration
}
```

## Environment-Specific Features

### Session Security:
- Development: `secure: false` (allows HTTP)
- Staging/Production: `secure: true` (requires HTTPS)

### CORS Origins:
- Configurable via `ALLOWED_ORIGINS` environment variable
- Supports multiple origins separated by commas

### Logging:
- Development: Debug level logging
- Staging: Info level logging
- Production: Warn level logging

### Database:
- Development: Local MySQL container
- Staging: Dedicated staging database
- Production: Production database with backups

## Security Considerations

### Secrets Management:
- Never commit `.env` files to version control
- Use strong, unique secrets for each environment
- Rotate secrets regularly
- Consider using secret management services (AWS Secrets Manager, Azure Key Vault)

### Database Security:
- Use dedicated database users with minimal privileges
- Enable SSL connections in production
- Regular database backups
- Monitor for suspicious activity

### Network Security:
- Use HTTPS in staging and production
- Configure firewalls appropriately
- Use VPN for database access if needed
- Implement rate limiting

## Monitoring and Maintenance

### Health Checks:
- Application health endpoint: `GET /api/health`
- Database connectivity checks
- Redis connectivity checks

### Logs:
- Application logs are written to console
- Configure log aggregation in production (ELK stack, CloudWatch, etc.)
- Monitor for errors and security events

### Backups:
- Database backups scheduled regularly
- Configuration backups
- Log archiving

## Troubleshooting

### Common Issues:

1. **Database Connection Failed:**
   - Check database credentials in `.env` file
   - Ensure database server is running and accessible
   - Check network connectivity

2. **Redis Connection Failed:**
   - Check Redis host and port in `.env` file
   - Ensure Redis server is running

3. **Session Issues:**
   - Check `SESSION_SECRET` is set and strong
   - Ensure Redis is accessible for session storage

4. **CORS Errors:**
   - Check `ALLOWED_ORIGINS` includes frontend domain
   - Ensure correct protocol (http/https)

5. **Email Not Sending:**
   - Check email credentials in `.env` file
   - Verify SMTP server settings
   - Check spam folder

### Debug Mode:
Run with debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

## Migration Between Environments

When promoting code from development to staging/production:

1. Update environment-specific configurations
2. Run database migrations if schema changes
3. Update DNS records if needed
4. Test all functionality in new environment
5. Update monitoring and alerting
6. Notify stakeholders of the deployment

## Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP
- **Password Reset**: 3 requests per hour per IP
- **File Uploads**: 10 uploads per hour per IP
- **Admin Actions**: 20 actions per hour per IP

### Input Validation & Sanitization
- Email validation and normalization
- Password strength requirements (8+ chars, mixed case, numbers)
- SQL injection prevention with pattern detection
- XSS prevention with input sanitization
- File upload validation (type, size, content)

### HTTPS Enforcement
- Automatic HTTPS redirection in production
- Secure cookie settings (httpOnly, secure, sameSite)
- HSTS headers for enhanced security

### CORS Configuration
- Configurable allowed origins via `ALLOWED_ORIGINS` environment variable
- Strict origin validation
- Proper preflight handling

### Security Headers (Helmet.js)
- Content Security Policy (CSP)
- XSS protection
- Clickjacking prevention (X-Frame-Options)
- MIME type sniffing protection
- Referrer policy configuration

### Additional Security Measures
- HTTP Parameter Pollution (HPP) protection
- Request size limiting (10MB max)
- Suspicious activity logging
- Request timeout protection (30 seconds)
- Comprehensive audit logging for security events