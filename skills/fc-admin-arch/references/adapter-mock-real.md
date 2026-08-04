# Adapter Pattern (Mock / Real) — future-community-manage

Each business module under `src/api/{module}/` uses a 4-file split:

```
src/api/{module}/
├── {entity}.ts          # I{Entity}Api contract interface
├── mock/{entity}.ts     # Mock implementation
├── real/{entity}.ts     # Real HTTP implementation
└── adapter.ts           # Factory: returns Mock or Real based on env
```

Plus `index.ts` re-exporting the active impl via the adapter.

## Contract interface (`{entity}.ts`)

```ts
// src/api/community/article.ts
import type { Article, ArticleQuery, ArticlePage } from '@/types/api/article'

export interface IArticleApi {
  listPage(query: ArticleQuery): Promise<ApiResponse<ArticlePage>>
  getById(id: string): Promise<ApiResponse<Article>>
  add(data: Article): Promise<ApiResponse<void>>
  update(data: Article): Promise<ApiResponse<void>>
  remove(ids: string[]): Promise<ApiResponse<void>>
}
```

## Mock implementation (`mock/{entity}.ts`)

```ts
// src/api/community/mock/article.ts
import type { IArticleApi } from '../article'
import { articles } from '@/mock/data/article'

export class MockArticleApi implements IArticleApi {
  async listPage(query) { /* filter articles[] by query */ }
  async getById(id) { return { code: 200, msg: 'ok', data: articles.find(a => a.id === id) } }
  async add(data) { /* push to articles[], persist to localStorage */ }
  // ...
}
```

## Real implementation (`real/{entity}.ts`)

```ts
// src/api/community/real/article.ts
import type { IArticleApi } from '../article'
import request from '@/utils/request'

export class RealArticleApi implements IArticleApi {
  listPage(query) { return request.get('/community/article/page', { params: query }) }
  getById(id) { return request.get(`/community/article/${id}`) }
  add(data) { return request.post('/community/article', data) }
  update(data) { return request.put('/community/article', data) }
  remove(ids) { return request.delete(`/community/article/${ids.join(',')}`) }
}
```

## Factory (`adapter.ts`)

```ts
// src/api/community/adapter.ts
import type { IArticleApi } from './article'
import { MockArticleApi } from './mock/article'
import { RealArticleApi } from './real/article'

export function createArticleApi(): IArticleApi {
  return import.meta.env.VITE_USE_MOCK === 'true'
    ? new MockArticleApi()
    : new RealArticleApi()
}
```

## Re-export (`index.ts`)

```ts
// src/api/community/index.ts
import { createArticleApi } from './adapter'
export const articleApi = createArticleApi()
```

## Counter-examples (DO NOT)

- ❌ Importing `MockArticleApi` directly in a page — pages must import from `index.ts` only.
- ❌ Reading `import.meta.env.VITE_USE_MOCK` in a page/component — that decision belongs to `adapter.ts`.
- ❌ Mixing Mock and Real in the same module — pick one based on env, every page picks it up automatically.