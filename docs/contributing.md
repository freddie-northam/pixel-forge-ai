# Contributing

## Contribution Lanes (v1)
- Mission packs (`missions/*`)
- Pixel-art assets (`missions/*/assets`)
- Localization strings (future path in `apps/game-web/src/i18n`)

## Protected Core Paths
Changes to these areas require maintainer review:
- `apps/ai-proxy/src/services/safety-service.ts`
- `packages/shared/src/schemas/*`
- `apps/game-web/src/game/*`

## Local Checks
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`

## Mission Pack Rules
- Must validate with `pixelforge mission:validate`.
- Must include at least one required objective.
- Rubric weights must sum to 100.
- Seed level must contain exactly one player and at least one goal tile.
