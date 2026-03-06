import { levelSpecSchema, type LevelSpec } from "@pixelforge/shared";

const PROFILE_KEY = "pfjr.profile";
const PROGRESS_KEY = "pfjr.progress";
const LEVEL_DRAFT_KEY = "pfjr.levelDrafts";

interface Profile {
  id: string;
  createdAt: string;
}

interface Progress {
  missionId: string;
  completions: number;
  lastScore: number;
}

function safeParse<T>(key: string): T | null {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn(`localStorage quota exceeded for key "${key}"`);
    } else {
      throw error;
    }
  }
}

function isProfile(value: unknown): value is Profile {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Profile).id === "string" &&
    typeof (value as Profile).createdAt === "string"
  );
}

function isProgress(value: unknown): value is Progress {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Progress).missionId === "string" &&
    typeof (value as Progress).completions === "number" &&
    typeof (value as Progress).lastScore === "number"
  );
}

export function getOrCreateProfile(): Profile {
  const existing = safeParse<unknown>(PROFILE_KEY);
  if (isProfile(existing)) {
    return existing;
  }

  const profile: Profile = {
    id: `local-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString()
  };

  safeSetItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function saveDraft(level: LevelSpec): void {
  safeSetItem(LEVEL_DRAFT_KEY, JSON.stringify(level));
}

export function loadDraft(): LevelSpec | null {
  const parsed = safeParse<unknown>(LEVEL_DRAFT_KEY);
  if (!parsed) return null;
  const result = levelSpecSchema.safeParse(parsed);
  if (!result.success) {
    window.localStorage.removeItem(LEVEL_DRAFT_KEY);
    return null;
  }
  return result.data;
}

export function updateProgress(missionId: string, score: number): void {
  const existing = safeParse<unknown>(PROGRESS_KEY);
  const current = isProgress(existing) ? existing : { missionId, completions: 0, lastScore: 0 };
  const next: Progress = {
    missionId,
    completions: current.completions + 1,
    lastScore: score
  };
  safeSetItem(PROGRESS_KEY, JSON.stringify(next));
}

export function loadProgress(): Progress | null {
  const parsed = safeParse<unknown>(PROGRESS_KEY);
  return isProgress(parsed) ? parsed : null;
}
