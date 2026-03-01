import { BLOCKED_TERMS, SAFE_THEME_SUGGESTIONS, type SafetyDecision } from "@pixelforge/shared";

const rewriteGuidance = [
  "Try describing a puzzle objective instead of conflict.",
  "Use friendly words like rescue, discover, or collect.",
  "Avoid personal information in prompts."
];

const LEET_MAP: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s"
};

function deepNormalize(input: string): string {
  let text = input.toLowerCase();
  // Strip zero-width chars and other invisible unicode
  text = text.replace(/[\u200B-\u200F\u2028-\u202F\uFEFF]/g, "");
  // Transliterate common leetspeak substitutions
  text = text.replace(/[013457@$]/g, (ch) => LEET_MAP[ch] ?? ch);
  // Collapse all non-letter characters (spaces, punctuation, symbols) so
  // "v i o l e n c e" or "v.i.o.l.e.n.c.e" still match
  text = text.replace(/[^a-z]/g, "");
  return text;
}

export function evaluateSafety(input: string): SafetyDecision {
  const normalized = deepNormalize(input);
  const matchedTerms = BLOCKED_TERMS.filter((term) => normalized.includes(deepNormalize(term)));

  if (matchedTerms.length === 0) {
    return {
      status: "allow",
      reason: "Prompt is safe for the target age band.",
      guidance: ["Nice work. Keep your level objective clear and positive."]
    };
  }

  if (matchedTerms.length >= 2) {
    return {
      status: "block",
      reason: `Multiple unsafe terms detected. This content is not suitable for kid-safe missions.`,
      guidance: rewriteGuidance
    };
  }

  const rewrittenInput = SAFE_THEME_SUGGESTIONS
    .map((theme) => `Build a ${theme} puzzle with one clear win condition.`)
    .join(" ");

  return {
    status: "rewrite",
    reason: `The phrase "${matchedTerms[0]}" is not allowed for kid-safe missions.`,
    guidance: rewriteGuidance,
    rewrittenInput
  };
}
