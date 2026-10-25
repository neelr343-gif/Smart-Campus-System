import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export interface ImageAnalysisRequest {
  imageBase64: string;
  mimeType: string;
  mode: "study_notes" | "lost_found" | "cafeteria_meal" | "facility_issue" | "schedule_syllabus" | "general_campus";
  prompt?: string;
  preferredModel?: string;
  campusContext?: {
    studentName?: string;
    department?: string;
    locationHint?: string;
  };
}

export interface StructuredCampusAnalysis {
  title: string;
  category: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  extractedText?: string;
  metrics?: Record<string, string | number>;
  urgencyOrImportance?: "low" | "medium" | "high" | "urgent";
  tags: string[];
  rawText: string;
  modelUsed: string;
  durationMs?: number;
}

// Candidates for high-availability multimodal vision in order of preference
const FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

export async function analyzeCampusImage(
  request: ImageAnalysisRequest
): Promise<StructuredCampusAnalysis> {
  const startTime = Date.now();
  const { imageBase64, mimeType, mode, prompt, campusContext, preferredModel } = request;

  // Clean base64 string if data url prefix is present
  const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");

  const modeInstructions: Record<string, string> = {
    study_notes: `Identify topic, transcribe key handwritten formulas/notes, explain core concept in 2 sentences, provide 2 quick exam tips.`,
    lost_found: `Identify the exact item (brand, model, color, marks), condition, and draft a verified campus lost & found record.`,
    cafeteria_meal: `Identify dishes on the plate, estimate calories, protein (g), carbs (g), healthy fats (g), state dietary flags.`,
    facility_issue: `Identify the defect or hazard, assess urgency (low, medium, high, urgent), and specify maintenance team required.`,
    schedule_syllabus: `Extract course names, dates, times, rooms, and upcoming deadlines in chronological order.`,
    general_campus: `Identify the campus item or scene and provide practical advice for college students.`
  };

  const contextPrompt = campusContext?.locationHint
    ? `\nCampus Location: ${campusContext.locationHint}`
    : "";

  const systemInstructions = `You are IAR SmartCampus System High-Speed AI for college students.
Analyze this photo quickly and accurately.
Mode: ${mode}
Focus: ${modeInstructions[mode] || modeInstructions.general_campus}
${contextPrompt}
${prompt ? `Custom Query: "${prompt}"` : ""}

Return ONLY valid JSON matching this schema:
{
  "title": "Short descriptive title (max 8 words)",
  "category": "Academic / Lost Property / Food & Nutrition / Estates / Schedule",
  "summary": "Clear 2-sentence summary",
  "keyPoints": ["3 concise analytical points"],
  "actionItems": ["2 practical next steps"],
  "extractedText": "Any text/numbers read from image (or empty string)",
  "metrics": { "Item": "value", "Status": "value" },
  "urgencyOrImportance": "low" | "medium" | "high" | "urgent",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  const imagePart = {
    inlineData: {
      mimeType: mimeType || "image/jpeg",
      data: cleanBase64,
    },
  };
  const textPart = { text: systemInstructions };

  let rawOutput = "";
  let modelUsed = "gemini-3.8-flash";
  let lastError: any = null;

  // Build model priority queue: start with preferred or gemini-3.8-flash, followed by resilient fallbacks
  const modelsToAttempt = preferredModel && preferredModel !== "gemini-3.8-flash"
    ? [preferredModel, ...FALLBACK_MODELS.filter((m) => m !== preferredModel)]
    : FALLBACK_MODELS;

  for (const candidateModel of modelsToAttempt) {
    // Attempt up to 2 times for 503 / temporary server spikes
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: candidateModel,
          contents: {
            parts: [imagePart, textPart],
          },
          config: {
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
            temperature: 0.2,
          },
        });

        if (response.text) {
          rawOutput = response.text;
          modelUsed = candidateModel;
          lastError = null;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || "");
        const isTransient503 = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand");
        
        // If 503 on first try, wait 600ms before retrying once
        if (isTransient503 && attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        // If 429 quota or second attempt failed, break to next candidate model
        break;
      }
    }

    if (rawOutput) {
      break;
    }
  }

  // If all models failed, throw a clean, human-readable student-facing error message
  if (!rawOutput) {
    let friendlyMessage = "Campus AI is experiencing a temporary network demand spike. Please tap 'Retry Analysis'.";
    if (lastError?.message) {
      try {
        const parsed = JSON.parse(lastError.message);
        if (parsed?.error?.message) {
          friendlyMessage = parsed.error.message;
        }
      } catch {
        const rawMsg = lastError.message.replace(/^Error:\s*/i, "");
        if (rawMsg.includes("503") || rawMsg.includes("high demand") || rawMsg.includes("UNAVAILABLE")) {
          friendlyMessage = "Campus AI model is currently handling high server demand. Please tap 'Retry Analysis' in a moment.";
        } else {
          friendlyMessage = rawMsg;
        }
      }
    }
    throw new Error(friendlyMessage);
  }

  const durationMs = Date.now() - startTime;

  // Parse JSON response safely
  try {
    const cleanedJson = rawOutput
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedJson);
    return {
      title: parsed.title || "Campus Visual Analysis",
      category: parsed.category || "General Campus",
      summary: parsed.summary || rawOutput.slice(0, 200),
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [parsed.summary || "Analysis completed"],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : ["Review analysis in IAR SmartCampus portal"],
      extractedText: parsed.extractedText || "",
      metrics: parsed.metrics || {},
      urgencyOrImportance: parsed.urgencyOrImportance || "medium",
      tags: Array.isArray(parsed.tags) ? parsed.tags : ["CampusAI", mode],
      rawText: rawOutput,
      modelUsed,
      durationMs,
    };
  } catch (_parseErr) {
    return {
      title: "IAR SmartCampus Visual Insight",
      category: mode.replace("_", " ").toUpperCase(),
      summary: rawOutput.slice(0, 250) + "...",
      keyPoints: rawOutput
        .split("\n")
        .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("*") || line.length > 20)
        .slice(0, 4)
        .map((l) => l.replace(/^[-*•]\s*/, "").trim()),
      actionItems: ["View complete findings below"],
      extractedText: "",
      metrics: { Status: "Processed", Mode: mode },
      urgencyOrImportance: "medium",
      tags: ["SmartCampus", mode],
      rawText: rawOutput,
      modelUsed,
      durationMs,
    };
  }
}
