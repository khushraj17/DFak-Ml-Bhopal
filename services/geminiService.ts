import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Schema definition for strict JSON output from Gemini
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fakeProbability: {
      type: Type.NUMBER,
      description: "Probability score from 0 to 100 indicating likelihood of the media being a deepfake.",
    },
    verdict: {
      type: Type.STRING,
      description: "Short verdict phrase, e.g., 'Likely Authentic', 'Suspicious', 'High Confidence Deepfake'.",
    },
    summary: {
      type: Type.STRING,
      description: "A concise technical summary of the findings.",
    },
    artifacts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Name of the artifact (e.g., 'Irregular Blinking')" },
          description: { type: Type.STRING, description: "Detailed explanation of the observation." },
          severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
          category: { type: Type.STRING, enum: ["visual", "audio", "metadata"] },
        },
        required: ["type", "description", "severity", "category"],
      },
    },
    timeline: {
      type: Type.ARRAY,
      description: "A simulated timeline of anomaly detection confidence over the duration of the clip (approx 10 points).",
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.NUMBER, description: "Time offset in seconds" },
          anomalyScore: { type: Type.NUMBER, description: "0-100 score of anomaly at this timestamp" },
          notes: { type: Type.STRING, description: "Optional brief note for spikes" }
        },
        required: ["timestamp", "anomalyScore"]
      }
    }
  },
  required: ["fakeProbability", "verdict", "summary", "artifacts", "timeline"],
};

export const analyzeMediaWithGemini = async (
  fileBase64: string,
  mimeType: string
): Promise<AnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please set process.env.API_KEY.");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use gemini-2.5-flash for speed/video capabilities as per requirements
    const modelId = "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64,
            },
          },
          {
            text: `You are a world-class Media Forensics AI called 'Deepfake Defender'. 
            Analyze the provided media (image or video) for signs of synthetic generation or manipulation (Deepfakes).
            
            Look for specific artifacts:
            1. Visual: Irregular blinking patterns, lip-sync mismatches, skin texture unnaturalness, warping around face edges, inconsistent lighting/shadows, distinct 'digital glaze' in eyes.
            2. Audio: Lack of breath sounds, robotic cadence, spectral cutoffs (if video), mismatched background noise.
            
            If it looks like a standard real photo/video, give a low probability score (<10%).
            If it has clear signs of AI generation, give a high score (>80%).
            
            Provide a technical breakdown in the requested JSON format.
            For the 'timeline', generate 10 data points representing the anomaly scan across the duration of the media.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, // Low temperature for analytical consistency
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const result = JSON.parse(text) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return a fallback error result structure if parsing fails, 
    // to prevent app crash, or rethrow depending on desired UX.
    throw error;
  }
};