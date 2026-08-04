---
name: fc-admin-crud
description: Use when the user asks to add, generate, scaffold, or modify a business module / page / CRUD interface in future-community-manage. Walks through 9 stages of questions, then emits the full module. Triggers: 帮我加一个模块, 新建业务模块, 生成 XX 页面, 加一个 CRUD, 帮我做 XX 模块, scaffold module, generate CRUD, add business module, new module page, 帮我加个楼栋管理, 帮我加个 XX 管理, 用 fc-admin 加模块.
---

# fc-admin-crud — CRUD Module Scaffolding

When the user wants to add or modify a business module in `future-community-manage`, this skill drives a **9-stage guided Q&A**. After the user confirms each stage, Claude emits one or more files into the project.

**You do not run code or templates** — you write each file directly with the Write tool, using the conventions enforced by `fc-admin-arch`.

## Pre-flight

Before starting, verify:

1. Current working directory is `future-community-manage` (or a fork).
2. `src/api/`, `src/views/`, `src/router/modules/` exist (Read `src/api/{any-existing-module}/adapter.ts` if unsure).
3. The user's target entity / module name is clear.

If any of the above is missing, ask the user before proceeding.

## The 9 stages

Run these one at a time. **Stop and wait for user confirmation** between each stage. Never bundle two stages into one response.

### Stage 1 — Module + entity name

Ask:
- Module name (kebab-case, e.g. `building`, `parking-lot`).
- Entity name (PascalCase singular, e.g. `Building`).
- Module path under `src/views/{module}/` (default: `{entity}/`).

Output: nothing yet.

### Stage 2 — Backend contract

Ask the user for the backend contract. Either:
- Paste a sample API response (JSON), or
- Point to a docs file (e.g. `/docs/api/building.md`).

Read it. Extract: list fields, query fields, return envelope shape.

Output: a JSON skeleton of the entity, shown back to the user for confirmation.

### Stage 3 — TS types

Emit `src/types/api/{entity}.ts` with:

```ts
export interface {Entity} {
  id: string
  // ... fields from Stage 2
}

export interface {Entity}Query {
  pageNum: number
  pageSize: number
  // ... search fields
}

export interface {Entity}Page {
  records: {Entity}[]
  total: number
}
```

Plus `ApiResponse<T>` (import from `@/types/api/common`).

### Stage 4 — IxxApi contract interface

Emit `src/api/{module}/{entity}.ts`:

```ts
import type { {Entity}, {Entity}Query, {Entity}Page } from '@/types/api/{entity}'
import type { ApiResponse } from '@/types/api/common'

export interface I{Entity}Api {
  listPage(query: {Entity}Query): Promise<ApiResponse<{Entity}Page>>
  getById(id: string): Promise<ApiResponse<{Entity}>>
  add(data: {Entity}): Promise<ApiResponse<void>>
  update(data: {Entity}): Promise<ApiResponse<void>>
  remove(ids: string[]): Promise<ApiResponse<void>>
}
```

### Stage 5 — Mock implementation

Emit `src/api/{module}/mock/{entity}.ts` — class `Mock{Entity}Api implements I{Entity}Api` whose data comes from `src/mock/data/{entity}.ts` (create that file with a small seed array if it doesn't exist). Every method returns `{ code: 200, msg: 'ok', data: ... }`.

### Stage 6 — Real implementation

Emit `src/api/{module}/real/{entity}.ts` — class `Real{Entity}Api implements I{Entity}Api` whose methods call `request.get/post/put/delete` against `VITE_APP_BASE_API + '/{module}/{entity}/...'`. Auth header is auto-attached by `src/utils/request.ts`.

### Stage 7 — Adapter + index re-export

Emit two files:

`src/api/{module}/adapter.ts`:

```ts
import type { I{Entity}Api } from './{entity}'
import { Mock{Entity}Api } from './mock/{entity}'
import { Real{Entity}Api } from './real/{entity}'

export function create{Entity}Api(): I{Entity}Api {
  return import.meta.env.VITE_USE_MOCK === 'true'
    ? new Mock{Entity}Api()
    : new Real{Entity}Api()
}
```

`src/api/{module}/index.ts`:

```ts
import { create{Entity}Api } from './adapter'
export const {entity}Api = create{Entity}Api()
```

### Stage 8 — Pinia store (only if stateful)

Ask: does the page need shared state across components? If yes, emit `src/store/modules/{entity}.ts` per `fc-admin-arch/references/store-pinia.md`. If no, skip.

### Stage 9 — Route + page + sub-components

Emit three things:

1. `src/router/modules/{module}.ts` — one route record with full `meta` (title, icon, sort, roles, keepAlive). Default `sort = 100`; user can adjust.
2. `src/views/{module}/{entity}/index.vue` — `<script setup lang="ts">` + `<el-table>` (with columns + actions) + `<el-pagination>` + `<el-drawer>` form (new/edit).
3. `src/views/{module}/{entity}/components/{Entity}Form.vue` (if form is non-trivial).

## Completion checklist (must pass before claiming done)

- [ ] `I{Entity}Api` interface name = `{Entity}Api`; methods declare contract only
- [ ] Mock returns `{ code, msg, data }` envelope
- [ ] Real uses env-based baseURL + attaches Authorization header (handled by `request.ts`)
- [ ] `adapter.ts` switches on `import.meta.env.VITE_USE_MOCK`
- [ ] `index.vue` uses Element Plus + `v-permission` on action buttons
- [ ] Route `meta` includes `title / icon / sort / roles / keepAlive`
- [ ] `pnpm lint:eslint` passes on emitted files (run it; fix any errors)
- [ ] User has confirmed the page renders correctly in `pnpm dev`

## Output report

After all stages complete, output a summary:

```
fc-admin-crud: ✅ generated module '{entity}' under src/{api,views,router,store,types}/...
  Files created:
    - src/types/api/{entity}.ts
    - src/api/{module}/{entity}.ts
    - src/api/{module}/mock/{entity}.ts
    - src/api/{module}/real/{entity}.ts
    - src/api/{module}/adapter.ts
    - src/api/{module}/index.ts
    - src/router/modules/{module}.ts
    - src/views/{module}/{entity}/index.vue
    - (optional) src/store/modules/{entity}.ts
    - (optional) src/views/{module}/{entity}/components/{Entity}Form.vue
  Next steps:
    - Review and adjust column widths / sort order / role codes
    - Run pnpm lint:eslint
    - Re-login in pnpm dev to refresh permission tree
```

## Out of scope

- Explaining why the conventions are this way → `fc-admin-arch`.
- Auditing the emitted module → `fc-admin-review`.