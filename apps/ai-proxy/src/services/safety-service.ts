import { BLOCKED_TERMS, SAFE_THEME_SUGGESTIONS, type SafetyDecision } from "@pixelforge/shared";

const rewriteGuidance = [
  "Try describing a puzzle objective instead of conflict.",
  "Use friendly words like rescue, discover, or collect.",
  "Avoid personal information in prompts."
];

export function evaluateSafety(input: string): SafetyDecision {
  const normalized = input.toLowerCase();
  const blocked = BLOCKED_TERMS.find((term) => normalized.includes(term));

  if (!blocked) {
    return {
      status: "allow",
      reason: "Prompt is safe for the target age band.",
      guidance: ["Nice work. Keep your level objective clear and positive."]
    };
  }

  const rewrittenInput = SAFE_THEME_SUGGESTIONS
    .map((theme) => `Build a ${theme} puzzle with one clear win condition.`)
    .join(" ");

  return {
    status: "rewrite",
    reason: `The phrase "${blocked}" is not allowed for kid-safe missions.`,
    guidance: rewriteGuidance,
    rewrittenInput
  };
}
