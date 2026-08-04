# Routing Conventions — future-community-manage

## Where routes live

- Global router: `src/router/index.ts` — assembles constant routes + dynamic routes from the backend.
- Per-module routes: `src/router/modules/{module}.ts` — one file per business module, exported as a default `RouteRecordRaw[]`.
- Special-page routes: `src/router/specialRoutes.disabled.ts` (default) and `src/router/specialRoutes.enabled.ts` (when `VITE_ENABLE_SPECIAL_PAGE=1`).

## Route `meta` shape

```ts
interface RouteMeta {
  title: string        // shown in sidebar + breadcrumbs
  icon?: string        // Element Plus / iconify icon name
  sort?: number        // sidebar sort order (ascending)
  roles?: string[]     // role codes allowed; if undefined, any logged-in user
  keepAlive?: boolean  // whether to cache the page
  hidden?: boolean     // hide from sidebar (e.g. redirect routes)
}
```

## Minimal route example

```ts
// src/router/modules/community.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/community/article',
    component: () => import('@/views/community/article/index.vue'),
    meta: {
      title: '文章管理',
      icon: 'ep:document',
      sort: 5,
      roles: ['admin', 'community:editor'],
      keepAlive: true
    }
  }
]

export default routes
```

## Counter-examples (DO NOT)

- ❌ Defining routes inline in `src/router/index.ts` instead of under `src/router/modules/`.
- ❌ Forgetting `meta.title` — sidebar will fall back to `path` and look ugly.
- ❌ Hardcoding component imports (`import Foo from '...'` instead of dynamic `() => import(...)`) — breaks code-splitting.

## Adding a new module's routes

1. Create `src/router/modules/{module}.ts` with the shape above.
2. The global router picks it up automatically — **no edit to `src/router/index.ts` needed**, as long as it lives under `modules/`.
3. Run `pnpm dev` and confirm the new route appears in the sidebar (after re-login so the permission tree refreshes).