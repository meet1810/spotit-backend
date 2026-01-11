import Reward from "../../models/Reward.js";
import { Op } from "sequelize";

// Create a new reward
export const createReward = async (req, res) => {
    try {
        const { name, description, couponCode, expireDate, pointsRequired } = req.body;

        // Check if coupon code already exists
        const existingReward = await Reward.findOne({ where: { couponCode } });
        if (existingReward) {
            return res.status(400).json({ error: "Coupon code already exists" });
        }

        const reward = await Reward.create({
            name,
            description,
            couponCode,
            expireDate,
            pointsRequired
        });

        res.status(201).json({ success: true, reward });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create reward" });
    }
};

// Get all rewards (pagination + search)
export const getAllRewards = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search;

        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { couponCode: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Reward.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
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
        console.error(err);
        res.status(500).json({ error: "Failed to fetch rewards" });
    }
};

// Update a reward
export const updateReward = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, couponCode, expireDate, pointsRequired } = req.body;

        const reward = await Reward.findByPk(id);
        if (!reward) return res.status(404).json({ error: "Reward not found" });

        // Check uniqueness if coupon code is changing
        if (couponCode && couponCode !== reward.couponCode) {
            const existing = await Reward.findOne({ where: { couponCode } });
            if (existing) return res.status(400).json({ error: "Coupon code already exists" });
        }

        await reward.update({
            name,
            description,
            couponCode,
            expireDate,
            pointsRequired
        });

        res.json({ success: true, reward });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update reward" });
    }
};

// Delete a reward
export const deleteReward = async (req, res) => {
    try {
        const { id } = req.params;
        const reward = await Reward.findByPk(id);
        if (!reward) return res.status(404).json({ error: "Reward not found" });

        await reward.destroy();
        res.json({ success: true, message: "Reward deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete reward" });
    }
};

// Toggle active status
export const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const reward = await Reward.findByPk(id);
        if (!reward) return res.status(404).json({ error: "Reward not found" });

        reward.isActive = !reward.isActive;
        await reward.save();

        res.json({ success: true, message: `Reward ${reward.isActive ? 'activated' : 'deactivated'}`, reward });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update status" });
    }
};
