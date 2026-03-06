import { BLOCKED_TERMS, SAFE_THEME_SUGGESTIONS, normalizeInput, type SafetyDecision } from "@pixelforge/shared";

const SEVERE_TERMS = new Set([
  "sexual", "nude", "nudity", "naked", "pornography", "erotic",
  "genitalia", "intercourse", "orgasm", "fetish", "hentai",
  "stripper", "prostitute", "brothel", "rape",
  "send me a photo", "how old are you", "keep this secret",
  "dont tell anyone", "meet me alone", "come to my house",
  "special friend", "secret relationship", "age is just a number",
  "send pics", "webcam", "underage",
  "terrorism", "terrorist", "jihad", "white supremacy", "nazi",
  "ethnic cleansing", "genocide", "extremist", "radicalize",
  "hate group", "hate crime", "supremacist", "aryan",
  "nigger", "nigga", "faggot", "kike", "chink", "spic",
  "suicide", "self-harm", "self harm", "cut myself", "hang myself"
]);

const rewriteGuidance = [
  "Try describing a puzzle objective instead of conflict.",
  "Use friendly words like rescue, discover, or collect.",
  "Avoid personal information in prompts."
];

const blockGuidance = [
  "This type of content cannot be used in kid-safe missions.",
  "Try a completely different theme like treasure hunts or space exploration."
];

export function evaluateSafety(input: string): SafetyDecision {
  const normalized = normalizeInput(input);
  const normalizedTerms = BLOCKED_TERMS.map((term) => ({
    original: term,
    normalized: normalizeInput(term)
  }));

  const matched = normalizedTerms.find((t) => normalized.includes(t.normalized));

  if (!matched) {
    return {
      status: "allow",
      reason: "Prompt is safe for the target age band.",
      guidance: ["Nice work. Keep your level objective clear and positive."]
    };
  }

  if (SEVERE_TERMS.has(matched.original)) {
    return {
      status: "block",
      reason: "Your prompt contains content that isn't appropriate for kid-safe missions.",
      guidance: blockGuidance
    };
  }

  const rewrittenInput = SAFE_THEME_SUGGESTIONS
    .map((theme) => `Build a ${theme} puzzle with one clear win condition.`)
    .join(" ");

  return {
    status: "rewrite",
    reason: "Your prompt contains content that isn't appropriate for kid-safe missions.",
    guidance: rewriteGuidance,
    rewrittenInput
  };
}
