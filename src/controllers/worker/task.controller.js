import Report from "../../models/Report.js";
import User from "../../models/User.js";
import { verifyResolution } from "../../services/ai.service.js";
import { sendNotification, notifyAdmins } from "../../services/notification.service.js";
import fs from "fs";

export const getOpenTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Report.findAndCountAll({
            where: { assignedWorkerId: req.user.id },
            include: [{
                model: User,
                as: 'reporter',
                attributes: ['name', 'profilePicture']
            }],
            order: [['createdAt', 'ASC']],
            limit,
            offset
        });

        res.json({
            success: true,
            tasks: rows,
            pagination: {
                total: count,
                page,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
};

// Worker claims a task
export const claimTask = async (req, res) => {
    try {
        const { id } = req.params;
        const workerId = req.user.id;

        const report = await Report.findByPk(id);
        if (!report) return res.status(404).json({ error: "Report not found" });

        if (report.status !== 'PENDING') return res.status(400).json({ error: "Task is not open" });

        report.assignedWorkerId = workerId;
        report.status = 'IN_PROGRESS';
        await report.save();

        res.json({ success: true, message: "Task claimed successfully", report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to claim task" });
    }
};

// Worker resolves a task
export const resolveTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude } = req.body; // Worker's current location
        const workerId = req.user.id;
        const file = req.file; // Resolution image

        if (!file) return res.status(400).json({ error: "Resolution image is required" });

        const report = await Report.findByPk(id, { include: 'reporter' });
        if (!report) return res.status(404).json({ error: "Report not found" });

        if (report.assignedWorkerId !== workerId) {
            return res.status(403).json({ error: "You are not assigned to this task" });
        }

        // 1. GEO CHECK (Simple distance calculation)
        if (latitude && longitude) {
            const dist = calculateDistance(report.latitude, report.longitude, parseFloat(latitude), parseFloat(longitude));
            if (dist > 0.1) { // 100 meters tolerance (approx)
                return res.status(400).json({ error: `You are too far from the report location (${Math.round(dist * 1000)}m)` });
            }
        }

        // 2. AI VERIFICATION
        const verification = await verifyResolution(report.imagePath, file.path);

        if (!verification.verified) {
            return res.status(400).json({
                success: false,
                error: "AI Verification Failed: " + verification.reason
            });
        }

        // 3. SUCCESS: Update Report & Reward User
        report.status = 'RESOLVED';
        report.resolutionImage = file.path;
        report.resolvedAt = new Date();
        await report.save();

        // 4. ADD POINTS
        const reporter = report.reporter;
        if (reporter) {
            reporter.points = (reporter.points || 0) + 100;
            await reporter.save();

            // 🔔 Notify Reporter
            await sendNotification(
                reporter.u_id,
                "Report Resolved! 🎉",
                "Your report has been successfully resolved. You earned 100 points!",
                "SUCCESS",
                { reportId: report.id }
            );
        }

        // 🔔 Notify Admins
        await notifyAdmins(
            "Task Resolved",
            `Report #${report.id} has been resolved by a worker.`,
            "SUCCESS",
            { reportId: report.id, workerId }
        );

        res.json({
            success: true,
            message: "Task resolved and verified! User rewarded +100 points.",
            verification
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to resolve task" });
    }
};

// Helper: Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
