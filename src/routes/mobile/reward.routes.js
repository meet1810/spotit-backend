import express from "express";
import { listRewards, buyReward, getMyRewards } from "../../controllers/mobile/reward.controller.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UserRewards
 *   description: Reward browsing and purchasing for users
 */

/**
 * @swagger
 * /rewards:
 *   get:
 *     summary: List all active rewards
 *     tags: [UserRewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of rewards
 */
router.get("/", authenticateToken, listRewards);

/**
 * @swagger
 * /rewards/my:
 *   get:
 *     summary: Get rewards bought by the current user
 *     tags: [UserRewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of user's bought rewards
 */
router.get("/my", authenticateToken, getMyRewards);

/**
 * @swagger
 * /rewards/{id}/buy:
 *   post:
 *     summary: Buy a reward using points
 *     tags: [UserRewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reward ID
 *     responses:
 *       201:
 *         description: Reward purchased successfully
 *       400:
 *         description: Insufficient points or invalid reward
 *       404:
 *         description: Reward not found
 */
router.post("/:id/buy", authenticateToken, buyReward);

export default router;
