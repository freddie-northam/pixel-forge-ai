export type Theme = "space" | "jungle" | "city" | "custom";

export type MissionDifficulty = "starter" | "builder" | "iterative" | "evaluator";

export type PromptCardCategory =
  | "goal"
  | "mechanic"
  | "enemy"
  | "constraint"
  | "improve"
  | "reflection";

export interface PromptCard {
  id: string;
  category: PromptCardCategory;
  label: string;
  value: string;
  helpText?: string;
}

export interface MissionObjective {
  id: string;
  text: string;
  required: boolean;
}

export interface RubricWeight {
  clarity: number;
  fairness: number;
  fun: number;
}

export interface TileSpec {
  x: number;
  y: number;
  kind: "floor" | "wall" | "goal" | "hazard";
}

export interface EntitySpec {
  id: string;
  type: "player" | "enemy" | "collectible";
  x: number;
  y: number;
  behavior?: "patrol" | "static" | "chase";
}

export interface LevelSpec {
  missionId: string;
  version: string;
  seed: string;
  gridWidth: number;
  gridHeight: number;
  tiles: TileSpec[];
  entities: EntitySpec[];
  winCondition: string;
  failCondition: string;
  rationale: string;
}

export interface SafetyDecision {
  status: "allow" | "rewrite" | "block";
  reason: string;
  guidance: string[];
  rewrittenInput?: string;
}

export interface MissionDefinition {
  missionPackVersion: string;
  id: string;
  title: string;
  description: string;
  ageBand: "10-13";
  theme: Theme;
  difficulty: MissionDifficulty;
  sessionMinutes: number;
  gridWidth: number;
  gridHeight: number;
  maxEnemies: number;
  maxHazards: number;
  objectives: MissionObjective[];
  promptCards: PromptCard[];
  rubric: RubricWeight;
}

export interface MissionRunResult {
  missionId: string;
  levelSeed: string;
  score: number;
  rubricBreakdown: RubricWeight;
  reflectionPrompt: string;
}
