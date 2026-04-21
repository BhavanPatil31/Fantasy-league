import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { calculateRankScores } from "./src/lib/scoreUtils.ts";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API placeholders - logic will follow
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API route for score calculation and update
  app.post("/api/matches/process", async (req, res) => {
    try {
      const { scores } = req.body; // Array of { playerId, playerName, pointsScored }
      
      if (!Array.isArray(scores) || scores.length === 0) {
        return res.status(400).json({ error: "Invalid scores provided" });
      }

      const processedResults = calculateRankScores(scores);
      
      res.json({ 
        success: true, 
        results: processedResults 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process scores" });
    }
  });

  // API route for Gemini Insights
  app.post("/api/insights", async (req, res) => {
    try {
      const { playerAName, playerBName, historyA, historyB, matchesRemaining, gap, neededAvg } = req.body;
      
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

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
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

      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ 
        error: "Failed to generate insights",
        details: error.message
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
