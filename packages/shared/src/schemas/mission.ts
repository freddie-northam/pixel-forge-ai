import { z } from "zod";

export const promptCardSchema = z.object({
  id: z.string().min(1),
  category: z.enum(["goal", "mechanic", "enemy", "constraint", "improve", "reflection"]),
  label: z.string().min(1),
  value: z.string().min(1),
  helpText: z.string().optional()
});

export const objectiveSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  required: z.boolean()
});

export const rubricSchema = z.object({
  clarity: z.number().int().min(0).max(100),
  fairness: z.number().int().min(0).max(100),
  fun: z.number().int().min(0).max(100)
});

export const missionDefinitionSchema = z
  .object({
    missionPackVersion: z.string().regex(/^1\./, "missionPackVersion must be 1.x"),
    id: z.string().min(3),
    title: z.string().min(3),
    description: z.string().min(8),
    ageBand: z.literal("10-13"),
    theme: z.enum(["space", "jungle", "city", "custom"]),
    difficulty: z.enum(["starter", "builder", "iterative", "evaluator"]),
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

export type MissionDefinitionInput = z.infer<typeof missionDefinitionSchema>;
