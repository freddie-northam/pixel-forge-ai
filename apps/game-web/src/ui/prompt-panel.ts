import type { MissionDefinition, PromptCard } from "@pixelforge/shared";

interface PanelDeps {
  mission: MissionDefinition;
  onGenerate: (selectedCards: PromptCard[], freeText: string) => Promise<void>;
  onImprove: (selectedCards: PromptCard[], note: string) => Promise<void>;
}

export function mountPromptPanel(target: HTMLElement, deps: PanelDeps): void {
  const selected = new Map<string, PromptCard>();

  const title = document.createElement("h2");
  title.className = "panel-title";
  title.textContent = "Guided Prompt Cards";

  const cardsWrap = document.createElement("div");
  cardsWrap.className = "card-list";

  deps.mission.promptCards.forEach((card) => {
    const button = document.createElement("button");
    button.className = "card-button";
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.textContent = `[${card.category}] ${card.label}`;
    button.title = card.helpText ?? card.value;

    button.addEventListener("click", () => {
      if (selected.has(card.id)) {
        selected.delete(card.id);
        button.setAttribute("aria-pressed", "false");
      } else {
        selected.set(card.id, card);
        button.setAttribute("aria-pressed", "true");
      }
    });

    cardsWrap.append(button);
  });

  const textArea = document.createElement("textarea");
  textArea.placeholder = "Optional: add a short idea, e.g. 'robot rescue with safe challenge'";
  textArea.maxLength = 200;

  const controls = document.createElement("div");
  controls.className = "controls";

  const generateButton = document.createElement("button");
  generateButton.className = "primary";
  generateButton.textContent = "Generate Level";
  generateButton.addEventListener("click", async () => {
    status.textContent = "Generating...";
    status.className = "status";
    await deps.onGenerate(Array.from(selected.values()), textArea.value.trim());
  });

  const improveButton = document.createElement("button");
  improveButton.textContent = "Improve Current Level";
  improveButton.addEventListener("click", async () => {
    status.textContent = "Improving...";
    status.className = "status";
    await deps.onImprove(Array.from(selected.values()), textArea.value.trim());
  });

  controls.append(generateButton, improveButton);

  const status = document.createElement("p");
  status.className = "status";
  status.textContent = "Select cards and build your puzzle.";

  target.replaceChildren(title, cardsWrap, textArea, controls, status);

  const setStatus = (message: string, kind: "success" | "error" = "success") => {
    status.textContent = message;
    status.className = `status ${kind}`;
  };

  window.addEventListener("pfjr:status", (event) => {
    const custom = event as CustomEvent<{ message: string; kind: "success" | "error" }>;
    setStatus(custom.detail.message, custom.detail.kind);
  });
}
