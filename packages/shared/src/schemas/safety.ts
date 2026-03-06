import { z } from "zod";

export const safetyDecisionSchema = z
  .object({
    status: z.enum(["allow", "rewrite", "block"]),
    reason: z.string().min(3),
    guidance: z.array(z.string().min(3)).min(1),
    rewrittenInput: z.string().optional()
  })
  .refine(
    (d) => d.status !== "rewrite" || (d.rewrittenInput != null && d.rewrittenInput.length > 0),
    { path: ["rewrittenInput"], message: "rewrittenInput is required when status is \"rewrite\"" }
  )
  .refine(
    (d) => d.status === "rewrite" || d.rewrittenInput == null,
    { path: ["rewrittenInput"], message: "rewrittenInput must not be present unless status is \"rewrite\"" }
  );

export type SafetyDecision = z.infer<typeof safetyDecisionSchema>;
