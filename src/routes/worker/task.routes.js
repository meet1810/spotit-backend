import express from "express";
import { getOpenTasks } from "../../controllers/worker/task.controller.js";
import { authenticateToken, requireWorker } from "../../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken, requireWorker);

/**
 * @swagger
 * tags:
 *   name: Worker Tasks
 *   description: Worker task management
 */

/**
 * @swagger
 * /worker/tasks:
 *   get:
 *     summary: List open tasks (Pending Reports)
 *     tags: [Worker Tasks]
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
 *         description: List of pending tasks
 */
router.get("/", getOpenTasks);

import { claimTask, resolveTask } from "../../controllers/worker/task.controller.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * /worker/tasks/{id}/claim:
 *   post:
 *     summary: Claim a pending task
 *     tags: [Worker Tasks]
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
 *         description: Task claimed
 */
router.post("/:id/claim", claimTask);

/**
 * @swagger
 * /worker/tasks/{id}/resolve:
 *   post:
 *     summary: Resolve a task (Upload proof)
 *     tags: [Worker Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - latitude
 *               - longitude
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
 *         description: Task resolved and verified
 */
router.post("/:id/resolve", upload.single("image"), resolveTask);

export default router;
