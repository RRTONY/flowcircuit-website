import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startWeeklyReportScheduler } from "../weeklyReport";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Stripe webhook needs raw body for signature verification — MUST come before express.json()
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const { handleStripeWebhook } = await import("../stripe/webhook");
    return handleStripeWebhook(req, res);
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // ─── Scheduled Handlers (Heartbeat cron) ─────────────────────────
  app.post("/api/scheduled/trialDrip", async (req, res) => {
    const { trialDripHandler } = await import("../trialDripHandler");
    return trialDripHandler(req, res);
  });

  // ─── Enterprise API (REST) ───────────────────────────────────────
  // These endpoints allow enterprise clients to embed the assessment
  // in their own onboarding flows via API key authentication.
  app.use("/api/v1", express.json());

  // API key validation middleware
  const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKey = req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
    if (!apiKey) {
      return res.status(401).json({ error: "API key required. Pass via x-api-key header or Bearer token." });
    }
    // For now, validate against a simple env var. In production, this would check a database of API keys.
    const validKey = process.env.ENTERPRISE_API_KEY;
    if (!validKey || apiKey !== validKey) {
      return res.status(403).json({ error: "Invalid API key." });
    }
    next();
  };

  // GET /api/v1/health — public health check
  app.get("/api/v1/health", (_req, res) => {
    res.json({ status: "ok", version: "1.0.0", service: "flow-circuit-api" });
  });

  // POST /api/v1/assessments — submit assessment results via API
  app.post("/api/v1/assessments", validateApiKey, async (req, res) => {
    try {
      const { saveAssessment, getOrCreateTeamByDomain } = await import("../db");
      const { guestName, guestEmail, domain, role, score, scores, answers } = req.body;
      if (!guestName || !role || score === undefined) {
        return res.status(400).json({ error: "Required fields: guestName, role, score" });
      }
      let teamId = null;
      if (domain) {
        const team = await getOrCreateTeamByDomain(domain);
        teamId = team?.id ?? null;
      }
      const shareToken = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      const assessment = await saveAssessment({
        guestName, guestEmail: guestEmail || null, domain: domain || null,
        role, score, scores: scores || {}, answers: answers || {},
        teamId, userId: null, shareToken,
      });

      // Fire-and-forget: auto-generate PDF, notify owner, check team friction report
      if (assessment) {
        import("../postAssessmentAutomation").then(({ runPostAssessmentAutomation }) => {
          runPostAssessmentAutomation({
            id: assessment.id,
            guestName: assessment.guestName || guestName,
            guestEmail: assessment.guestEmail || guestEmail || null,
            domain: domain || null,
            role: assessment.role || role,
            score: assessment.score ?? score,
            scores: (assessment.scores as Record<string, number>) || scores || {},
            shareToken: assessment.shareToken || null,
            teamId: assessment.teamId || null,
          }).catch((err: any) => console.error("[PostAssessment] REST automation failed:", err));
        }).catch((err: any) => console.error("[PostAssessment] REST import failed:", err));
      }

      res.json({ success: true, assessment });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // GET /api/v1/assessments/:domain — get assessments by domain
  app.get("/api/v1/assessments/:domain", validateApiKey, async (req, res) => {
    try {
      const { getAssessmentsByDomain } = await import("../db");
      const assessments = await getAssessmentsByDomain(req.params.domain);
      res.json({ assessments });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // GET /api/v1/norming — get aggregate norming data
  app.get("/api/v1/norming", validateApiKey, async (req, res) => {
    try {
      const { getNormingData } = await import("../db");
      const data = await getNormingData();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // GET /api/v1/teams/:teamId — get team data
  app.get("/api/v1/teams/:teamId", validateApiKey, async (req, res) => {
    try {
      const { getTeamById, getAssessmentsByTeam } = await import("../db");
      const team = await getTeamById(parseInt(req.params.teamId));
      if (!team) return res.status(404).json({ error: "Team not found" });
      const assessments = await getAssessmentsByTeam(team.id);
      res.json({ team, assessments });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Start the weekly report scheduler
    startWeeklyReportScheduler();
  });
}

startServer().catch(console.error);
