import fs from "fs";
import Report from "../models/Report.js";
import { analyzeImage } from "../services/ai.service.js";

export const createReport = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const imagePath = req.file.path;

        // Helper to cleanup file if error
        const cleanup = () => {
            // In production, you might want to delete the uploaded file if processing fails
            // fs.unlinkSync(imagePath); 
        };

        // Analyze with Gemini
        const aiResponse = await analyzeImage(imagePath);

        const report = await Report.create({
            imagePath,
            latitude,
            longitude,
            severity: aiResponse.severity,
            issueCount: aiResponse.valid ? 1 : 0,
            aiResponse: aiResponse
        });

        res.json({ success: true, report });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI processing failed" });
    }
};
