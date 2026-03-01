import type { Express } from "express";
import { safetyDecisionSchema } from "@pixelforge/shared";
import { evaluateSafety } from "../services/safety-service.js";

const MAX_INPUT_LENGTH = 500;

export function registerSafetyRoutes(app: Express): void {
  app.post("/v1/safety/check", (request, response) => {
    const input = String(request.body?.input ?? "").trim().slice(0, MAX_INPUT_LENGTH);
    const decision = evaluateSafety(input);

    response.json({ decision: safetyDecisionSchema.parse(decision) });
  });
}
