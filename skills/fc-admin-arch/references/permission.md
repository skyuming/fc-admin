# Permission Conventions — future-community-manage

Three layers of permission, all enforced:

1. **Route-level** — `meta.roles` on a route record.
2. **Button-level** — `v-has-perm="['code']"` directive on any element.
3. **API-level** — backend enforces; frontend just hides UI.

## Button-level: `v-has-perm`

The directive is named **`v-has-perm`**, NOT `v-permission` (which is a different project's name).

Defined in `src/directive/permission/index.ts`. Reads allowed codes from `useUserStoreHook().perms`. The `ROOT` role bypasses all checks.

```vue
<el-button v-has-perm="['community:article:add']" @click="onAdd">新增</el-button>
<el-button v-has-perm="['community:article:edit']" @click="onEdit(row)">编辑</el-button>
<el-button v-has-perm="['community:article:del']" @click="onDel(row)">删除</el-button>
```

Programmatic check inside `<script setup>`:

```ts
import { useUserStoreHook } from '@/store/modules/user'
const { perms, roles } = useUserStoreHook()

const canEdit = roles.includes('ROOT') || perms.includes('community:article:edit')
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

1. User logs in → backend returns `perms[]` (button codes) + `roles[]`.
2. `useUserStore.login(...)` stores both in `user.ts`.
3. `permission.ts` (root-level guard) checks `meta.roles` against `roles[]` before each navigation.
4. `v-has-perm` reads `perms[]` for the current page.

## Counter-examples (DO NOT)

- ❌ Using `v-permission` — wrong name. Use `v-has-perm`.
- ❌ Checking permissions with `localStorage.getItem('perms')` directly — bypasses the store and breaks reactivity.
- ❌ Using `v-if="user.role === 'admin'"` for buttons — use `v-has-perm` so it's consistent with the backend.
- ❌ Mutating `meta.roles` after the route is registered — Vue Router does not react to meta changes.
- ❌ Missing the permission binding on a destructive button (delete, force-reset, etc.) — security risk.