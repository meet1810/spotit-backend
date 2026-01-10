import express from "express";
import { createReport } from "../controllers/report.controller.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/**
 * @swagger
 * /report:
 *   post:
 *     summary: Create a new report with image analysis
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
router.post("/report", upload.single("image"), createReport);

export default router;
