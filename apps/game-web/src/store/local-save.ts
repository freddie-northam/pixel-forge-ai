import type { LevelSpec } from "@pixelforge/shared";

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

export function getOrCreateProfile(): Profile {
  const existing = window.localStorage.getItem(PROFILE_KEY);
  if (existing) {
    return JSON.parse(existing) as Profile;
  }

  const profile: Profile = {
    id: `local-${Math.random().toString(36).slice(2, 10)}`,
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
  return raw ? (JSON.parse(raw) as LevelSpec) : null;
}

export function updateProgress(missionId: string, score: number): void {
  const raw = window.localStorage.getItem(PROGRESS_KEY);
  const current = raw ? (JSON.parse(raw) as Progress) : { missionId, completions: 0, lastScore: 0 };
  const next: Progress = {
    missionId,
    completions: current.completions + 1,
    lastScore: score
  };
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
}

export function loadProgress(): Progress | null {
  const raw = window.localStorage.getItem(PROGRESS_KEY);
  return raw ? (JSON.parse(raw) as Progress) : null;
}
