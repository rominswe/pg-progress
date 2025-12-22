# AIU PG Progress Server

A Node.js/Express backend server for the AIU Postgraduate Progress Tracking System with Redis-based session authentication.

## Features

- **Session-based Authentication** with Redis store
- **Role-based Access Control (RBAC)**
- **Secure HTTP-only cookies**
- **Session fixation protection**
- **Account status enforcement**
- **Audit logging**
- **Email verification system**

## Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Session Store**: Redis
- **Authentication**: bcrypt for password hashing
- **Email**: Nodemailer for notifications

## Environment Variables

Create a `.env` file in the server root with the following variables:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3307
DB_NAME=aiu_pg_progress
DB_USER=root
DB_PASSWORD=root

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Session Configuration
SESSION_SECRET=your-secure-session-secret-change-this-in-production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=yourapppassword

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Environment
NODE_ENV=development
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Redis:**
   - Install Redis server locally or use Docker
   - Start Redis server on port 6379

3. **Set up MySQL database:**
   - Create database: `aiu_pg_progress`
   - Run the SQL dump from `aiu_pg_progress.sql`

4. **Seed admin user:**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Authentication System

### Session Configuration

The server uses Redis-backed sessions with the following security features:

- **HTTP-only cookies** to prevent XSS attacks
- **Secure cookies** in production (HTTPS only)
- **SameSite=strict** for CSRF protection
- **Session regeneration** after login to prevent session fixation
- **7-day expiration** with rolling updates on activity

### Authentication Endpoints

#### POST `/auth/login`
Login with email, password, and role.

**Request Body:**
```json
{
  "email": "user@aiu.edu.my",
  "password": "password123",
  "role_id": "STU"
}
```

**Success Response (200):**
```json
{
  "role": "Student",
  "user": {
    "id": "STU001",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400`: Missing fields
- `401`: Invalid credentials, account inactive/expired
- `403`: Account pending verification
- `500`: Internal server error

#### POST `/auth/logout`
Destroy session and clear cookies.

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

#### GET `/auth/validate-session`
Validate current session and user status.

**Success Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "STU001",
    "email": "user@aiu.edu.my",
    "role": "STU",
    "name": "John Doe"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Session expired or invalid"
}
```

#### GET `/auth/me`
Get current user profile (requires authentication).

**Success Response (200):**
Returns full user object from database.

#### PATCH `/auth/me`
Update current user profile (requires authentication).

**Request Body:**
```json
{
  "Password": "newpassword123",
  "Phonenumber": "+60123456789",
  "Profile_Image": "image.jpg"
}
```

### User Roles

- `STU`: Student
- `SUV`: Supervisor
- `EXA`: Examiner
- `CGSADM`: CGS Admin
- `EXCGS`: Executive of CGS
- `EXEB`: Executives Business
- `EXEC`: Executives SCI
- `EXES`: Executives Human Science
- `HRD`: Human Resources Director
- `SAD`: Student Affair Director
- `SCID`: School Of Computing and Informatics Dean
- `SEHSD`: School Of Education & Human Sciences Dean
- `SBSSD`: School Of Business and Social Science Dean
- `CFGSD`: Centre for Foundation and General Studies Dean
- `CFLD`: Language Center Dean
- `SGH`: Security Guard
- `ISU`: International Student Unit

### Middleware

#### `protect(roles?)`
Authentication middleware that:
- Validates session existence
- Re-fetches user from database
- Checks account status
- Enforces role-based access (optional)

**Usage:**
```javascript
import { protect } from './middleware/authmiddleware.js';

// Require authentication
router.get('/protected', protect(), handler);

// Require specific roles
router.get('/admin-only', protect(['CGSADM', 'HRD']), handler);
```

### Security Features

1. **Password Security:**
   - Bcrypt hashing with salt rounds
   - Temporary passwords for new accounts
   - Password change enforcement

2. **Session Security:**
   - Redis-backed sessions
   - Session ID regeneration on login
   - Automatic cleanup on logout
   - Secure cookie configuration

3. **Account Security:**
   - Account status validation
   - Login attempt monitoring
   - Audit logging for all auth events
   - Email verification for new accounts

4. **Rate Limiting:**
   - Login attempt tracking
   - Account lockout on failed attempts

## API Response Codes

- `200`: Success
- `201`: Created (registration)
- `400`: Bad Request (missing/invalid fields)
- `401`: Unauthorized (invalid credentials/session)
- `403`: Forbidden (insufficient permissions/pending account)
- `404`: Not Found
- `409`: Conflict (email already exists)
- `500`: Internal Server Error

## Development

### Project Structure

```
server/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server startup
│   ├── config/
│   │   ├── config.js       # Database models
│   │   └── redis.js        # Redis client
│   ├── controllers/
│   │   └── authController.js # Authentication logic
│   ├── middleware/
│   │   ├── authmiddleware.js # Auth middleware
│   │   └── rbacMiddleware.js # Role-based access
│   ├── routes/
│   │   └── authRoutes.js   # Auth endpoints
│   ├── models/             # Sequelize models
│   ├── utils/              # Utilities (email, auth security)
│   └── seeds/              # Database seeds
├── Dockerfile              # Container configuration
├── package.json
└── README.md
```

### Testing Authentication

1. **Start Redis and MySQL**
2. **Run the server:** `npm run dev`
3. **Test login:**
   ```bash
   curl -X POST http://localhost:5000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@aiu.edu.my","password":"admin123","role_id":"CGSADM"}' \
     --cookie-jar cookies.txt
   ```
4. **Test protected route:**
   ```bash
   curl -X GET http://localhost:5000/auth/me \
     --cookie cookies.txt
   ```

## Production Deployment

1. **Environment Setup:**
   - Set `NODE_ENV=production`
   - Use strong `SESSION_SECRET`
   - Configure HTTPS
   - Set secure Redis connection

2. **Docker Deployment:**
   ```bash
   docker build -t aiu-server .
   docker run -p 5000:5000 --env-file .env aiu-server
   ```

3. **Security Checklist:**
   - Change default session secret
   - Use HTTPS in production
   - Configure Redis authentication
   - Set up proper CORS origins
   - Monitor session store usage

## Troubleshooting

### Common Issues

1. **Redis Connection Failed:**
   - Ensure Redis is running on correct port
   - Check Redis configuration in `.env`

2. **Session Not Persisting:**
   - Verify Redis connectivity
   - Check cookie settings in browser dev tools

3. **CORS Errors:**
   - Update allowed origins in `app.js`
   - Ensure credentials are included in requests

4. **Database Connection Issues:**
   - Verify MySQL credentials
   - Check database exists and is accessible

### Logs

Check server logs for authentication events:
- Login attempts (success/failure)
- Session creation/destruction
- Account status changes

## Contributing

1. Follow existing code style
2. Add proper error handling
3. Update documentation for API changes
4. Test authentication flows thoroughly