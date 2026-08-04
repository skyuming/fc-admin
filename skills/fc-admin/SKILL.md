---
name: fc-admin
description: Use when the user invokes "fc-admin", "用 fc-admin", or asks for help with a Vue 3 admin project modeled after future-community-manage (vue3-element-admin). Dispatches to fc-admin-crud (module scaffolding), fc-admin-arch (project conventions), or fc-admin-review (code review). Triggers: fc-admin, admin skill, future-community admin, vue3 element-plus admin, fc 后台, fc admin, thirdnet fc, 未来社区后台, fc-admin 帮我加模块, fc-admin 帮我 review.
---

# fc-admin — Entry / Dispatcher

This is the entry skill for the `fc-admin` plugin. It owns **dispatch**, not implementation.

## What this plugin is

A project-specific skill set for working on the `future-community-manage` admin (Vue 3 + Vite + TypeScript + Pinia + Vue Router + Element Plus).

It provides three sub-skills:

| Sub-skill | Use when user wants to... |
|---|---|
| `fc-admin-crud` | generate / modify a business module (API + page + route + permissions) |
| `fc-admin-arch` | understand a project convention (routing, permissions, dictionaries, adapters, env, store) |
| `fc-admin-review` | audit code or review a PR / file / directory |

## Dispatch table

When this skill loads, **first decide** which sub-skill fits:

```
1. User wants to generate / modify a business module?     → invoke fc-admin-crud
2. User asks "how do I use X" about a project mechanism?  → invoke fc-admin-arch
3. User asks "is this code OK / review / check / 走查"?   → invoke fc-admin-review
4. Intent ambiguous or spans multiple?                    → ask the user which one
5. Task unrelated to a Vue 3 element-plus admin?          → reply normally, do NOT invoke any sub-skill
```

## Explicitly out of scope

This plugin **does not** cover:

- Backend code (no .NET, no API server, no database).
- 未来社区 business-domain knowledge (8 futures, communities, equipment, points, etc.).
- Scaffolding scripts, code templates, or codegen CLIs — CRUD generation is guided Q&A only.
- Marketplace packaging, settings.json hooks, automatic triggers.
- Cross-project general-purpose Vue 3 admin guidance — only this project's conventions.

If a user asks for any of the above, reply normally without invoking a sub-skill.

## Inter-skill references

Sub-skills reference each other via document anchors (e.g., `[[fc-admin-arch#routing]]`), never by embedding another SKILL's body. Keep the loaded context window narrow.

## Trigger phrases

This skill auto-loads on phrases including: "fc-admin", "fc 后台", "用 fc-admin", "fc admin 帮我", "future-community admin", "vue3 element-plus admin", "未来社区后台 skill".

Once loaded, immediately apply the dispatch table — do not write code or explain architecture in this skill.