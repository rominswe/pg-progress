import express from "express";
import {
  getAllProgress,
  getProgressById,
  createProgress,
  updateProgress,
  deleteProgress,
  getStudentProgress,
  updateStudentProgress,
  getProgressStatistics,
  getProgressHistory,
  PROGRESS_STAGES,
  VALID_TRANSITIONS
} from "../controllers/progressController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requirePermission, requireRole, requireOwnership } from "../middleware/rbacMiddleware.js";
import { PERMISSIONS } from "../config/rbac.js";
import {
  validateProgressUpdate,
  validateUserId,
  validatePagination
} from "../utils/validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Progress Tracking
 *   description: Postgraduate progress tracking and milestone management
 */

/**
 * @swagger
 * /api/v1/progress:
 *   get:
 *     summary: Get all progress records
 *     description: Retrieve all postgraduate progress records with pagination. Requires VIEW_ALL_PROGRESS permission.
 *     tags: [Progress Tracking]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of records per page
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *           enum: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *         description: Filter by progress stage
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, suspended, terminated]
 *         description: Filter by progress status
 *     responses:
 *       200:
 *         description: Progress records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       progress_id:
 *                         type: integer
 *                         example: 1
 *                       master_id:
 *                         type: integer
 *                         example: 12345
 *                       current_stage:
 *                         type: string
 *                         enum: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *                         example: literature_review
 *                       status:
 *                         type: string
 *                         enum: [active, completed, suspended, terminated]
 *                         example: active
 *                       progress_percentage:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 100
 *                         example: 35.5
 *                       expected_completion_date:
 *                         type: string
 *                         format: date
 *                         example: 2024-12-31
 *                       last_updated:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:30:00Z
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-09-01T09:00:00Z
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     pages:
 *                       type: integer
 *                       example: 8
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
 * /api/v1/progress/{progress_id}:
 *   get:
 *     summary: Get progress record by ID
 *     description: Retrieve a specific progress record. Students can view their own progress, supervisors/examiners can view assigned students.
 *     tags: [Progress Tracking]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: progress_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Progress record ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Progress record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress_id:
 *                       type: integer
 *                       example: 1
 *                     master_id:
 *                       type: integer
 *                       example: 12345
 *                     current_stage:
 *                       type: string
 *                       enum: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *                       example: literature_review
 *                     status:
 *                       type: string
 *                       enum: [active, completed, suspended, terminated]
 *                       example: active
 *                     progress_percentage:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                       example: 35.5
 *                     expected_completion_date:
 *                       type: string
 *                       format: date
 *                       example: 2024-12-31
 *                     supervisor_comments:
 *                       type: string
 *                       example: Good progress on literature review
 *                     examiner_feedback:
 *                       type: string
 *                       example: Methodology needs refinement
 *                     last_updated:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:30:00Z
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-09-01T09:00:00Z
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions or not authorized to view this progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Progress record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/progress:
 *   post:
 *     summary: Create new progress record
 *     description: Create a new postgraduate progress tracking record. Requires APPROVE_STUDENT_ACTIONS permission.
 *     tags: [Progress Tracking]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - master_id
 *               - current_stage
 *               - expected_completion_date
 *             properties:
 *               master_id:
 *                 type: integer
 *                 description: Student master ID
 *                 example: 12345
 *               current_stage:
 *                 type: string
 *                 enum: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *                 description: Current progress stage
 *                 example: proposal
 *               status:
 *                 type: string
 *                 enum: [active, completed, suspended, terminated]
 *                 default: active
 *                 description: Progress status
 *                 example: active
 *               progress_percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 default: 0
 *                 description: Progress percentage
 *                 example: 10
 *               expected_completion_date:
 *                 type: string
 *                 format: date
 *                 description: Expected completion date
 *                 example: 2024-12-31
 *               supervisor_comments:
 *                 type: string
 *                 description: Supervisor comments
 *                 example: Initial progress record created
 *     responses:
 *       201:
 *         description: Progress record created successfully
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
 *                   example: Progress record created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress_id:
 *                       type: integer
 *                       example: 1
 *                     master_id:
 *                       type: integer
 *                       example: 12345
 *                     current_stage:
 *                       type: string
 *                       example: proposal
 *                     status:
 *                       type: string
 *                       example: active
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-09-01T09:00:00Z
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

/**
 * @swagger
 * /api/v1/progress/{progress_id}:
 *   put:
 *     summary: Update progress record
 *     description: Update an existing progress record. Requires APPROVE_STUDENT_ACTIONS permission.
 *     tags: [Progress Tracking]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: progress_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Progress record ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_stage:
 *                 type: string
 *                 enum: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *                 description: Updated progress stage
 *                 example: literature_review
 *               status:
 *                 type: string
 *                 enum: [active, completed, suspended, terminated]
 *                 description: Updated progress status
 *                 example: active
 *               progress_percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Updated progress percentage
 *                 example: 35.5
 *               expected_completion_date:
 *                 type: string
 *                 format: date
 *                 description: Updated expected completion date
 *                 example: 2024-12-31
 *               supervisor_comments:
 *                 type: string
 *                 description: Updated supervisor comments
 *                 example: Good progress on literature review
 *               examiner_feedback:
 *                 type: string
 *                 description: Updated examiner feedback
 *                 example: Methodology looks solid
 *     responses:
 *       200:
 *         description: Progress record updated successfully
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
 *                   example: Progress record updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress_id:
 *                       type: integer
 *                       example: 1
 *                     master_id:
 *                       type: integer
 *                       example: 12345
 *                     current_stage:
 *                       type: string
 *                       example: literature_review
 *                     status:
 *                       type: string
 *                       example: active
 *                     progress_percentage:
 *                       type: number
 *                       example: 35.5
 *                     last_updated:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:30:00Z
 *       400:
 *         description: Validation error or invalid stage transition
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
 *       404:
 *         description: Progress record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/progress/{progress_id}:
 *   delete:
 *     summary: Delete progress record
 *     description: Delete a progress record. Requires MANAGE_SYSTEM permission (admin only).
 *     tags: [Progress Tracking]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: progress_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Progress record ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Progress record deleted successfully
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
 *                   example: Progress record deleted successfully
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
 *       404:
 *         description: Progress record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/progress/student/{master_id}:
 *   get:
 *     summary: Get student progress
 *     description: Retrieve progress records for a specific student. Students can view their own progress, supervisors/examiners can view assigned students.
 *     tags: [Progress Tracking]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: master_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student master ID
 *         example: 12345
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Student progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       progress_id:
 *                         type: integer
 *                         example: 1
 *                       master_id:
 *                         type: integer
 *                         example: 12345
 *                       current_stage:
 *                         type: string
 *                         enum: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *                         example: literature_review
 *                       status:
 *                         type: string
 *                         enum: [active, completed, suspended, terminated]
 *                         example: active
 *                       progress_percentage:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 100
 *                         example: 35.5
 *                       expected_completion_date:
 *                         type: string
 *                         format: date
 *                         example: 2024-12-31
 *                       last_updated:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:30:00Z
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     pages:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions or not authorized to view this student's progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/progress/student/{master_id}/stage:
 *   put:
 *     summary: Update student progress stage
 *     description: Update the progress stage for a specific student. Requires APPROVE_STUDENT_ACTIONS permission.
 *     tags: [Progress Tracking]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: master_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student master ID
 *         example: 12345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_stage
 *             properties:
 *               new_stage:
 *                 type: string
 *                 enum: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *                 description: New progress stage
 *                 example: data_collection
 *               comments:
 *                 type: string
 *                 description: Comments about the stage change
 *                 example: Student has completed literature review and is ready to move to data collection
 *     responses:
 *       200:
 *         description: Student progress stage updated successfully
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
 *                   example: Progress stage updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress_id:
 *                       type: integer
 *                       example: 1
 *                     master_id:
 *                       type: integer
 *                       example: 12345
 *                     previous_stage:
 *                       type: string
 *                       example: literature_review
 *                     current_stage:
 *                       type: string
 *                       example: data_collection
 *                     progress_percentage:
 *                       type: number
 *                       example: 45.0
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:30:00Z
 *       400:
 *         description: Validation error or invalid stage transition
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
 *       404:
 *         description: Student or progress record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/progress/statistics:
 *   get:
 *     summary: Get progress statistics
 *     description: Retrieve progress statistics and dashboard data. Requires VIEW_ALL_PROGRESS permission.
 *     tags: [Progress Tracking]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Progress statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_students:
 *                       type: integer
 *                       example: 150
 *                     active_students:
 *                       type: integer
 *                       example: 120
 *                     completed_students:
 *                       type: integer
 *                       example: 25
 *                     suspended_students:
 *                       type: integer
 *                       example: 3
 *                     terminated_students:
 *                       type: integer
 *                       example: 2
 *                     stage_distribution:
 *                       type: object
 *                       properties:
 *                         proposal:
 *                           type: integer
 *                           example: 15
 *                         literature_review:
 *                           type: integer
 *                           example: 35
 *                         data_collection:
 *                           type: integer
 *                           example: 28
 *                         analysis:
 *                           type: integer
 *                           example: 22
 *                         writing:
 *                           type: integer
 *                           example: 12
 *                         defense_preparation:
 *                           type: integer
 *                           example: 5
 *                         final_defense:
 *                           type: integer
 *                           example: 2
 *                         completion:
 *                           type: integer
 *                           example: 1
 *                     average_progress:
 *                       type: number
 *                       example: 42.5
 *                     on_time_completion_rate:
 *                       type: number
 *                       example: 78.5
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
 * /api/v1/progress/student/{master_id}/history:
 *   get:
 *     summary: Get student progress history
 *     description: Retrieve detailed progress history and timeline for a specific student. Students can view their own history, supervisors/examiners can view assigned students.
 *     tags: [Progress Tracking]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: master_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student master ID
 *         example: 12345
 *     responses:
 *       200:
 *         description: Student progress history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       history_id:
 *                         type: integer
 *                         example: 1
 *                       progress_id:
 *                         type: integer
 *                         example: 1
 *                       master_id:
 *                         type: integer
 *                         example: 12345
 *                       previous_stage:
 *                         type: string
 *                         enum: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *                         nullable: true
 *                         example: proposal
 *                       new_stage:
 *                         type: string
 *                         enum: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *                         example: literature_review
 *                       previous_percentage:
 *                         type: number
 *                         nullable: true
 *                         example: 5.0
 *                       new_percentage:
 *                         type: number
 *                         example: 25.0
 *                       comments:
 *                         type: string
 *                         example: Completed initial proposal draft
 *                       changed_by:
 *                         type: integer
 *                         description: User ID who made the change
 *                         example: 1001
 *                       changed_by_role:
 *                         type: string
 *                         example: supervisor
 *                       changed_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:30:00Z
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions or not authorized to view this student's history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/progress/stages:
 *   get:
 *     summary: Get available progress stages
 *     description: Retrieve the list of available progress stages, valid transitions, and permissions for the progress tracking system.
 *     tags: [Progress Tracking]
 *     responses:
 *       200:
 *         description: Progress stages information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stages:
 *                   type: array
 *                   items:
 *                     type: string
 *                     enum: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *                   example: [proposal, literature_review, data_collection, analysis, writing, defense_preparation, final_defense, completion]
 *                 permissions:
 *                   type: object
 *                   description: Available permissions for progress operations
 *                   properties:
 *                     VIEW_ALL_PROGRESS:
 *                       type: string
 *                       example: view_all_progress
 *                     APPROVE_STUDENT_ACTIONS:
 *                       type: string
 *                       example: approve_student_actions
 *                     MANAGE_SYSTEM:
 *                       type: string
 *                       example: manage_system
 *                 transitions:
 *                   type: object
 *                   description: Valid stage transitions
 *                   properties:
 *                     proposal:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [literature_review]
 *                       example: [literature_review]
 *                     literature_review:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [data_collection]
 *                       example: [data_collection]
 *                     data_collection:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [analysis]
 *                       example: [analysis]
 *                     analysis:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [writing]
 *                       example: [writing]
 *                     writing:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [defense_preparation]
 *                       example: [defense_preparation]
 *                     defense_preparation:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [final_defense]
 *                       example: [final_defense]
 *                     final_defense:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [completion]
 *                       example: [completion]
 *                     completion:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 */

