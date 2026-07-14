import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { weatherData, location } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are an AI meteorologist providing brief, actionable, and engaging recommendations based on the current weather and forecast.
      
Location: ${location}
Current Weather: ${weatherData.current.temperature_2m}°C, Apparent: ${weatherData.current.apparent_temperature}°C
Daily Max/Min: ${weatherData.daily.temperature_2m_max[0]}°C / ${weatherData.daily.temperature_2m_min[0]}°C

Provide a concise, 3-4 sentence recommendation about what to wear, any activities to avoid, or general advice based on this weather. Use a friendly tone.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ recommendation: response.text });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
