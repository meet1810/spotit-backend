import fs from "fs";
import Report from "../../models/Report.js";
import { analyzeImage } from "../../services/ai.service.js";

export const createReport = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const imagePath = req.file.path;

        const aiResponse = await analyzeImage(imagePath);

        // 🚨 HARD REJECTION
        if (!aiResponse.valid) {
            fs.unlinkSync(imagePath);
            return res.status(400).json({
                success: false,
                error: "Invalid civic issue image"
            });
        }

        const report = await Report.create({
            imagePath,
            latitude,
            longitude,
            severity: aiResponse.severity,
            issueCount: 1,
            aiResponse,
            userId: req.user.id
        });

        res.json({ success: true, report });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI processing failed" });
    }
};


export const getUserReports = async (req, res) => {
    try {
        const reports = await Report.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, reports });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};

export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findOne({
            where: {
                id,
                userId: req.user.id // Ensure access only if it belongs to user
            }
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
