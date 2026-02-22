import path from "node:path";
import { promises as fs } from "node:fs";
import { levelSpecSchema, missionDefinitionSchema, type MissionDefinition, type LevelSpec } from "@pixelforge/shared";
import { readYaml } from "../fs-utils.js";

function scoreLevel(level: LevelSpec, mission: MissionDefinition): { score: number; rubric: Record<string, number> } {
  const clarity = Math.min(100, level.winCondition.length + level.failCondition.length);
  const fairness = level.entities.filter((item) => item.type === "enemy").length <= mission.maxEnemies ? 80 : 40;
  const fun = Math.min(100, level.entities.length * 20);

  const score = Math.round(
    (clarity * mission.rubric.clarity + fairness * mission.rubric.fairness + fun * mission.rubric.fun) / 100
  );

  return { score, rubric: { clarity, fairness, fun } };
}

export async function runMissionTest(rootDir: string, slug: string): Promise<void> {
  const missionDir = path.join(rootDir, "missions", slug);

  const mission = missionDefinitionSchema.parse(await readYaml(path.join(missionDir, "mission.yaml")));
  const level = levelSpecSchema.parse(
    JSON.parse(await fs.readFile(path.join(missionDir, "seed-levels", "starter-level.json"), "utf8"))
  );

  const result = scoreLevel(level, mission);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ mission: slug, result }, null, 2));
}
