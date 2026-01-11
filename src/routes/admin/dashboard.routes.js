import express from "express";
import { getDashboardStats } from "../../controllers/admin/dashboard.controller.js";
import { authenticateToken, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken, requireAdmin);

/**
 * @swagger
 * tags:
 *   name: AdminDashboard
 *   description: Admin dashboard statistics
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [AdminDashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats, trends, and recent lists
 */
router.get("/", getDashboardStats);

export default router;
