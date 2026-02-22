import path from "node:path";
import { promises as fs } from "node:fs";
import { ensureDir, pathExists } from "../fs-utils.js";

export async function runInit(rootDir: string): Promise<void> {
  const missionsDir = path.join(rootDir, "missions");
  const distDir = path.join(rootDir, "dist", "mission-packs");

  await ensureDir(missionsDir);
  await ensureDir(distDir);

  const gitignorePath = path.join(rootDir, ".pixelforgeignore");
  if (!(await pathExists(gitignorePath))) {
    await fs.writeFile(gitignorePath, "dist\nnode_modules\n", "utf8");
  }

  // eslint-disable-next-line no-console
  console.log(`Initialized PixelForge mission workspace at ${rootDir}`);
}
