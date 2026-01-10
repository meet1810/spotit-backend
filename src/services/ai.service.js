import { VertexAI } from "@google-cloud/vertexai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// CHANGE 1: Direct Authentication
// Make sure you have 'service-account.json' in your root folder
// and added to .gitignore!
const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: "us-central1",
    googleAuthOptions: {
        keyFilename: "./src/credentials.json"
    }
});

// CHANGE 2: Enable JSON Mode
// This ensures the model returns clean JSON without markdown backticks
const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json"
    }
});

/**
 * Converts a local file to a generative part object for Vertex AI.
 */
function fileToGenerativePart(path, mimeType) {
    return {
        // CHANGE 3: Syntax Fix
        // Vertex AI SDK requires 'inlineData', not 'fileData'
        inlineData: {
            mimeType,
            data: fs.readFileSync(path).toString("base64"),
        },
    };
}

export const analyzeImage = async (imagePath) => {
    if (!process.env.GCP_PROJECT_ID) {
        console.error("GCP_PROJECT_ID is missing");
        return { valid: false, description: "Server Error: Config missing" };
    }

    const prompt = `
You are a STRICT civic issue validator.

Allowed civic issues ONLY:
- Garbage
- Potholes
- Water Logging
- Road Obstruction
- Signage Damage

Rules:
- If the image does NOT clearly contain one of the allowed civic issues:
  → valid = false
  → severity = "NONE"
  → issue_type = null
- DO NOT guess.
- DO NOT infer.
- If unsure, mark valid = false.

Return ONLY valid JSON in this schema:

{
  "valid": boolean,
  "issue_type": "Garbage" | "Potholes" | "Water Logging" | "Road Obstruction" | "Signage Damage" | null,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "NONE",
  "confidence": number,
  "description": string
}
`;


    try {
        const imagePart = fileToGenerativePart(imagePath, "image/jpeg");
        const textPart = { text: prompt };

        // CHANGE 4: Correct Request Structure
        // We send one 'content' item containing multiple 'parts' (text + image)
        const request = {
            contents: [{
                role: 'user',
                parts: [textPart, imagePart]
            }]
        };

        const result = await model.generateContent(request);

        // Since we used responseMimeType: "application/json", 
        // we can usually parse directly.
        const responseText = result.response.candidates[0].content.parts[0].text;

        const parsed = JSON.parse(responseText);
        // HARD SAFETY CHECK (server-side authority)
        if (
            !parsed.valid ||
            !parsed.issue_type ||
            parsed.severity === "NONE" ||
            parsed.confidence < 0.6
        ) {
            return {
                valid: false,
                issue_type: null,
                severity: "NONE",
                confidence: parsed.confidence || 0,
                description: "Image does not contain a valid civic issue"
            };
        }

        return parsed;
    } catch (error) {
        console.error("Vertex AI Gemini analysis error:", error);
        return {
            valid: false,
            issue_type: null,
            severity: "NONE",
            confidence: 0.0,
            description: "Error analyzing image",
        };
    }
};