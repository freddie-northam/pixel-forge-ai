import type { Express } from "express";
import { levelSpecSchema, missionDefinitionSchema, promptCardSchema } from "@pixelforge/shared";
import { generateLevel, improveLevel } from "../services/level-generator.js";
import { evaluateSafety } from "../services/safety-service.js";

const MAX_TEXT_LENGTH = 500;

export function registerGenerationRoutes(app: Express): void {
  app.post("/v1/generate-level", (request, response) => {
    const mission = missionDefinitionSchema.parse(request.body?.mission);
    const selectedCards = Array.isArray(request.body?.selectedCards)
      ? request.body.selectedCards.map((card: unknown) => promptCardSchema.parse(card))
      : [];
    const freeText = String(request.body?.freeText ?? "").slice(0, MAX_TEXT_LENGTH);

    const safety = evaluateSafety(freeText);
    if (safety.status === "block") {
      response.status(400).json({ error: "unsafe_prompt", decision: safety });
      return;
    }

    const level = generateLevel({
      mission,
      selectedCards,
      freeText: safety.rewrittenInput ?? freeText
    });

    response.json({
      level: levelSpecSchema.parse(level),
      safety
    });
  });

  app.post("/v1/improve-level", (request, response) => {
    const level = levelSpecSchema.parse(request.body?.level);
    const mission = request.body?.mission ? missionDefinitionSchema.parse(request.body.mission) : undefined;
    const improveCards = Array.isArray(request.body?.improveCards)
      ? request.body.improveCards.map((card: unknown) => promptCardSchema.parse(card))
      : [];
    const note = String(request.body?.note ?? "").slice(0, MAX_TEXT_LENGTH);

    const safety = evaluateSafety(note);
    if (safety.status === "block") {
      response.status(400).json({ error: "unsafe_prompt", decision: safety });
      return;
    }

    const updatedLevel = improveLevel(level, improveCards, safety.rewrittenInput ?? note, mission?.maxEnemies);

    response.json({ level: updatedLevel, safety });
  });
}
