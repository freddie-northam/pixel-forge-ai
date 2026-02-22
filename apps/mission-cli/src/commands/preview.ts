import path from "node:path";
import { missionDefinitionSchema } from "@pixelforge/shared";
import { readYaml } from "../fs-utils.js";

export async function runPreview(rootDir: string, slug: string): Promise<void> {
  const mission = missionDefinitionSchema.parse(
    await readYaml(path.join(rootDir, "missions", slug, "mission.yaml"))
  );

  // eslint-disable-next-line no-console
  console.log(`\nMission Preview: ${mission.title}`);
  // eslint-disable-next-line no-console
  console.log(`ID: ${mission.id}`);
  // eslint-disable-next-line no-console
  console.log(`Theme: ${mission.theme}`);
  // eslint-disable-next-line no-console
  console.log(`Difficulty: ${mission.difficulty}`);
  // eslint-disable-next-line no-console
  console.log(`Session: ${mission.sessionMinutes} minutes`);
  // eslint-disable-next-line no-console
  console.log("Objectives:");
  for (const objective of mission.objectives) {
    // eslint-disable-next-line no-console
    console.log(`- [${objective.required ? "x" : " "}] ${objective.text}`);
  }
}
