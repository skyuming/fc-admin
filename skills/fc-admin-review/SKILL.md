---
name: fc-admin-review
description: Use when the user asks to review, audit, walk through, or check code or a PR in future-community-manage. Emits a 4-severity findings list after exhaustively reading the specified files. Triggers: review, 走查, 检查一下, 看一下有没有问题, code review, PR review, audit, 审查, 检查代码, 帮我看下, review this file, walk through this code.
---

# fc-admin-review — Code Review

When the user asks to review code, this skill walks the specified files exhaustively and emits a **4-severity findings list**. No preamble, no summary essay — just the list.

## What this skill does NOT do

- Generate new code (→ `fc-admin-crud`).
- Explain project conventions (→ `fc-admin-arch`).
- Run linters / tests / builds.
- Auto-fix any finding.

## Workflow

### Step 1 — Identify target

Ask (if not given):

- Specific file path, e.g. `src/views/community/article/index.vue`
- Or directory, e.g. `src/api/community/`
- Or PR / branch diff (read with `git diff main...HEAD`).

### Step 2 — Read every file

Use the Read tool on every file in scope. **No exceptions.** Do not skip files because they "look fine" — you must Read them.

For directories, list with `find` or `ls -R`, then Read each.

### Step 3 — Apply the checklist

For each file, check against this list (the full list lives in your context; load on demand):

**Naming & imports**
- [ ] Component file names PascalCase, others kebab-case.
- [ ] Import order: vue → third-party → `@/` → relative.
- [ ] No default-exported utilities imported as named.

**Types**
- [ ] No `any` unless escape-hatched with a comment explaining why.
- [ ] Props / emits typed via `defineProps<{}>()` / `defineEmits<{}>()`.
- [ ] API response unwrapped via `ApiResponse<T>` consistently.

**Vue 3 / setup**
- [ ] `<script setup lang="ts">` everywhere.
- [ ] `ref` for primitives + reactive objects; `reactive` only when grouping many fields.
- [ ] No Options API remnants.

**Element Plus**
- [ ] Auto-imported components only.
- [ ] `<el-form :model="..." :rules="...">` with `prop` bound on each `el-form-item`.
- [ ] `<el-table>` actions in a `fixed="right"` column with `v-permission`.

**Permissions**
- [ ] Action buttons (new / edit / delete) wrapped in `v-permission`.
- [ ] Route `meta.roles` set where applicable.
- [ ] No `localStorage.getItem('roles')` direct reads.

**Routing**
- [ ] New modules live under `src/router/modules/`, not inline in `index.ts`.
- [ ] `meta.title / icon / sort` set on every route.

**API / adapter**
- [ ] All API calls go through `xxxApi` (the adapter), never direct `request.get(...)`.
- [ ] `adapter.ts` switches on `VITE_USE_MOCK`, not in pages.

**Performance**
- [ ] Large lists use `el-table-v2` or virtual scroll if > 1000 rows.
- [ ] No inline arrow functions in templates that allocate per-render.

**Style / readability**
- [ ] No dead code, no commented-out blocks.
- [ ] Functions ≤ 50 lines; if longer, propose a split.

### Step 4 — Emit findings

Output format (no preamble):

```
🔴 [Blocker]
{symbolic-or-real path}:{line} — {one-line problem} — {one-line fix}

🟠 [Major]
{symbolic-or-real path}:{line} — {one-line problem} — {one-line fix}

🟡 [Minor]
...

🟢 [Nit]
...

📊 Summary
- 🔴 N blocker(s)
- 🟠 N major
- 🟡 N minor
- 🟢 N nit
- Files walked: N
```

Severity definitions:

| Level | Meaning | Action |
|---|---|---|
| 🔴 Blocker | Won't run / breaks build / data corruption | Must fix before merge |
| 🟠 Major | Violates a key project convention | Should fix |
| 🟡 Minor | Style / readability / minor convention drift | Suggested |
| 🟢 Nit | Personal preference / taste | Optional |

## Example output

```
🟠 src/views/community/article/index.vue:42 — delete button missing v-permission — add v-permission="['article:del']"
🟡 src/api/community/index.ts:3 — import order non-canonical — reorder to vue → third-party → @/ → relative
🟢 src/views/community/article/index.vue:1 — could collapse two adjacent ref() into one reactive() — optional

📊 Summary
- 🔴 0 blocker(s)
- 🟠 1 major
- 🟡 1 minor
- 🟢 1 nit
- Files walked: 1
```