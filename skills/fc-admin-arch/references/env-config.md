# Environment Configuration — future-community-manage

Three env files, one per deploy mode:

- `.env.development` — `pnpm dev`
- `.env.staging` — pre-prod build
- `.env.production` — `pnpm build:prod`

All variables must be prefixed `VITE_` to be exposed to client code via `import.meta.env`.

## Common variables

| Variable | Purpose | Consumers |
|---|---|---|
| `VITE_APP_TITLE` | App title shown in browser tab + login page | `src/layout/components/Header.vue`, `src/views/login/index.vue` |
| `VITE_APP_BASE_API` | Backend base URL (e.g. `/prod-api`, `/dev-api`) | `src/utils/request.ts` |
| `VITE_USE_MOCK` | `"true"` to use Mock adapters, `"false"` for real | `src/api/**/adapter.ts` |
| `VITE_ENABLE_SPECIAL_PAGE` | `"1"` to bundle 台州路/蚕花园 special pages, `"0"` to exclude | `vite.config.ts`, `src/router/specialRoutes.*.ts` |
| `VITE_HMAC_USER` / `VITE_HMAC_KEY` | 八爪鱼 HMAC credentials | `src/utils/sign.ts` |

## Reading env in code

```ts
const baseURL = import.meta.env.VITE_APP_BASE_API
const useMock = import.meta.env.VITE_USE_MOCK === 'true'
```

## Counter-examples (DO NOT)

- ❌ Reading `process.env.VITE_*` — Vite replaces `import.meta.env.*`, not `process.env`.
- ❌ Adding a non-`VITE_` variable expecting it to be exposed — it won't be.
- ❌ Hardcoding API URLs in code — always go through `VITE_APP_BASE_API`.

## Adding a new env variable

1. Add it to all three `.env.*` files (with appropriate values per env).
2. Restart `pnpm dev` so Vite picks it up.
3. Type it in `src/types/env.d.ts` (or `vite-env.d.ts`) for autocomplete.