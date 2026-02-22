import path from "node:path";
import { promises as fs } from "node:fs";
import { levelSpecSchema, missionDefinitionSchema } from "@pixelforge/shared";
import { readYaml } from "../fs-utils.js";

interface ValidateResult {
  missionPath: string;
  ok: boolean;
  issues: string[];
}

async function validateOneMission(missionDir: string): Promise<ValidateResult> {
  const missionPath = path.join(missionDir, "mission.yaml");
  const seedPath = path.join(missionDir, "seed-levels", "starter-level.json");

  const issues: string[] = [];

  try {
    const mission = await readYaml(missionPath);
    missionDefinitionSchema.parse(mission);
  } catch (error) {
    issues.push(`mission.yaml: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  try {
    const rawSeed = await fs.readFile(seedPath, "utf8");
    const seed = JSON.parse(rawSeed);
    levelSpecSchema.parse(seed);
  } catch (error) {
    issues.push(`starter-level.json: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  return {
    missionPath: missionDir,
    ok: issues.length === 0,
    issues
  };
}

export async function runValidate(rootDir: string, slug?: string): Promise<void> {
  const missionRoot = path.join(rootDir, "missions");
  const entries = slug
    ? [slug]
    : (await fs.readdir(missionRoot, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
  const missionDirs = entries.map((entry) => path.join(missionRoot, entry));

  const results = await Promise.all(missionDirs.map((missionDir) => validateOneMission(missionDir)));

  const failed = results.filter((result) => !result.ok);
  for (const result of results) {
    if (result.ok) {
      // eslint-disable-next-line no-console
      console.log(`OK: ${path.basename(result.missionPath)}`);
      continue;
    }

    // eslint-disable-next-line no-console
    console.error(`FAILED: ${path.basename(result.missionPath)}`);
    for (const issue of result.issues) {
      // eslint-disable-next-line no-console
      console.error(`  - ${issue}`);
    }
  }

  if (failed.length > 0) {
    throw new Error(`Validation failed for ${failed.length} mission(s)`);
  }
}
