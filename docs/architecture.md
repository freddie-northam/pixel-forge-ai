# PixelForge Jr Architecture

## Services
- `apps/game-web`: Phaser game runtime and guided prompt UI.
- `apps/ai-proxy`: provider adapter and safety pipeline for generation/improvement endpoints.
- `apps/mission-cli`: terminal-first mission pack authoring tools.
- `packages/shared`: schemas, types, and policy constants used by all apps.

## Runtime Flow
1. Mission metadata and cards are loaded from static mission JSON.
2. Player selects guided cards and optional free text.
3. Game client sends request to AI proxy.
4. AI proxy runs safety checks, then produces structured `LevelSpec` JSON.
5. Client validates schema, stores local draft, and hot-reloads puzzle scene.

## Safety Pipeline
- Input scanning against blocked terms.
- Coach-and-rewrite fallback for unsafe prompts.
- Output is always parsed through shared `LevelSpec` schema.
- Invalid output is rejected before entering runtime.
