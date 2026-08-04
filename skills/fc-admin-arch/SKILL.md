---
name: fc-admin-arch
description: Use when the user asks how to use a project mechanism in future-community-manage: routing, permissions, dictionaries, adapters, env config, Pinia stores, component conventions. Triggers: 路由怎么配, v-permission 怎么用, 字典组件怎么接, adapter 怎么写, .env 变量有哪些, pinia 模块怎么写, element-plus 表格规范, 表单 drawer 怎么写, how to add route in this project, project permission directive, project dict component, project adapter pattern, project env variables, project store pattern.
---

# fc-admin-arch — Architecture Guide

When the user asks "how do I use X" or "where is X" about `future-community-manage`, this skill answers with **precise file references + minimal code snippets + counter-examples**. It does **not** generate whole modules (use `fc-admin-crud` for that) and does **not** audit code (use `fc-admin-review`).

## Project at a glance

- Repo root: typically `/Users/mum/Documents/work/FC/future-community-manage` (or a sibling fork).
- Stack: Vue 3 + Vite + TypeScript + Pinia + Vue Router 4 + Element Plus.
- Dynamic routing: route definitions live under `src/router/modules/*.ts`; the global router in `src/router/index.ts` merges them at runtime based on the user's permission tree.
- Mock / Real adapter: `src/api/{module}/adapter.ts` switches on `import.meta.env.VITE_USE_MOCK`.
- Permission directive: `v-permission` is registered globally in `src/directive/permission/index.ts` and reads button-level codes from `useUserStore`.
- Dictionaries: `DictSelect` / `DictRadio` / etc. components read from `src/api/system/dict` and cache in `useDictStore`.

## Reference index

For deeper guidance on a specific topic, load the corresponding reference doc:

| Reference | Topic |
|---|---|
| `references/routing.md` | Dynamic routes, route `meta`, `specialRoutes.disabled.ts` / `enabled.ts`, sort order |
| `references/permission.md` | `v-permission` directive, button-level checks, route `roles`, login flow |
| `references/adapter-mock-real.md` | `adapter.ts` factory, `import.meta.env.VITE_USE_MOCK`, axios wrapper |
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