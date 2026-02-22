import test from "node:test";
import assert from "node:assert/strict";
import { missionDefinitionSchema, levelSpecSchema } from "../index.js";

test("missionDefinitionSchema accepts valid mission", () => {
  const parsed = missionDefinitionSchema.parse({
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
      { id: "c1", category: "goal", label: "Goal", value: "Collect and exit" },
      { id: "c2", category: "mechanic", label: "Switch", value: "Open door" },
      { id: "c3", category: "enemy", label: "Bot", value: "Patrol" },
      { id: "c4", category: "constraint", label: "Time", value: "90 sec" }
    ],
    rubric: { clarity: 35, fairness: 35, fun: 30 }
  });

  assert.equal(parsed.id, "space-rescue");
});

test("levelSpecSchema requires exactly one player", () => {
  assert.throws(() => {
    levelSpecSchema.parse({
      missionId: "space-rescue",
      version: "1.0.0",
      seed: "seed-1",
      gridWidth: 20,
      gridHeight: 12,
      tiles: [{ x: 18, y: 10, kind: "goal" }],
      entities: [
        { id: "p1", type: "player", x: 1, y: 1 },
        { id: "p2", type: "player", x: 2, y: 1 }
      ],
      winCondition: "Reach goal",
      failCondition: "Touch enemy",
      rationale: "invalid"
    });
  });
});
