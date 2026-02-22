import { promises as fs } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(targetPath: string): Promise<void> {
  await fs.mkdir(targetPath, { recursive: true });
}

export async function readYaml<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return yaml.load(raw) as T;
}

export async function writeYaml(filePath: string, value: unknown): Promise<void> {
  const content = yaml.dump(value, { noRefs: true, lineWidth: 100 });
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf8");
}

export async function copyFile(source: string, destination: string): Promise<void> {
  await ensureDir(path.dirname(destination));
  const content = await fs.readFile(source);
  await fs.writeFile(destination, content);
}
