import path from "node:path";
import { createWriteStream } from "node:fs";
import { promises as fs } from "node:fs";
import archiver from "archiver";
import { missionDefinitionSchema } from "@pixelforge/shared";
import { ensureDir, readYaml } from "../fs-utils.js";

export async function runPack(rootDir: string, slug: string): Promise<void> {
  const missionDir = path.join(rootDir, "missions", slug);
  const mission = missionDefinitionSchema.parse(await readYaml(path.join(missionDir, "mission.yaml")));

  const outDir = path.join(rootDir, "dist", "mission-packs", mission.missionPackVersion);
  await ensureDir(outDir);

  const outPath = path.join(outDir, `${slug}.zip`);
  await fs.rm(outPath, { force: true });

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (error) => reject(error));

    archive.pipe(output);
    archive.directory(missionDir, slug);
    void archive.finalize();
  });

  // eslint-disable-next-line no-console
  console.log(`Packed mission to ${outPath}`);
}
