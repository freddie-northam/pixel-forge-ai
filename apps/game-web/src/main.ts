import {
  levelSpecSchema,
  missionDefinitionSchema,
  type LevelSpec,
  type MissionDefinition,
  type PromptCard
} from "@pixelforge/shared";
import { createGame, loadLevelIntoGame } from "./game/game";
import { mountPromptPanel } from "./ui/prompt-panel";
import { getOrCreateProfile, loadDraft, saveDraft, updateProgress } from "./store/local-save";
import "./styles.css";

const API_BASE = import.meta.env.VITE_AI_PROXY_BASE_URL ?? "http://localhost:4242/v1";
const API_TIMEOUT_MS = 10_000;

interface GenerateResponse {
  level: LevelSpec;
  safety: { status: "allow" | "rewrite" | "block"; reason: string; guidance: string[] };
}

function emitStatus(message: string, kind: "success" | "error" = "success"): void {
  window.dispatchEvent(new CustomEvent("pfjr:status", { detail: { message, kind } }));
}

async function loadMission(): Promise<MissionDefinition> {
  const response = await fetch("/missions/space-rescue/mission.json");
  if (!response.ok) {
    throw new Error("Failed to load mission");
  }

  return missionDefinitionSchema.parse(await response.json());
}

async function loadSeedLevel(): Promise<LevelSpec> {
  const response = await fetch("/missions/space-rescue/seed-level.json");
  if (!response.ok) {
    throw new Error("Failed to load seed level");
  }

  return levelSpecSchema.parse(await response.json());
}

async function postGenerate(mission: MissionDefinition, selectedCards: PromptCard[], freeText: string): Promise<GenerateResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/generate-level`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mission, selectedCards, freeText }),
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Generate failed: ${body}`);
    }

    return (await response.json()) as GenerateResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Generation request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function postImprove(level: LevelSpec, improveCards: PromptCard[], note: string): Promise<GenerateResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/improve-level`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, improveCards, note }),
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Improve failed: ${body}`);
    }

    return (await response.json()) as GenerateResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Improve request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function makeOnWin(missionId: string, score: number, message: string): () => void {
  return () => {
    updateProgress(missionId, score);
    emitStatus(message, "success");
  };
}

function makeOnFail(message: string): () => void {
  return () => emitStatus(message, "error");
}

async function boot(): Promise<void> {
  getOrCreateProfile();

  const mission = await loadMission();
  let activeLevel = loadDraft() ?? (await loadSeedLevel());

  const runtime = createGame(
    "game",
    activeLevel,
    makeOnWin(mission.id, 85, "Mission complete! You shipped a playable level."),
    makeOnFail("You were tagged by an enemy. Try an improvement card.")
  );

  const panel = document.getElementById("panel");
  if (!panel) {
    throw new Error("Missing #panel element");
  }

  mountPromptPanel(panel, {
    mission,
    onGenerate: async (selectedCards, freeText) => {
      try {
        const response = await postGenerate(mission, selectedCards, freeText);
        const parsed = levelSpecSchema.parse(response.level);
        activeLevel = parsed;
        saveDraft(parsed);
        loadLevelIntoGame(
          runtime,
          parsed,
          makeOnWin(mission.id, 85, "Mission complete! You shipped a playable level."),
          makeOnFail("You were tagged by an enemy. Try an improvement card.")
        );

        if (response.safety.status === "rewrite") {
          emitStatus(`Safety coach: ${response.safety.reason}`, "error");
        } else {
          emitStatus("Level generated. Test it with arrow keys.", "success");
        }
      } catch (error) {
        emitStatus(error instanceof Error ? error.message : "Generation failed", "error");
      }
    },
    onImprove: async (improveCards, note) => {
      try {
        const response = await postImprove(activeLevel, improveCards, note);
        const parsed = levelSpecSchema.parse(response.level);
        activeLevel = parsed;
        saveDraft(parsed);

        loadLevelIntoGame(
          runtime,
          parsed,
          makeOnWin(mission.id, 90, "Improved level completed. Great iteration!"),
          makeOnFail("Retry with a fairness improvement card.")
        );

        if (response.safety.status === "rewrite") {
          emitStatus(`Safety coach adjusted your note: ${response.safety.reason}`, "error");
        } else {
          emitStatus("Level improved and reloaded.", "success");
        }
      } catch (error) {
        emitStatus(error instanceof Error ? error.message : "Improve failed", "error");
      }
    }
  });

  emitStatus("Select prompt cards, generate a level, and play with arrow keys.", "success");
}

boot().catch((error: unknown) => {
  emitStatus(error instanceof Error ? error.message : "Failed to boot game", "error");
});
