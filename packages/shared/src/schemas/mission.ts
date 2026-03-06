import { z } from "zod";

export const themeSchema = z.enum(["space", "jungle", "city", "custom"]);
export type Theme = z.infer<typeof themeSchema>;

export const missionDifficultySchema = z.enum(["starter", "builder", "iterative", "evaluator"]);
export type MissionDifficulty = z.infer<typeof missionDifficultySchema>;

export const promptCardCategorySchema = z.enum([
  "goal", "mechanic", "enemy", "constraint", "improve", "reflection"
]);
export type PromptCardCategory = z.infer<typeof promptCardCategorySchema>;

export const promptCardSchema = z.object({
  id: z.string().min(1),
  category: promptCardCategorySchema,
  label: z.string().min(1).max(200),
  value: z.string().min(1).max(200),
  helpText: z.string().optional()
});

export type PromptCard = z.infer<typeof promptCardSchema>;

export const objectiveSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  required: z.boolean()
});

export type MissionObjective = z.infer<typeof objectiveSchema>;

export const rubricSchema = z.object({
  clarity: z.number().int().min(0).max(100),
  fairness: z.number().int().min(0).max(100),
  fun: z.number().int().min(0).max(100)
});

export type RubricWeight = z.infer<typeof rubricSchema>;

export const missionDefinitionSchema = z
  .object({
    missionPackVersion: z.string().regex(/^1\./, "missionPackVersion must be 1.x"),
    id: z.string().min(3),
    title: z.string().min(3).max(100),
    description: z.string().min(8).max(500),
    ageBand: z.literal("10-13"),
    theme: themeSchema,
    difficulty: missionDifficultySchema,
    sessionMinutes: z.number().int().min(5).max(30),
    gridWidth: z.number().int().min(10).max(40),
    gridHeight: z.number().int().min(8).max(30),
    maxEnemies: z.number().int().min(0).max(20),
    maxHazards: z.number().int().min(0).max(30),
    objectives: z.array(objectiveSchema).min(1),
    promptCards: z.array(promptCardSchema).min(4),
    rubric: rubricSchema
  })
  .superRefine((mission, ctx) => {
    const requiredObjectives = mission.objectives.filter((item) => item.required).length;
    if (requiredObjectives === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["objectives"],
        message: "At least one objective must be required"
      });
    }

    const rubricTotal = mission.rubric.clarity + mission.rubric.fairness + mission.rubric.fun;
    if (rubricTotal !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rubric"],
        message: "Rubric weights must total 100"
      });
    }
  });

export type MissionDefinition = z.infer<typeof missionDefinitionSchema>;
