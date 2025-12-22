import express from "express";
import {
  login,
  register,
  verifyAccount,
  logout,
  me,
  updateMe,
  validateSession,
  resendVerification,
  checkVerificationStatus
} from "../controllers/authController.js";
import { protect } from "../middleware/authmiddleware.js";
import {
  validateLogin,
  validateRegistration,
  validatePasswordReset
} from "../utils/validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management endpoints
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: Create a new user account with role-based registration. Requires email verification before account activation.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: University email address
 *                 example: student@university.edu
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Secure password with at least 8 characters
 *                 example: SecurePass123!
 *               role:
 *                 type: string
 *                 enum: [student, supervisor, admin]
 *                 description: User role in the system
 *                 example: student
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: Doe
 *               depCode:
 *                 type: string
 *                 description: Department code (optional)
 *                 example: CS
 *     responses:
 *       201:
 *         description: Registration successful, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful. Please check your email for verification.
 *                 userId:
 *                   type: integer
 *                   example: 123
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests - rate limited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password. Returns JWT token and session information.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 sessionId:
 *                   type: string
 *                   description: Session ID for cookie-based auth
 *                   example: s%3Aabc123def456
 *       400:
 *         description: Invalid credentials or unverified account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts - rate limited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Destroy user session and clear authentication tokens.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/validate-session:
 *   get:
 *     summary: Validate current session
 *     description: Check if the current session is valid and return user information.
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Session is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Session invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/verify-account:
 *   get:
 *     summary: Verify user account
 *     description: Verify user account using verification code sent to email.
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification code from email
 *         example: ABC123XYZ
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, supervisor, admin]
 *         description: User role type
 *         example: student
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account verified successfully
 *       400:
 *         description: Invalid or expired verification code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     description: Resend account verification email to user.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@university.edu
 *               role:
 *                 type: string
 *                 enum: [student, supervisor, admin]
 *                 example: student
 *     responses:
 *       200:
 *         description: Verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Verification email sent successfully
 *       400:
 *         description: Invalid email or account already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests - rate limited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/check-verification-status:
 *   post:
 *     summary: Check verification status
 *     description: Check if user account is verified.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@university.edu
 *               role:
 *                 type: string
 *                 enum: [student, supervisor, admin]
 *                 example: student
 *     responses:
 *       200:
 *         description: Verification status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 isVerified:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Account not verified
 *       400:
 *         description: Invalid email or role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user information
 *     description: Retrieve information about the currently authenticated user.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/me:
 *   patch:
 *     summary: Update current user information
 *     description: Update profile information for the currently authenticated user.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@university.edu
 *     responses:
 *       200:
 *         description: User information updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/* ================= REGISTRATION ================= */
router.post("/register", validateRegistration, register); // expects { role, email, firstName, lastName, password, depCode, extraFields }

/* ================= DYNAMIC LOGIN ================= */
router.post("/login", validateLogin, login); // expects { email, password, role }

/* ================= LOGOUT ================= */
router.post("/logout", logout);

/* ================= SESSION VALIDATION ================= */
router.get("/validate-session", validateSession);

/* ================= VERIFY ACCOUNT ================= */
router.get("/verify-account", verifyAccount); // expects query params: ?code=<vcode>&type=<role>

/* ================= RESEND VERIFICATION ================= */
router.post("/resend-verification", validatePasswordReset, resendVerification); // expects { email, role }

/* ================= CHECK VERIFICATION STATUS ================= */
router.post("/check-verification-status", validatePasswordReset, checkVerificationStatus); // expects { email, role }

/* ================= CURRENT USER INFO ================= */
router.get("/me", protect(["STU", "EXA", "SUV", "CGSADM", "EXCGS"]), me);

/* ================= UPDATE CURRENT USER ================= */
router.patch("/me", protect(["STU", "EXA", "SUV", "CGSADM", "EXCGS"]), updateMe);

export default router;