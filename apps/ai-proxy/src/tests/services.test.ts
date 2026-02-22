import test from "node:test";
import assert from "node:assert/strict";
import { evaluateSafety } from "../services/safety-service.js";
import { generateLevel, improveLevel } from "../services/level-generator.js";
import type { MissionDefinition, PromptCard } from "@pixelforge/shared";

const mission: MissionDefinition = {
  missionPackVersion: "1.0.0",
  id: "space-rescue",
  title: "Space Rescue Starter",
  description: "Build a one-screen rescue puzzle using guided AI prompt cards.",
  ageBand: "10-13",
  theme: "space",
  difficulty: "starter",
  sessionMinutes: 12,
  gridWidth: 20,
  gridHeight: 12,
  maxEnemies: 3,
  maxHazards: 8,
  objectives: [{ id: "obj-1", text: "Create a clear win condition", required: true }],
  promptCards: [
    { id: "g", category: "goal", label: "Goal", value: "Collect and exit" },
    { id: "m", category: "mechanic", label: "Mechanic", value: "Switch door" },
    { id: "e", category: "enemy", label: "Enemy", value: "Patrol bot" },
    { id: "c", category: "constraint", label: "Constraint", value: "90 seconds" }
  ],
  rubric: { clarity: 35, fairness: 35, fun: 30 }
};

const cards: PromptCard[] = mission.promptCards;

test("evaluateSafety rewrites blocked prompt", () => {
  const decision = evaluateSafety("make a violence mission");
  assert.equal(decision.status, "rewrite");
  assert.ok(decision.rewrittenInput);
});

test("generateLevel returns deterministic level spec", () => {
  const level = generateLevel({ mission, selectedCards: cards, freeText: "rescue mission" });
  assert.equal(level.missionId, mission.id);
  assert.equal(level.entities.filter((item) => item.type === "player").length, 1);
});

test("improveLevel can add challenge enemy", () => {
  const base = generateLevel({ mission, selectedCards: cards, freeText: "rescue mission" });
  const improved = improveLevel(base, [{ id: "i1", category: "improve", label: "Harder", value: "hard challenge" }], "");
  assert.ok(improved.entities.length > base.entities.length);
});
