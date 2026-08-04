# Routing Conventions — future-community-manage

This project does **not** use per-module route files. Routes are split across two files:

## Where routes live

- **Constant routes**: `src/router/index.ts` — login / redirect / error pages / dashboard / always-on entries.
- **Special / project-specific routes**: `src/router/specialRoutes.disabled.ts` (default, currently empty array) and `src/router/specialRoutes.enabled.ts` (when `VITE_ENABLE_SPECIAL_PAGE=1`, contains 台州路/蚕花园 etc.).
- Both files export `export const specialRoutes: RouteRecordRaw[] = [ ... ]`.
- `src/router/index.ts` spreads them via `...specialRoutes` into the global router.

> **NOT used in this project**: `src/router/modules/{module}.ts` per-module files. Don't create that directory.

## `viewModules.{disabled,enabled}.ts` — different purpose

`src/store/modules/viewModules.disabled.ts` and `.enabled.ts` are **not route files**. They control `import.meta.glob(...)` exclusions — which `.vue` files to drop from the bundle in each special-page mode. They exist for build size optimization, not navigation.

If you add a new view under `src/views/{module}/`, it is picked up automatically by `import.meta.glob` and you typically don't need to touch `viewModules.*.ts` unless you're adding pages that should be excluded in special-page mode.

## Route `meta` shape (this project)

```ts
interface RouteMeta {
  title?: string     // shown in sidebar + breadcrumbs
  icon?: string      // icon name (homepage / ep:xxx / svg-icon component)
  hidden?: boolean   // hide from sidebar (redirect routes, login, error pages)
  affix?: boolean    // pin tag in tag bar
  roles?: string[]   // allowed roles (if omitted, any authenticated user)
  keepAlive?: boolean
}
```

## Minimal new-route example

For a "notice" (公告) module added under `src/views/notice/index.vue`:

```ts
// src/router/specialRoutes.disabled.ts  ← ADD TO THIS FILE (when VITE_ENABLE_SPECIAL_PAGE=0)
// or
// src/router/specialRoutes.enabled.ts   ← ADD HERE (when VITE_ENABLE_SPECIAL_PAGE=1)

import { Layout } from "@/router/index";  // re-use the Layout component

export const specialRoutes: RouteRecordRaw[] = [
  {
    path: "/notice",
    component: Layout,
    redirect: "/notice/list",
    meta: { title: "公告管理", icon: "ep:document", hidden: false },
    children: [
      {
        path: "/notice/list",
        name: "NoticeList",
        component: () => import("@/views/notice/index.vue"),
        meta: { title: "公告列表", icon: "ep:list", roles: ["admin", "notice:editor"] }
      }
    ]
  }
];
```

Then **add the route file to `vite.config.ts` build inputs** if it isn't auto-discovered (most cases it is — the glob already covers `src/router/**`).

## Counter-examples (DO NOT)

- ❌ Creating `src/router/modules/{module}.ts` — this directory doesn't exist in this project; routes go in `specialRoutes.*.ts` or directly in `index.ts`.
- ❌ Hardcoding component imports (`import Foo from '@/views/notice/index.vue'` instead of dynamic `() => import(...)`) — breaks code-splitting.
- ❌ Forgetting `meta.title` — sidebar shows `path` as fallback and looks ugly.
- ❌ Defining the route in `specialRoutes.disabled.ts` AND `enabled.ts` — pick one based on whether it's a "special-page" route or a normal route.

## Adding a route for a new module

1. Create `src/views/{module}/{page}/index.vue`.
2. Decide: normal route or special-page route (special = tied to 台州路/蚕花园).
3. Add the route to `specialRoutes.disabled.ts` (or `.enabled.ts`).
4. Re-login in `pnpm dev` so the permission tree rehydrates.
5. Verify the sidebar entry appears and the page renders.