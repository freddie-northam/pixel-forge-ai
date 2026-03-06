// --- Blocked terms organized by category ---

const SEXUAL_CONTENT = [
  "sexual", "nude", "nudity", "naked", "pornography", "erotic",
  "genitalia", "intercourse", "orgasm", "fetish", "hentai",
  "stripper", "prostitute", "brothel", "rape"
];

const PROFANITY_SLURS = [
  "fuck", "shit", "bitch", "bastard", "ass", "damn",
  "slut", "whore", "cunt", "dick", "cock", "piss",
  "nigger", "nigga", "faggot", "retard", "spic", "kike", "chink"
];

const DRUGS_ALCOHOL = [
  "cocaine", "heroin", "meth", "methamphetamine", "marijuana", "weed",
  "ecstasy", "lsd", "ketamine", "fentanyl", "crack", "opium",
  "drug dealer", "overdose", "drunk", "alcohol", "beer", "vodka",
  "cigarette", "vaping", "smoke weed"
];

const BULLYING_HARASSMENT = [
  "bully", "bullying", "harass", "harassment", "stalk", "stalking",
  "intimidate", "humiliate", "degrade", "torment", "cyberbully",
  "fat shame", "body shame", "loser", "worthless"
];

const GROOMING_PATTERNS = [
  "send me a photo", "how old are you", "keep this secret",
  "dont tell anyone", "meet me alone", "come to my house",
  "special friend", "secret relationship", "age is just a number",
  "send pics", "webcam", "underage"
];

const VIOLENCE_HORROR_DEATH = [
  "violence", "violent", "gore", "blood", "guts", "intestines", "decapitate", "dismember",
  "mutilate", "torture", "corpse", "cadaver", "autopsy",
  "murder", "kill", "slaughter", "massacre", "execution",
  "suicide", "self-harm", "self harm", "cut myself", "hang myself"
];

const EXTREMISM = [
  "terrorism", "terrorist", "jihad", "white supremacy", "nazi",
  "ethnic cleansing", "genocide", "extremist", "radicalize",
  "hate group", "hate crime", "supremacist", "aryan"
];

const WEAPONS = [
  "weapon", "gun", "firearm", "rifle", "pistol", "shotgun",
  "assault rifle", "machine gun", "grenade", "explosive", "bomb",
  "dynamite", "molotov", "ammunition", "sniper", "shoot to kill"
];

const PERSONAL_INFO = [
  "personal address", "phone number", "social security",
  "credit card", "bank account", "password", "home address",
  "ip address", "real name", "school name", "doxxing", "dox"
];

const HATE_DISCRIMINATION = [
  "hate", "hate speech", "racism", "racist", "sexism", "sexist",
  "homophobia", "homophobic", "transphobia", "transphobic",
  "antisemitism", "islamophobia", "xenophobia", "bigot"
];

export const BLOCKED_TERMS = [
  ...SEXUAL_CONTENT,
  ...PROFANITY_SLURS,
  ...DRUGS_ALCOHOL,
  ...BULLYING_HARASSMENT,
  ...GROOMING_PATTERNS,
  ...VIOLENCE_HORROR_DEATH,
  ...EXTREMISM,
  ...WEAPONS,
  ...PERSONAL_INFO,
  ...HATE_DISCRIMINATION
];

// --- Leetspeak map for evasion-resistant normalization ---
const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s",
  "!": "i"
};

/**
 * Normalizes user input to defeat common evasion techniques:
 * - lowercases
 * - converts leetspeak (1->i, 0->o, 3->e, 4->a, 5->s, @->a, etc.)
 * - strips non-alpha characters (after leet conversion)
 * - collapses repeated characters (e.g. "viiiolence" -> "violence")
 */
export function normalizeInput(raw: string): string {
  const lowered = raw.toLowerCase();

  // Replace leetspeak characters
  let converted = "";
  for (const ch of lowered) {
    converted += LEET_MAP[ch] ?? ch;
  }

  // Strip non-alpha characters
  const alphaOnly = converted.replace(/[^a-z]/g, "");

  // Collapse repeated characters (3+ of the same char -> single)
  const collapsed = alphaOnly.replace(/(.)\1{2,}/g, "$1");

  return collapsed;
}

export const SAFE_THEME_SUGGESTIONS = [
  "treasure hunt",
  "maze escape",
  "space rescue",
  "robot repair",
  "forest cleanup"
];

export const DEFAULT_PROVIDER_NAME = "mock-safe-provider";
