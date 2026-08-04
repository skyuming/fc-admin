---
name: fc-admin-arch
description: Use when the user asks how to use a project mechanism in future-community-manage: routing, permissions, dictionaries, adapters, env config, Pinia stores, component conventions. Triggers: 路由怎么配, v-permission 怎么用, 字典组件怎么接, adapter 怎么写, .env 变量有哪些, pinia 模块怎么写, element-plus 表格规范, 表单 drawer 怎么写, how to add route in this project, project permission directive, project dict component, project adapter pattern, project env variables, project store pattern.
---

# fc-admin-arch — Architecture Guide

When the user asks "how do I use X" or "where is X" about `future-community-manage`, this skill answers with **precise file references + minimal code snippets + counter-examples**. It does **not** generate whole modules (use `fc-admin-crud` for that) and does **not** audit code (use `fc-admin-review`).

## Project at a glance

- Repo root: typically `/Users/mum/Documents/work/FC/future-community-manage` (or a sibling fork).
- Stack: Vue 3 + Vite + TypeScript + Pinia + Vue Router 4 + Element Plus.
- Routing: this project does **NOT** use per-module `src/router/modules/*.ts`. Routes live in `src/router/index.ts` (constant) + `src/router/specialRoutes.{disabled,enabled}.ts` (special pages). See `references/routing.md`.
- API: each business module has exactly `src/api/{module}/index.ts` + `src/api/{module}/types.ts`. NO mock/real/adapter split. All HTTP goes through the global `request` helper (`src/utils/request.ts`). See `references/api-module-pattern.md`.
- Permission directive: **`v-has-perm`** (not `v-permission`), registered in `src/directive/permission/index.ts`, reads button codes from `useUserStoreHook().perms`. ROOT role bypasses all checks.
- Stores: per-domain Pinia stores under `src/store/modules/`. See `references/store-pinia.md`.

## Reference index

For deeper guidance on a specific topic, load the corresponding reference doc:

| Reference | Topic |
|---|---|
| `references/routing.md` | `specialRoutes.disabled.ts` / `enabled.ts`, route `meta`, what `viewModules.*.ts` actually is |
| `references/permission.md` | `v-has-perm` directive (NOT `v-permission`), button codes, route `roles` |
| `references/api-module-pattern.md` | `src/api/{module}/index.ts` + `types.ts` — the actual API convention |
| `references/env-config.md` | `.env.development` / `.env.staging` / `.env.production` variables and consumers |
| `references/store-pinia.md` | Pinia setup, module pattern, persistent state, getters for permission tree |
| `references/component-conventions.md` | Element Plus usage, dict components, table column conventions, drawer forms |

When answering a user question, load only the reference doc(s) that match the question. Do **not** load all six.

## Answer format

Every answer must include:

1. **Location**: precise file/line reference, e.g. `src/router/index.ts:123`. Verify with Read/grep before quoting.
2. **Code snippet**: ≤ 30 lines, minimal viable example, copy-paste ready.
3. **Counter-example**: 1–2 common wrong usages and why they fail.
4. **Related conventions**: link to other reference docs in this skill where relevant.

## Quality checklist (before sending the answer)

- [ ] File/line references are verified with Read/grep — not invented.
- [ ] No npm packages referenced that aren't in `future-community-manage`'s `package.json`.
- [ ] No conventions imported from `thirdnet-fullstack` — this plugin is independent.
- [ ] Snippet length ≤ 30 lines.

## Out of scope

- Generating a whole business module → `fc-admin-crud`.
- Auditing existing code → `fc-admin-review`.
- 未来社区 product / business context → not covered by any skill in this plugin.