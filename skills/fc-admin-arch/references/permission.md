# Permission Conventions — future-community-manage

Three layers of permission:

1. **Route-level** — `meta.roles` on a route record.
2. **Button-level** — `v-permission="['code']"` directive on any element.
3. **API-level** — backend enforces; frontend just hides UI.

## Button-level: `v-permission`

Globally registered in `src/directive/permission/index.ts`. Reads allowed codes from `useUserStore().btnCodes`.

```vue
<el-button v-permission="['community:article:add']" @click="onAdd">新增</el-button>
```

```ts
// programmatic check inside <script setup>
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()
const canEdit = userStore.btnCodes.includes('community:article:edit')
```

## Route-level: `meta.roles`

```ts
{
  path: '/admin/users',
  component: () => import('@/views/system/user/index.vue'),
  meta: {
    title: '用户管理',
    icon: 'ep:user',
    roles: ['admin']  // only 'admin' role can see this route
  }
}
```

If `meta.roles` is omitted, any authenticated user can access.

## Permission tree flow

1. User logs in → backend returns `permissionTree` (menu + button codes).
2. `useUserStore.login(...)` stores it; `permission.ts` (root-level guard) calls `router.addRoute(...)` for each menu node.
3. On page refresh, `permission.ts` rehydrates the dynamic routes from `localStorage` (or re-fetches if expired).
4. `v-permission` looks up `btnCodes` for the current page.

## Counter-examples (DO NOT)

- ❌ Checking permissions with `localStorage.getItem('roles')` directly — bypasses the store and breaks reactivity.
- ❌ Using `v-if="user.role === 'admin'"` for buttons — use `v-permission` instead so it's consistent with the backend.
- ❌ Mutating `meta.roles` after the route is registered — Vue Router does not react to meta changes.