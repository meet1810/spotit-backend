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
    Analyze this image for civic issues.
    Focus ONLY on: Garbage, Potholes, Water Logging, Road Obstruction, Signage Damage.
    If none are visible, set 'valid' to false.

    Output Schema:
    {
      "valid": boolean,
      "issue_type": stringOrNull,
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

        return JSON.parse(responseText);

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