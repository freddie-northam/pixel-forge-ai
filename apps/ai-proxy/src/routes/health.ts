import type { Express } from "express";

export function registerHealthRoute(app: Express): void {
  app.get("/v1/health", (_request, response) => {
    response.json({ status: "ok", service: "ai-proxy", timestamp: new Date().toISOString() });
  });
}
