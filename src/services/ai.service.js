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

Allowed civic issue categories ONLY:
- GARBAGE
- ROAD_DAMAGE
- WATER_LEAKAGE
- SEWAGE
- STREET_LIGHT
- ILLEGAL_PARKING
- ENCROACHMENT
- DRAINAGE
- PUBLIC_SAFETY
- OTHER

Rules:
- Identify the primary issue in the image.
- Map it to one of the Allowed Categories.
- If the image does NOT contain a valid civic issue:
  → valid = false
  → severity = "NONE"
  → category = null
- DO NOT guess.
- DO NOT infer.
- If unsure, mark valid = false.

Return ONLY valid JSON in this schema:

{
  "valid": boolean,
  "category": "GARBAGE" | "ROAD_DAMAGE" | "WATER_LEAKAGE" | "SEWAGE" | "STREET_LIGHT" | "ILLEGAL_PARKING" | "ENCROACHMENT" | "DRAINAGE" | "PUBLIC_SAFETY" | "OTHER" | null,
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
            !parsed.category ||
            parsed.severity === "NONE" ||
            parsed.confidence < 0.6
        ) {
            return {
                valid: false,
                category: null,
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
            category: null,
            severity: "NONE",
            confidence: 0.0,
            description: "Error analyzing image",
        };
    }
};

// Verify resolution by comparing two images
export const verifyResolution = async (originalImagePath, newImagePath) => {
    const prompt = `
    You are a Civic Issue Verification AI.
    Image 1: The original reported issue (e.g., garbage, pothole).
    Image 2: The claimed resolution (e.g., cleaned area, filled pothole).

    Task:
    1. Verify if Image 2 is the SAME location/context as Image 1.
    2. Verify if the specific issue in Image 1 is FIXED in Image 2.

    Return JSON:
    {
      "verified": boolean,
      "location_match_confidence": number (0-1),
      "fix_confidence": number (0-1),
      "reason": string
    }
    `;

    try {
        const imagePart1 = fileToGenerativePart(originalImagePath, "image/jpeg");
        const imagePart2 = fileToGenerativePart(newImagePath, "image/jpeg");

        // Use the existing JSON-configured model
        const request = {
            contents: [{
                role: 'user',
                parts: [{ text: prompt }, imagePart1, imagePart2]
            }]
        };

        const result = await model.generateContent(request);
        const responseText = result.response.candidates[0].content.parts[0].text;

        const parsed = JSON.parse(responseText);

        // Strict validation logic
        if (parsed.verified && parsed.location_match_confidence > 0.6 && parsed.fix_confidence > 0.6) {
            return { verified: true, confidence: parsed.fix_confidence, reason: parsed.reason };
        } else {
            return { verified: false, confidence: parsed.fix_confidence, reason: parsed.reason || "Verification failed." };
        }

    } catch (error) {
        console.error("Verification error:", error);
        return { verified: false, reason: "AI Service Error: " + error.message };
    }
};