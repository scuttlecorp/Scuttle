import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTokenSchema, insertPresaleSchema, insertParticipantSchema } from "@shared/schema";
import { debouncedGitHubSync } from "./github-sync";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Token routes
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getAllTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tokens" });
    }
  });

  app.get("/api/tokens/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const tokens = await storage.getRecentTokens(limit);
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent tokens" });
    }
  });

  app.get("/api/tokens/:id", async (req, res) => {
    try {
      const token = await storage.getToken(req.params.id);
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch token" });
    }
  });

  app.post("/api/tokens", async (req, res) => {
    try {
      const validatedData = insertTokenSchema.parse(req.body);
      const token = await storage.createToken(validatedData);
      
      // Sync to GitHub (debounced to avoid too many commits)
      debouncedGitHubSync(`Created new token: ${token.name} (${token.symbol})`);
      
      // Simulate deployment (in production, this would deploy to blockchain)
      setTimeout(async () => {
        await storage.updateToken(token.id, {
          status: "deployed",
          contractAddress: "0x" + Math.random().toString(16).slice(2, 42).padEnd(40, '0'),
          deploymentTxHash: "0x" + Math.random().toString(16).slice(2, 66).padEnd(64, '0'),
        });
      }, 3000);
      
      res.status(201).json(token);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create token" });
    }
  });

  app.patch("/api/tokens/:id", async (req, res) => {
    try {
      const token = await storage.updateToken(req.params.id, req.body);
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Failed to update token" });
    }
  });

  // Presale routes
  app.get("/api/presales", async (req, res) => {
    try {
      const presales = await storage.getAllPresales();
      res.json(presales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presales" });
    }
  });

  app.get("/api/presales/active", async (req, res) => {
    try {
      const presales = await storage.getActivePresales();
      res.json(presales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active presales" });
    }
  });

  app.get("/api/presales/:id", async (req, res) => {
    try {
      const presale = await storage.getPresale(req.params.id);
      if (!presale) {
        return res.status(404).json({ error: "Presale not found" });
      }
      res.json(presale);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presale" });
    }
  });

  app.post("/api/presales", async (req, res) => {
    try {
      const validatedData = insertPresaleSchema.parse(req.body);
      const presale = await storage.createPresale(validatedData);
      
      // Sync to GitHub (debounced to avoid too many commits)
      debouncedGitHubSync(`Created new presale: ${presale.tokenName}`);
      
      res.status(201).json(presale);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create presale" });
    }
  });

  app.patch("/api/presales/:id", async (req, res) => {
    try {
      const presale = await storage.updatePresale(req.params.id, req.body);
      if (!presale) {
        return res.status(404).json({ error: "Presale not found" });
      }
      res.json(presale);
    } catch (error) {
      res.status(500).json({ error: "Failed to update presale" });
    }
  });

  // Participant routes
  app.get("/api/presales/:id/participants", async (req, res) => {
    try {
      const participants = await storage.getParticipantsByPresale(req.params.id);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  app.post("/api/presales/:id/participate", async (req, res) => {
    try {
      const validatedData = insertParticipantSchema.parse({
        ...req.body,
        presaleId: req.params.id,
      });
      
      const participant = await storage.createParticipant(validatedData);
      
      // Sync to GitHub (debounced to avoid too many commits)
      debouncedGitHubSync(`New participation in presale ${req.params.id}`);
      
      res.status(201).json(participant);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to participate in presale" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
