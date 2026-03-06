import path from "node:path";
import { promises as fs } from "node:fs";
import {
  type MissionDefinition,
  type PromptCard,
  type RubricWeight,
  type TileSpec,
  type EntitySpec,
  type LevelSpec
} from "@pixelforge/shared";
import { ensureDir, pathExists, validateSlug, writeYaml } from "../fs-utils.js";

function starterCards(): PromptCard[] {
  return [
    { id: "goal-collect", category: "goal", label: "Collect and escape", value: "Collect the artifact then reach goal." },
    { id: "mechanic-switch", category: "mechanic", label: "Switches", value: "Use a switch to open the path." },
    { id: "enemy-bot", category: "enemy", label: "Patrol bot", value: "One patrol bot guards the goal." },
    { id: "constraint-time", category: "constraint", label: "Short run", value: "Finish in under 90 seconds." },
    { id: "improve-fair", category: "improve", label: "Make fair", value: "Make enemy pattern more predictable." },
    { id: "reflection-why", category: "reflection", label: "Explain change", value: "Describe one improvement you made." }
  ];
}

function defaultMission(slug: string): MissionDefinition {
  const rubric: RubricWeight = { clarity: 35, fairness: 35, fun: 30 };

  return {
    missionPackVersion: "1.0.0",
    id: slug,
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
    objectives: [
      { id: "obj-1", text: "Create one clear win condition.", required: true },
      { id: "obj-2", text: "Add one challenge and one hint.", required: true },
      { id: "obj-3", text: "Write one reflection sentence.", required: false }
    ],
    promptCards: starterCards(),
    rubric
  };
}

function defaultSeedLevel(slug: string): LevelSpec {
  const tiles: TileSpec[] = [
    { x: 0, y: 0, kind: "wall" },
    { x: 1, y: 0, kind: "wall" },
    { x: 18, y: 10, kind: "goal" }
  ];

  const entities: EntitySpec[] = [
    { id: "player-1", type: "player", x: 1, y: 1, behavior: "static" },
    { id: "enemy-1", type: "enemy", x: 16, y: 2, behavior: "patrol" },
    { id: "collect-1", type: "collectible", x: 10, y: 6, behavior: "static" }
  ];

  return {
    missionId: slug,
    version: "1.0.0",
    seed: "seed-template",
    gridWidth: 20,
    gridHeight: 12,
    tiles,
    entities,
    winCondition: "Collect the star and reach the goal.",
    failCondition: "Touching the bot resets to start.",
    rationale: "Template level for local mission testing."
  };
}

export async function runCreate(rootDir: string, slug: string): Promise<void> {
  validateSlug(slug);
  const missionDir = path.join(rootDir, "missions", slug);
  if (await pathExists(missionDir)) {
    throw new Error(`Mission ${slug} already exists`);
  }

  await ensureDir(path.join(missionDir, "seed-levels"));
  await ensureDir(path.join(missionDir, "assets"));

  await writeYaml(path.join(missionDir, "mission.yaml"), defaultMission(slug));
  await writeYaml(path.join(missionDir, "cards.yaml"), { cards: starterCards() });
  await writeYaml(path.join(missionDir, "rubric.yaml"), defaultMission(slug).rubric);
  await fs.writeFile(
    path.join(missionDir, "seed-levels", "starter-level.json"),
    JSON.stringify(defaultSeedLevel(slug), null, 2),
    "utf8"
  );

  // eslint-disable-next-line no-console
  console.log(`Created mission scaffold at missions/${slug}`);
}
