import {
  levelSpecSchema,
  missionDefinitionSchema,
  type LevelSpec,
  type MissionDefinition,
  type PromptCard
} from "@pixelforge/shared";

export interface GenerationInput {
  mission: MissionDefinition;
  selectedCards: PromptCard[];
  freeText?: string;
}

function hashSeed(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return `seed-${hash.toString(16)}`;
}

function makeBorderTiles(width: number, height: number) {
  const tiles = [] as LevelSpec["tiles"];

  for (let x = 0; x < width; x += 1) {
    tiles.push({ x, y: 0, kind: "wall" });
    tiles.push({ x, y: height - 1, kind: "wall" });
  }

  for (let y = 1; y < height - 1; y += 1) {
    tiles.push({ x: 0, y, kind: "wall" });
    tiles.push({ x: width - 1, y, kind: "wall" });
  }

  tiles.push({ x: width - 2, y: height - 2, kind: "goal" });
  return tiles;
}

export function generateLevel(input: GenerationInput): LevelSpec {
  const mission = missionDefinitionSchema.parse(input.mission);
  const cards = input.selectedCards;

  const joinedValues = cards.map((card) => card.value).join("|");
  const seed = hashSeed(`${mission.id}|${joinedValues}|${input.freeText ?? ""}`);

  const level: LevelSpec = {
    missionId: mission.id,
    version: "1.0.0",
    seed,
    gridWidth: mission.gridWidth,
    gridHeight: mission.gridHeight,
    tiles: makeBorderTiles(mission.gridWidth, mission.gridHeight),
    entities: [
      {
        id: "player-1",
        type: "player",
        x: 1,
        y: 1,
        behavior: "static"
      },
      {
        id: "enemy-1",
        type: "enemy",
        x: mission.gridWidth - 3,
        y: 1,
        behavior: "patrol"
      },
      {
        id: "star-1",
        type: "collectible",
        x: Math.floor(mission.gridWidth / 2),
        y: Math.floor(mission.gridHeight / 2),
        behavior: "static"
      }
    ],
    winCondition: "Collect the star then reach the goal tile.",
    failCondition: "Touching an enemy resets the puzzle.",
    rationale: `Generated from ${cards.length} guided cards with deterministic seed.`
  };

  return levelSpecSchema.parse(level);
}

const DEFAULT_MAX_ENEMIES = 10;

export function improveLevel(level: LevelSpec, improveCards: PromptCard[], note?: string, maxEnemies = DEFAULT_MAX_ENEMIES): LevelSpec {
  const validatedLevel = levelSpecSchema.parse(level);
  const modifiers = improveCards.map((card) => card.value.toLowerCase());

  const harder = modifiers.some((value) => value.includes("hard") || value.includes("challenge"));
  const safer = modifiers.some((value) => value.includes("safe") || value.includes("clear"));

  const currentEnemyCount = validatedLevel.entities.filter((e) => e.type === "enemy").length;
  const canAddEnemy = harder && currentEnemyCount < maxEnemies;

  const updated: LevelSpec = {
    ...validatedLevel,
    seed: hashSeed(`${validatedLevel.seed}|${modifiers.join("|")}|${note ?? ""}`),
    entities: canAddEnemy
      ? [
          ...validatedLevel.entities,
          {
            id: `enemy-${validatedLevel.entities.length + 1}`,
            type: "enemy",
            x: validatedLevel.gridWidth - 4,
            y: validatedLevel.gridHeight - 3,
            behavior: "chase"
          }
        ]
      : validatedLevel.entities,
    failCondition: safer
      ? "Touching hazards sends the player back to start with a hint bubble."
      : validatedLevel.failCondition,
    rationale: `Improved with ${improveCards.length} iteration cards.${note ? ` Note: ${note}` : ""}`
  };

  return levelSpecSchema.parse(updated);
}
