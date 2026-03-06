import { z } from "zod";

export const tileSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  kind: z.enum(["floor", "wall", "goal", "hazard"])
});

export type TileSpec = z.infer<typeof tileSchema>;

export const entitySchema = z.object({
  id: z.string().min(1),
  type: z.enum(["player", "enemy", "collectible"]),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  behavior: z.enum(["patrol", "static", "chase"]).optional()
});

export type EntitySpec = z.infer<typeof entitySchema>;

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

    // C4: Validate tile coordinates within grid bounds
    for (let i = 0; i < level.tiles.length; i++) {
      const tile = level.tiles[i];
      if (tile.x < 0 || tile.x >= level.gridWidth || tile.y < 0 || tile.y >= level.gridHeight) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tiles", i],
          message: `Tile at (${tile.x},${tile.y}) is outside grid bounds [0,${level.gridWidth}) x [0,${level.gridHeight})`
        });
      }
    }

    // C4: Validate entity coordinates within grid bounds
    for (let i = 0; i < level.entities.length; i++) {
      const entity = level.entities[i];
      if (entity.x < 0 || entity.x >= level.gridWidth || entity.y < 0 || entity.y >= level.gridHeight) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entities", i],
          message: `Entity "${entity.id}" at (${entity.x},${entity.y}) is outside grid bounds [0,${level.gridWidth}) x [0,${level.gridHeight})`
        });
      }
    }

    // M15: Validate entity IDs are unique
    const entityIds = new Set<string>();
    for (let i = 0; i < level.entities.length; i++) {
      const id = level.entities[i].id;
      if (entityIds.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entities", i, "id"],
          message: `Duplicate entity ID "${id}"`
        });
      }
      entityIds.add(id);
    }

    // M16: Validate tile coordinates are unique
    const tileCoords = new Set<string>();
    for (let i = 0; i < level.tiles.length; i++) {
      const key = `${level.tiles[i].x},${level.tiles[i].y}`;
      if (tileCoords.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tiles", i],
          message: `Duplicate tile at (${key})`
        });
      }
      tileCoords.add(key);
    }

    // M17: Validate no entity is placed on a wall tile
    const wallCoords = new Set<string>();
    for (const tile of level.tiles) {
      if (tile.kind === "wall") {
        wallCoords.add(`${tile.x},${tile.y}`);
      }
    }
    for (let i = 0; i < level.entities.length; i++) {
      const entity = level.entities[i];
      if (wallCoords.has(`${entity.x},${entity.y}`)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entities", i],
          message: `Entity "${entity.id}" is placed on a wall tile at (${entity.x},${entity.y})`
        });
      }
    }
  });

export type LevelSpec = z.infer<typeof levelSpecSchema>;
