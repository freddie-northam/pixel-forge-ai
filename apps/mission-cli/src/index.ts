#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runCreate } from "./commands/create.js";
import { runValidate } from "./commands/validate.js";
import { runMissionTest } from "./commands/test.js";
import { runPack } from "./commands/pack.js";
import { runPreview } from "./commands/preview.js";

const cli = new Command();
const rootDir = process.cwd();

cli.name("pixelforge").description("Mission Pack CLI for PixelForge Jr").version("0.1.0");

cli
  .command("init")
  .description("Initialize mission workspace")
  .action(async () => {
    await runInit(rootDir);
  });

cli
  .command("mission:create")
  .argument("<slug>")
  .description("Create a mission scaffold")
  .action(async (slug: string) => {
    await runCreate(rootDir, slug);
  });

cli
  .command("mission:validate")
  .description("Validate one or all missions")
  .option("--slug <slug>", "Mission slug")
  .action(async (options: { slug?: string }) => {
    await runValidate(rootDir, options.slug);
  });

cli
  .command("mission:test")
  .argument("<slug>")
  .description("Run quick mission scoring test")
  .action(async (slug: string) => {
    await runMissionTest(rootDir, slug);
  });

cli
  .command("mission:pack")
  .argument("<slug>")
  .description("Bundle a mission pack zip")
  .action(async (slug: string) => {
    await runPack(rootDir, slug);
  });

cli
  .command("mission:preview")
  .argument("<slug>")
  .description("Preview mission summary")
  .action(async (slug: string) => {
    await runPreview(rootDir, slug);
  });

cli.parseAsync(process.argv).catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : "Unexpected error");
  process.exit(1);
});
