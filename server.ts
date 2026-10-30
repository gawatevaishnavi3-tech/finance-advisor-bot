import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { performGeminiHealthAudit, generateAdvisorChatResponse } from "./server/gemini";

const __filename = typeof import.meta.url === "string" ? fileURLToPath(import.meta.url) : (process.argv[1] || "");
const __dirname = path.dirname(__filename || process.cwd());

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body Parser
  app.use(express.json({ limit: "5mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      model: "gemini-2.5-flash",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    });
  });

  // Financial Health Audit Endpoint
  app.post("/api/advisor/audit", async (req, res) => {
    try {
      const { transactions = [], budgetConfig = { monthlyOverallCap: 0, categoryLimits: {} }, savingsGoals = [], currencySymbol = "$" } = req.body;
      const result = await performGeminiHealthAudit(transactions, budgetConfig, savingsGoals, currencySymbol);
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/advisor/audit:", error);
      res.status(500).json({ error: error.message || "Failed to generate financial health audit" });
    }
  });

  // Conversational Advisor Chat Endpoint
  app.post("/api/advisor/chat", async (req, res) => {
    try {
      const {
        message,
        history = [],
        transactions = [],
        budgetConfig = { monthlyOverallCap: 0, categoryLimits: {} },
        savingsGoals = [],
        currencySymbol = "$",
      } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Missing required string 'message'" });
      }

      const response = await generateAdvisorChatResponse(
        message,
        history,
        transactions,
        budgetConfig,
        savingsGoals,
        currencySymbol
      );

      res.json(response);
    } catch (error: any) {
      console.error("Error in /api/advisor/chat:", error);
      res.status(500).json({ error: error.message || "Failed to generate advisor response" });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Financial Advisor Bot Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
