import { Op } from "sequelize";
import Report from "../../models/Report.js";
import User from "../../models/User.js";

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        // Helper for queries
        const getStats = async (model, where = {}) => {
            const current = await model.count({
                where: { ...where, createdAt: { [Op.gte]: startOfMonth } }
            });
            const previous = await model.count({
                where: {
                    ...where,
                    createdAt: {
                        [Op.gte]: startOfLastMonth,
                        [Op.lt]: startOfMonth
                    }
                }
            });
            const total = await model.count({ where });

            const growth = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

            return { count: total, trend: growth };
        };

        // 1. STATS CARDS
        const stats = {
            totalComplaints: await getStats(Report),
            totalWorkers: await getStats(User, { role: 'WORKER' }),
            totalClients: await getStats(User, { role: 'USER' }), // Assuming standard users have role 'USER'
            resolvedIssues: await getStats(Report, { status: 'RESOLVED' })
        };

        // 2. RECENT DETECTIONS (Table)
        const recentDetections = await Report.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                as: 'reporter',
                attributes: ['name']
            }],
            attributes: ['id', 'category', 'latitude', 'longitude', 'createdAt', 'status']
            // Note: client might need to reverse geocode lat/long or we send it raw
        });

        // 3. RECENT PROBLEMS (Sidebar - possibly same as detections but formatted differently)
        // We'll return the same list or a slightly larger one for the UI to handle
        const recentProblems = await Report.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'category', 'createdAt', 'severity', 'status']
        });

        res.json({
            success: true,
            stats,
            recentDetections,
            recentProblems
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};
