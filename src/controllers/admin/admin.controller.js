import User from "../../models/User.js";
import Report from "../../models/Report.js";

export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            where: { role: 'USER' },
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            users: rows,
            pagination: {
                total: count,
                page,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

export const getAllReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Report.findAndCountAll({
            include: [{
                model: User,
                attributes: ['u_id', 'name', 'email', 'profilePicture']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            reports: rows,
            pagination: {
                total: count,
                page,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};

export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        const report = await Report.findByPk(id, {
            include: [{
                model: User,
                attributes: ['u_id', 'name', 'email', 'profilePicture']
            }]
        });

        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        res.json({ success: true, report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch report" });
    }
};
