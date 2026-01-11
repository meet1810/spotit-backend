import express from "express";
import { login, verify } from "../../controllers/admin/auth.controller.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

// Middleware to ensure Admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: "Access denied: Admins only" });
    }
};

/**
 * @swagger
 * tags:
 *   name: Admin Auth
 *   description: Admin authentication
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin Login
 *     tags: [Admin Auth]
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

/**
 * @swagger
 * /admin/verify:
 *   get:
 *     summary: Verify Admin Token
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       403:
 *         description: Not an admin
 */
router.get("/verify", authenticateToken, requireAdmin, verify);

export default router;
