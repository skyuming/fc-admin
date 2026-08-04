# Pinia Stores — future-community-manage

Pinia is the only state manager. Each business domain gets a store under `src/store/modules/`.

## Store skeleton (Composition API style)

```ts
// src/store/modules/article.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useArticleStore = defineStore('article', () => {
  const list = ref<Article[]>([])
  const loading = ref(false)

  const hasData = computed(() => list.value.length > 0)

  async function fetchList(query: ArticleQuery) {
    loading.value = true
    try {
      const { data } = await articleApi.listPage(query)
      list.value = data.records
    } finally {
      loading.value = false
    }
  }

  return { list, loading, hasData, fetchList }
})
```

## Existing stores

| Store | Responsibility |
|---|---|
| `useUserStore` | Current user, token, permission tree, btn codes |
| `useDictStore` | Cached dictionary items keyed by dict type |
| `useAppStore` | Sidebar collapse, layout theme, device type |
| `useRouteStore` | Dynamic route registration state |
| `use{Entity}Store` | Per-business-module state (only if needed) |

## When to add a store

Add a `use{Entity}Store` only when **more than one component** needs to share the same entity state, OR when state must outlive a single route (e.g. stepper across multi-step forms).

Do **not** add a store just to wrap one API call — let the page own that.

## Counter-examples (DO NOT)

- ❌ Mixing Options API and Composition API stores — pick Composition API throughout (the project standard).
- ❌ Calling API methods directly from a store without going through `xxxApi` (the adapter) — defeats the mock/real switch.
- ❌ Storing non-serializable values (functions, class instances) in `ref` — breaks devtools and persistence.