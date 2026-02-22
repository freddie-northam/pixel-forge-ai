# PixelForge Jr

PixelForge Jr is an open-source 8-bit browser mini-game that teaches kids (ages 10-13) how to use AI to build playable puzzle levels.

## Monorepo Layout
- `apps/game-web`: Phaser 3 game client
- `apps/ai-proxy`: server-side AI/safety proxy
- `apps/mission-cli`: terminal mission authoring CLI
- `packages/shared`: shared TypeScript schemas/types
- `missions/`: mission pack source files

## Quickstart
```bash
pnpm install
pnpm --filter @pixelforge/shared build
pnpm --filter @pixelforge/ai-proxy dev
pnpm --filter @pixelforge/game-web dev
```

## Mission CLI
```bash
pnpm --filter @pixelforge/mission-cli dev init
pnpm --filter @pixelforge/mission-cli dev mission:validate
pnpm --filter @pixelforge/mission-cli dev mission:preview space-rescue
pnpm --filter @pixelforge/mission-cli dev mission:pack space-rescue
```

## Endpoints
- `GET /v1/health`
- `GET /v1/providers`
- `POST /v1/safety/check`
- `POST /v1/generate-level`
- `POST /v1/improve-level`
