import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ComparisonInsights {
  trends: string;
  consistency: string;
  projection: string;
  summary: string;
}

export async function getPlayerInsights(
  playerAName: string,
  playerBName: string,
  historyA: number[],
  historyB: number[],
  matchesRemaining: number,
  gap: number,
  neededAvg: string
): Promise<ComparisonInsights> {
  const prompt = `
    Analyze the following fantasy league performance for two players: ${playerAName} and ${playerBName}.
    
    ${playerAName} History (last few matches): ${historyA.join(', ')}
    ${playerBName} History (last few matches): ${historyB.join(', ')}
    
    Current Gap: ${gap} points
    Matches Remaining: ${matchesRemaining}
    Average points per match needed by trailing player to catch up: ${neededAvg}
    
    Provide strategic insights in a JSON format with the following fields:
    - trends: A brief analysis of their recent performance trends.
    - consistency: A comparison of their scoring stability.
    - projection: A logical projection for the remaining ${matchesRemaining} matches.
    - summary: A punchy, competitive summary of the showdown.
    
    Keep the tone professional yet competitive for a fantasy league setting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: { type: Type.STRING },
            consistency: { type: Type.STRING },
            projection: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ["trends", "consistency", "projection", "summary"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as ComparisonInsights;
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      trends: "Analysis unavailable. Performance data syncing...",
      consistency: "Stability metrics pending further matches.",
      projection: "Outlook uncertain until next fixture results.",
      summary: "Showdown in progress. Strategic updates to follow."
    };
  }
}
