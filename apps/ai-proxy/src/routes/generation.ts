import type { Express } from "express";
import { levelSpecSchema, missionDefinitionSchema, promptCardSchema } from "@pixelforge/shared";
import { generateLevel, improveLevel } from "../services/level-generator.js";
import { evaluateSafety } from "../services/safety-service.js";
import { asyncHandler } from "../middleware/async-handler.js";

const MAX_FREE_TEXT_LENGTH = 500;

export function registerGenerationRoutes(app: Express): void {
  app.post("/v1/generate-level", asyncHandler(async (request, response) => {
    const mission = missionDefinitionSchema.parse(request.body?.mission);
    const selectedCards = Array.isArray(request.body?.selectedCards)
      ? request.body.selectedCards.map((card: unknown) => promptCardSchema.parse(card))
      : [];
    const freeText = String(request.body?.freeText ?? "");

    if (freeText.length > MAX_FREE_TEXT_LENGTH) {
      response.status(400).json({ error: "validation_error", message: `freeText must be at most ${MAX_FREE_TEXT_LENGTH} characters.` });
      return;
    }

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
  }));

  app.post("/v1/improve-level", asyncHandler(async (request, response) => {
    const level = levelSpecSchema.parse(request.body?.level);
    const improveCards = Array.isArray(request.body?.improveCards)
      ? request.body.improveCards.map((card: unknown) => promptCardSchema.parse(card))
      : [];
    const note = String(request.body?.note ?? "");

    if (note.length > MAX_FREE_TEXT_LENGTH) {
      response.status(400).json({ error: "validation_error", message: `note must be at most ${MAX_FREE_TEXT_LENGTH} characters.` });
      return;
    }

    const safety = evaluateSafety(note);
    if (safety.status === "block") {
      response.status(400).json({ error: "unsafe_prompt", decision: safety });
      return;
    }

    const updatedLevel = improveLevel(level, improveCards, safety.rewrittenInput ?? note);

    response.json({ level: updatedLevel, safety });
  }));
}
