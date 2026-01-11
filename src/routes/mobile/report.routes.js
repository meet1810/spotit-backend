import express from "express";
import { createReport, getUserReports, getReportById } from "../../controllers/mobile/report.controller.js";
import { upload } from "../../middleware/upload.js";

import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * /report:
 *   post:
 *     summary: Create a new report with image analysis
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 report:
 *                   type: object
 */
router.post("/report", authenticateToken, upload.single("image"), createReport);

/**
 * @swagger
 * /report/list:
 *   get:
 *     summary: Get all reports for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reports:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/report/list", authenticateToken, getUserReports);

/**
 * @swagger
 * /report/{id}:
 *   get:
 *     summary: Get a specific report by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 report:
 *                   type: object
 *       404:
 *         description: Report not found or unauthorized
 */
router.get("/report/:id", authenticateToken, getReportById);

export default router;
