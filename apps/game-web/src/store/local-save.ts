import { levelSpecSchema, type LevelSpec } from "@pixelforge/shared";
import { z } from "zod";

const PROFILE_KEY = "pfjr.profile";
const PROGRESS_PREFIX = "pfjr.progress.";
const LEVEL_DRAFT_KEY = "pfjr.levelDrafts";

const profileSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1)
});

type Profile = z.infer<typeof profileSchema>;

const progressSchema = z.object({
  missionId: z.string().min(1),
  completions: z.number().int().min(0),
  lastScore: z.number().min(0)
});

type Progress = z.infer<typeof progressSchema>;

function safeParse<T>(raw: string | null, schema: z.ZodType<T>): T | null {
  if (!raw) return null;
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function getOrCreateProfile(): Profile {
  const existing = safeParse(window.localStorage.getItem(PROFILE_KEY), profileSchema);
  if (existing) {
    return existing;
  }

  const profile: Profile = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function saveDraft(level: LevelSpec): void {
  window.localStorage.setItem(LEVEL_DRAFT_KEY, JSON.stringify(level));
}

export function loadDraft(): LevelSpec | null {
  const raw = window.localStorage.getItem(LEVEL_DRAFT_KEY);
  if (!raw) return null;
  try {
    return levelSpecSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function updateProgress(missionId: string, score: number): void {
  const key = `${PROGRESS_PREFIX}${missionId}`;
  const current = safeParse(window.localStorage.getItem(key), progressSchema) ?? {
    missionId,
    completions: 0,
    lastScore: 0
  };
  const next: Progress = {
    missionId,
    completions: current.completions + 1,
    lastScore: score
  };
  window.localStorage.setItem(key, JSON.stringify(next));
}

export function loadProgress(missionId: string): Progress | null {
  return safeParse(window.localStorage.getItem(`${PROGRESS_PREFIX}${missionId}`), progressSchema);
}