// All routes require authentication
router.use(protect());

// Progress listing - different access levels
router.get("/", validatePagination, requirePermission(PERMISSIONS.VIEW_ALL_PROGRESS), getAllProgress);

// Individual progress access - students can view their own, supervisors/examiners can view assigned
router.get("/:progress_id",
  validateUserId,
  requireOwnership('progress_id'), // Students can view their own progress
  getProgressById
);

// Progress creation - academic staff and admins
router.post("/", requirePermission(PERMISSIONS.APPROVE_STUDENT_ACTIONS), createProgress);

// Progress updates - academic staff and admins
router.put("/:progress_id",
  validateUserId,
  validateProgressUpdate,
  requirePermission(PERMISSIONS.APPROVE_STUDENT_ACTIONS),
  updateProgress
);

// Progress deletion - admin only
router.delete("/:progress_id", validateUserId, requirePermission(PERMISSIONS.MANAGE_SYSTEM), deleteProgress);

/* ================= STUDENT PROGRESS TRACKING ================= */

// Get progress for a specific student
router.get("/student/:master_id",
  validateUserId,
  validatePagination,
  requireOwnership('master_id'), // Students can view their own, staff can view assigned
  getStudentProgress
);

// Update student progress stage
router.put("/student/:master_id/stage",
  requirePermission(PERMISSIONS.APPROVE_STUDENT_ACTIONS), // Academic staff and admins
  updateStudentProgress
);

// Get progress statistics (dashboard)
router.get("/statistics",
  requirePermission(PERMISSIONS.VIEW_ALL_PROGRESS),
  getProgressStatistics
);

// Get detailed progress history/timeline for a student
router.get("/student/:master_id/history",
  requireOwnership('master_id'),
  getProgressHistory
);

// Get available progress stages (for frontend)
router.get("/stages", (req, res) => {
  res.json({
    stages: PROGRESS_STAGES,
    permissions: PERMISSIONS,
    transitions: VALID_TRANSITIONS
  });
});

export default router;