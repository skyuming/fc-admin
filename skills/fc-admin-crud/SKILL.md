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

### Stage 5 — API types file

Emit `src/api/{module}/types.ts` with the types from Stage 3. Naming follows `{Entity}{Purpose}`: `NoticeQuery`, `NoticeForm`, `NoticeInfo`, `NoticePageResult`, etc.

### Stage 6 — API functions file

Emit `src/api/{module}/index.ts` with one function per endpoint: `get{Entity}Page`, `get{Entity}`, `add{Entity}`, `update{Entity}`, `delete{Entity}`. Each function calls the global `request` helper (NOT `axios` directly, NOT a per-module mock/real split). See `fc-admin-arch/references/api-module-pattern.md` for the exact pattern.

### Stage 7 — (removed — no adapter file in this project)

This project does not use `src/api/{module}/adapter.ts` or per-module mock/real files. Skip directly to Stage 8.

### Stage 8 — Pinia store (only if stateful)

Ask: does the page need shared state across components? If yes, emit `src/store/modules/{entity}.ts` per `fc-admin-arch/references/store-pinia.md`. If no, skip.

### Stage 9 — Route + page + sub-components

Emit three things:

1. **Route entry** — add to `src/router/specialRoutes.disabled.ts` (normal route) or `src/router/specialRoutes.enabled.ts` (special-page route tied to 台州路/蚕花园). This project does **NOT** use `src/router/modules/`. See `fc-admin-arch/references/routing.md` for the exact pattern. Default `meta.sort = 100`; user can adjust. Include `title / icon / hidden / affix` at minimum.
2. **Page** — `src/views/{module}/{entity}/index.vue` with `<script setup lang="ts">` + `<el-table>` (with columns + actions) + `<el-pagination>` + `<el-drawer>` form (new/edit). Action buttons must use `v-has-perm="['code']"` (NOT `v-permission`).
3. **Sub-component** — `src/views/{module}/{entity}/components/{Entity}Form.vue` if the form is non-trivial (more than 5 fields, or has dependent fields).

## Completion checklist (must pass before claiming done)

- [ ] `src/api/{module}/types.ts` exports `{Entity}Query`, `{Entity}Form`, `{Entity}Info`, `{Entity}PageResult` (or equivalents)
- [ ] `src/api/{module}/index.ts` exports one function per endpoint, all delegating to `request({...})`
- [ ] No `mock/`, `real/`, or `adapter.ts` files inside `src/api/{module}/`
- [ ] No `src/router/modules/` directory created
- [ ] Route added to `specialRoutes.disabled.ts` (or `enabled.ts`); NOT `index.ts` constant section
- [ ] Route `meta` includes `title / icon` (and `roles` if applicable)
- [ ] `index.vue` uses Element Plus + `v-has-perm` on action buttons (NOT `v-permission`)
- [ ] `pnpm lint:eslint` passes on emitted files (run it; fix any errors)
- [ ] User has confirmed the page renders correctly in `pnpm dev`

## Output report

After all stages complete, output a summary:

```
fc-admin-crud: ✅ generated module '{entity}'
  Files created:
    - src/api/{module}/types.ts
    - src/api/{module}/index.ts
    - src/views/{module}/{entity}/index.vue
    - (optional) src/store/modules/{entity}.ts
    - (optional) src/views/{module}/{entity}/components/{Entity}Form.vue
  Files modified:
    - src/router/specialRoutes.disabled.ts (route entry added)
  Next steps:
    - Review and adjust column widths / role codes
    - Run pnpm lint:eslint
    - Re-login in pnpm dev to refresh permission tree
```

## Out of scope

- Explaining why the conventions are this way → `fc-admin-arch`.
- Auditing the emitted module → `fc-admin-review`.