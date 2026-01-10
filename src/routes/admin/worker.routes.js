import express from "express";
import { createWorker, getWorkers, getWorkerById, updateWorker, deleteWorker } from "../../controllers/admin/worker.controller.js";
import { authenticateToken, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

// Middleware: Admin Only
router.use(authenticateToken, requireAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin Workers
 *   description: Worker management
 */

/**
 * @swagger
 * /admin/workers:
 *   post:
 *     summary: Create a new worker
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Worker created
 *   get:
 *     summary: List all workers
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of workers
 */
router.post("/", createWorker);
router.get("/", getWorkers);

/**
 * @swagger
 * /admin/workers/{id}:
 *   get:
 *     summary: Get worker details
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Worker details
 *   put:
 *     summary: Update worker details
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Worker updated
 *   delete:
 *     summary: Delete a worker
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Worker deleted
 */
router.get("/:id", getWorkerById);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorker);

export default router;
