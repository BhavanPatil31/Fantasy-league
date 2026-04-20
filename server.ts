import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { calculateRankScores } from "./src/lib/scoreUtils";

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
