import Reward from "../../models/Reward.js";
import UserReward from "../../models/UserReward.js";
import User from "../../models/User.js";
import sequelize from "../../config/database.js";
import { Op } from "sequelize";

// Get all active rewards (for users to browse)
export const listRewards = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Reward.findAndCountAll({
            where: { isActive: true },
            order: [['pointsRequired', 'ASC']],
            limit,
            offset
        });

        res.json({
            success: true,
            rewards: rows,
            pagination: {
                total: count,
                page,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        console.error("List Rewards Error:", err);
        res.status(500).json({ error: "Failed to fetch rewards" });
    }
};

// Get bought rewards for the authenticated user
export const getMyRewards = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await UserReward.findAndCountAll({
            where: { userId },
            include: [{
                model: Reward,
                attributes: ['name', 'description', 'expireDate']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            userRewards: rows,
            pagination: {
                total: count,
                page,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        console.error("Get My Rewards Error:", err);
        res.status(500).json({ error: "Failed to fetch user rewards" });
    }
};

// Buy a reward
export const buyReward = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const rewardId = req.params.id;

        const user = await User.findByPk(userId, { transaction: t });
        console.log(user);

        const reward = await Reward.findByPk(rewardId, { transaction: t });

        if (!reward) {
            await t.rollback();
            return res.status(404).json({ error: "Reward not found" });
        }

        if (!reward.isActive) {
            await t.rollback();
            return res.status(400).json({ error: "This reward is no longer active" });
        }

        if (user.points < reward.pointsRequired) {
            await t.rollback();
            return res.status(400).json({ error: "Insufficient points" });
        }

        // Deduct points
        user.points -= reward.pointsRequired;
        await user.save({ transaction: t });

        // Record the purchase
        const userReward = await UserReward.create({
            userId,
            rewardId: reward.id,
            pointsSpent: reward.pointsRequired,
            couponCode: reward.couponCode, // Saving a snapshot of the code
            status: 'ACTIVE'
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            message: "Reward purchased successfully",
            userReward
        });

    } catch (err) {
        await t.rollback();
        console.error("Buy Reward Error:", err);
        res.status(500).json({ error: "Failed to purchase reward" });
    }
};
