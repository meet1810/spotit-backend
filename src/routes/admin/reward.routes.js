import express from "express";
import {
    createReward,
    getAllRewards,
    updateReward,
    deleteReward,
    toggleStatus
} from "../../controllers/admin/reward.controller.js";
import { authenticateToken, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken, requireAdmin);

/**
 * @swagger
 * tags:
 *   name: AdminRewards
 *   description: Reward management
 */

/**
 * @swagger
 * /admin/rewards:
 *   get:
 *     summary: List all rewards
 *     tags: [AdminRewards]
 *   post:
 *     summary: Create a new reward
 *     tags: [AdminRewards]
 */
router.route("/")
    .get(getAllRewards)
    .post(createReward);

/**
 * @swagger
 * /admin/rewards/{id}:
 *   put:
 *     summary: Update a reward
 *     tags: [AdminRewards]
 *   delete:
 *     summary: Delete a reward
 *     tags: [AdminRewards]
 */
router.route("/:id")
    .put(updateReward)
    .delete(deleteReward);

/**
 * @swagger
 * /admin/rewards/{id}/status:
 *   patch:
 *     summary: Toggle reward active status
 *     tags: [AdminRewards]
 */
router.patch("/:id/status", toggleStatus);

export default router;
