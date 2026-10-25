import { Router } from "express";
import { analyzeCampusImage, ImageAnalysisRequest } from "./geminiService.ts";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

export const apiRouter = Router();

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Image Analysis endpoint using gemini-4-argon
apiRouter.post("/analyze-image", async (req, res) => {
  try {
    const { imageBase64, mimeType, mode, prompt, campusContext } = req.body as ImageAnalysisRequest;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Missing imageBase64 in request payload",
      });
    }

    const result = await analyzeCampusImage({
      imageBase64,
      mimeType: mimeType || "image/jpeg",
      mode: mode || "study_notes",
      prompt,
      campusContext,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("API /analyze-image error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error during image analysis",
    });
  }
});

// Campus AI Chat & Tutor Assistant
apiRouter.post("/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Missing message" });
    }

    const systemInstruction = `You are IAR SmartCampus AI - an ultra-capable, friendly, and practical academic & college life companion for college students.
Help students with:
- Course concepts (STEM, humanities, engineering, coding, math)
- Campus navigation, library policies, study time optimization
- Exam prep strategy, time management, stress reduction
- Assignment breakdowns and project brainstorming
Give structured, helpful, encouraging answers with Markdown formatting. Keep it engaging.`;

    const CANDIDATES = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let modelUsed = "gemini-3.8-flash";
    let text = "";
    let lastError: any = null;

    for (const candidate of CANDIDATES) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: candidate,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${systemInstruction}\n\nStudent question: ${message}${
                      context ? `\nContext: ${JSON.stringify(context)}` : ""
                    }`,
                  },
                ],
              },
            ],
            config: {
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          });
          if (response.text) {
            text = response.text;
            modelUsed = candidate;
            lastError = null;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const msg = String(err?.message || "");
          const is503 = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand");
          if (is503 && attempt === 1) {
            await new Promise((r) => setTimeout(r, 600));
            continue;
          }
          break;
        }
      }
      if (text) break;
    }

    if (!text) {
      throw new Error("Campus AI is currently experiencing high demand. Please try again in a few moments.");
    }

    return res.json({
      success: true,
      modelUsed,
      reply: text,
    });
  } catch (err: any) {
    console.warn("Chat API notice:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Chat response failed. Please try again.",
    });
  }
});

apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    platform: "IAR SmartCampus System",
    timestamp: new Date().toISOString(),
  });
});
