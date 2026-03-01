import { z } from "zod";

export const tileSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  kind: z.enum(["floor", "wall", "goal", "hazard"])
});

export const entitySchema = z.object({
  id: z.string().min(1),
  type: z.enum(["player", "enemy", "collectible"]),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  behavior: z.enum(["patrol", "static", "chase"]).default("static")
});

export const levelSpecSchema = z
  .object({
    missionId: z.string().min(1),
    version: z.string().default("1.0.0"),
    seed: z.string().min(3),
    gridWidth: z.number().int().min(10).max(40),
    gridHeight: z.number().int().min(8).max(30),
    tiles: z.array(tileSchema).min(1),
    entities: z.array(entitySchema).min(1),
    winCondition: z.string().min(5),
    failCondition: z.string().min(5),
    rationale: z.string().min(5)
  })
  .superRefine((level, ctx) => {
    const players = level.entities.filter((item) => item.type === "player").length;
    const goals = level.tiles.filter((item) => item.kind === "goal").length;

    if (players !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entities"],
        message: "Exactly one player entity is required"
      });
    }

    if (goals === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tiles"],
        message: "At least one goal tile is required"
      });
    }
  });

export type LevelSpecInput = z.infer<typeof levelSpecSchema>;
