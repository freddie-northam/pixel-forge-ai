import type { Express } from "express";
import { listProviders } from "../services/providers.js";

export function registerProviderRoutes(app: Express): void {
  app.get("/v1/providers", (_request, response) => {
    response.json({ providers: listProviders() });
  });
}
