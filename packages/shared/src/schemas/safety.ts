import { z } from "zod";

export const safetyDecisionSchema = z.object({
  status: z.enum(["allow", "rewrite", "block"]),
  reason: z.string().min(3),
  guidance: z.array(z.string().min(3)).min(1),
  rewrittenInput: z.string().optional()
});

export type SafetyDecisionInput = z.infer<typeof safetyDecisionSchema>;
