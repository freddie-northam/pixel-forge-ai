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

// --- Safety service tests ---

test("evaluateSafety allows safe prompt", () => {
  const decision = evaluateSafety("build a fun treasure hunt level");
  assert.equal(decision.status, "allow");
});

test("evaluateSafety rewrites blocked prompt", () => {
  const decision = evaluateSafety("make a violence mission");
  assert.equal(decision.status, "rewrite");
  assert.ok(decision.rewrittenInput);
});

test("evaluateSafety blocks multiple unsafe terms", () => {
  const decision = evaluateSafety("add violence and weapons to the level");
  assert.equal(decision.status, "block");
  assert.equal(decision.rewrittenInput, undefined);
});

test("evaluateSafety catches leetspeak bypass", () => {
  const decision = evaluateSafety("v1ol3nce");
  assert.notEqual(decision.status, "allow");
});

test("evaluateSafety catches spaced-out bypass", () => {
  const decision = evaluateSafety("v i o l e n c e");
  assert.notEqual(decision.status, "allow");
});

test("evaluateSafety catches zero-width char bypass", () => {
  const decision = evaluateSafety("vio\u200Blence");
  assert.notEqual(decision.status, "allow");
});

test("evaluateSafety handles empty input", () => {
  const decision = evaluateSafety("");
  assert.equal(decision.status, "allow");
});

// --- Level generator tests ---

test("generateLevel returns deterministic level spec", () => {
  const level = generateLevel({ mission, selectedCards: cards, freeText: "rescue mission" });
  assert.equal(level.missionId, mission.id);
  assert.equal(level.entities.filter((item) => item.type === "player").length, 1);
});

test("generateLevel is deterministic for same input", () => {
  const a = generateLevel({ mission, selectedCards: cards, freeText: "rescue mission" });
  const b = generateLevel({ mission, selectedCards: cards, freeText: "rescue mission" });
  assert.equal(a.seed, b.seed);
});

test("improveLevel can add challenge enemy", () => {
  const base = generateLevel({ mission, selectedCards: cards, freeText: "rescue mission" });
  const improved = improveLevel(base, [{ id: "i1", category: "improve", label: "Harder", value: "hard challenge" }], "");
  assert.ok(improved.entities.length > base.entities.length);
});

test("improveLevel respects maxEnemies limit", () => {
  const base = generateLevel({ mission, selectedCards: cards, freeText: "rescue mission" });
  // Base has 1 enemy. Improve twice with maxEnemies=2.
  const once = improveLevel(
    base,
    [{ id: "i1", category: "improve", label: "Harder", value: "hard challenge" }],
    "",
    2
  );
  assert.equal(once.entities.filter((e) => e.type === "enemy").length, 2);

  const twice = improveLevel(
    once,
    [{ id: "i2", category: "improve", label: "Harder still", value: "hard challenge" }],
    "",
    2
  );
  // Should NOT add another enemy since we're at maxEnemies
  assert.equal(twice.entities.filter((e) => e.type === "enemy").length, 2);
});

test("improveLevel applies safer modifier", () => {
  const base = generateLevel({ mission, selectedCards: cards, freeText: "rescue mission" });
  const improved = improveLevel(base, [{ id: "i1", category: "improve", label: "Safer", value: "make it safe and clear" }], "");
  assert.ok(improved.failCondition.includes("hint"));
});
