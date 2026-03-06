import type { Express } from "express";
import { safetyDecisionSchema } from "@pixelforge/shared";
import { evaluateSafety } from "../services/safety-service.js";
import { asyncHandler } from "../middleware/async-handler.js";

export function registerSafetyRoutes(app: Express): void {
  app.post("/v1/safety/check", asyncHandler(async (request, response) => {
    const input = String(request.body?.input ?? "").trim();
    const decision = evaluateSafety(input);

    response.json({ decision: safetyDecisionSchema.parse(decision) });
  }));
}
