import express from "express";
import { getAllUsers, getAllReports, getReportById } from "../../controllers/admin/admin.controller.js";
import { authenticateToken, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

// Apply middleware to all routes in this router
router.use(authenticateToken, requireAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin Data
 *   description: Admin data management
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all registered users
 *     tags: [Admin Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 10)
 *     responses:
 *       200:
 *         description: List of users with pagination
 */
router.get("/users", getAllUsers);

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     summary: List all reports with user details
 *     tags: [Admin Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 10)
 *     responses:
 *       200:
 *         description: List of reports with pagination
 */
router.get("/reports", getAllReports);

/**
 * @swagger
 * /admin/reports/{id}:
 *   get:
 *     summary: Get report details by ID
 *     tags: [Admin Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report details
 *       404:
 *         description: Not found
 */
router.get("/reports/:id", getReportById);

import { assignTask } from "../../controllers/admin/task.controller.js";

/**
 * @swagger
 * /admin/reports/{reportId}/assign:
 *   put:
 *     summary: Assign a report to a worker
 *     tags: [Admin Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workerId
 *             properties:
 *               workerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task assigned
 */
router.put("/reports/:reportId/assign", assignTask);

export default router;
