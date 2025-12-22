# Postgraduate Progress Tracking System

A modern and efficient web platform designed to streamline thesis supervision, submission, and communication between students, supervisors, and administrators. This system supports structured supervision workflows, file submission, progress tracking, and role-based access control.

## Features

- **Role-Based Access Control**:
    - Separate dashboards for Admin, Supervisor, and Student.
    - Permissions and view restrictions based on user roles.

- **Dashboard**:
    - Overview of submissions, active supervision, and notifications.
    - Charts and status counts to visualize student progress.

- **Thesis Submission & Tracking**:
    - Students can upload thesis files and track review status.
    - Supervisors can accept, review, or request revisions.

- **Status workflow includes**:
    - Draft → Submitted → Under Review → Revision Required → Approved/Rejected

- **Feedback & Revision Workflow**:
    - Supervisors leave comments or revision notes.
    - Students can upload revised documents.
    - Version history is maintained for clarity.

- **Document Management**:
    - Secure file uploading and storage.
    - File versioning for every resubmission.
    - Download and preview options.

- **Supervisor Tools**:
    - Manage student lists.
    - View thesis history & timeline.
    - Track progress and deadlines.

- **Admin Tools**:
    - Create and manage user accounts.
    - Assign supervisors to students.
    - System settings and monitoring.

- **Profile Management**:
    - Users can edit personal info.
    - Upload/change profile photos.

## Workflow (Example)
1. **Thesis Creation**
  - Student uploads file → Status: *Draft*
  - Student submits → Status: *Submitted*
2. **Supervisor Review**
  - Supervisor opens submission
    - If okay → Approved
    - If needs changes → Revision Required
3. **Revision Cycle**
  - Student views supervisor's comments.
  - Student reuploads revised file → Status: *Resubmitted*
  - Supervisor reviews again.
4. **Final Decision**
  - Supervisor approves or rejects thesis.
  - Status becomes Approved or Rejected.

<!-- 

## Security Features

- **Rate Limiting**: Prevents brute-force attacks and API abuse
- **Input Validation**: Comprehensive validation and sanitization
- **HTTPS Enforcement**: Automatic redirection to secure connections
- **Security Headers**: Helmet.js implementation with CSP, HSTS, and XSS protection
- **CORS Configuration**: Strict origin validation for frontend integration
- **Audit Logging**: Complete activity tracking for compliance and security monitoring

For detailed security implementation, see [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md).

### Frontend
- React (Vite)
- JavaScript
- Tailwind CSS
- React Router
- Lucide React (icons)
- Docker

### Backend
- Node.js
- Express.js
- MySQL
- Redis (Session Store)
- Docker

## Dependencies
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Redis
- Docker & Docker Compose

## Quick Start

### Development Environment

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pg-progress
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example server/.env.development
   # Edit server/.env.development with your local configuration
   ```

3. **Start with Docker:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend User: http://localhost:5173
   - Frontend Admin: http://localhost:5174
   - Backend API: http://localhost:5000
   - phpMyAdmin: http://localhost:8080

### Other Environments

For detailed setup instructions for staging and production environments, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).

## Project Architecture 

-->
