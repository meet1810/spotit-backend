import express from "express";
import { login } from "../../controllers/worker/auth.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Worker Auth
 *   description: Worker authentication
 */

/**
 * @swagger
 * /worker/auth/login:
 *   post:
 *     summary: Worker Login
 *     tags: [Worker Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
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
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

export default router;
