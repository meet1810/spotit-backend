import Report from "../../models/Report.js";
import User from "../../models/User.js";
import { sendNotification } from "../../services/notification.service.js";

// Admin assigns task to a worker
export const assignTask = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { workerId } = req.body;

        const report = await Report.findByPk(reportId);
        if (!report) return res.status(404).json({ error: "Report not found" });

        const worker = await User.findOne({ where: { u_id: workerId, role: 'WORKER' } });
        if (!worker) return res.status(404).json({ error: "Worker not found" });

        report.assignedWorkerId = workerId;
        report.status = 'IN_PROGRESS';
        await report.save();

        // 🔔 Notify Worker
        await sendNotification(
            workerId,
            "New Task Assigned 🚜",
            "An admin has assigned you a new task. Check your dashboard.",
            "INFO",
            { reportId: report.id }
        );

        res.json({ success: true, message: "Task assigned successfully", report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to assign task" });
    }
};
