import type { Express } from "express";
import { listProviders } from "../services/providers.js";
import { asyncHandler } from "../middleware/async-handler.js";

export function registerProviderRoutes(app: Express): void {
  app.get("/v1/providers", asyncHandler(async (_request, response) => {
    response.json({ providers: listProviders() });
  }));
}
