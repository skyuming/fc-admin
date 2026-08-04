# API Module Pattern — future-community-manage

This project does **not** use a per-module Mock/Real/Adapter split. Every business module has exactly two files:

```
src/api/{module}/
├── index.ts     # API function exports
└── types.ts     # request / response types
```

The HTTP layer is unified through a single global `request` (`src/utils/request.ts`) that already attaches baseURL, auth header, error handling, etc.

> **NOT used in this project**: per-module `mock/{entity}.ts`, `real/{entity}.ts`, `adapter.ts`, or `IxxApi` interface contracts. Don't create those files — they don't fit this codebase.

## `src/api/{module}/types.ts`

Exports all request / response shapes used by the module. Naming convention: `{Entity}{Purpose}` — `NoticeQuery`, `NoticeForm`, `NoticePageResult`, etc.

```ts
// src/api/notice/types.ts

/** 分页查询参数 */
export interface NoticeQuery {
  pageNum: number
  pageSize: number
  title?: string
  status?: number
}

/** 表单数据 (新增 / 编辑共用) */
export interface NoticeForm {
  id?: string
  title: string
  content: string
  status: number
}

/** 单条公告 */
export interface NoticeInfo {
  id: string
  title: string
  content: string
  status: number
  createTime: string
  updateTime?: string
}

/** 分页响应 */
export interface NoticePageResult {
  records: NoticeInfo[]
  total: number
}
```

## `src/api/{module}/index.ts`

Each API method is exported as a standalone function (no class, no interface). The function returns `AxiosPromise<T>` and delegates to the global `request` helper.

```ts
// src/api/notice/index.ts
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  NoticeQuery,
  NoticePageResult,
  NoticeForm,
  NoticeInfo
} from './types';

/** 公告分页列表 */
export function getNoticePage(
  queryParams: NoticeQuery
): AxiosPromise<NoticePageResult> {
  return request({
    url: '/api/v1/notices/page',
    method: 'get',
    params: queryParams
  });
}

/** 公告详情 */
export function getNotice(id: string): AxiosPromise<NoticeInfo> {
  return request({
    url: `/api/v1/notices/${id}`,
    method: 'get'
  });
}

/** 新增公告 */
export function addNotice(data: NoticeForm): AxiosPromise<void> {
  return request({
    url: '/api/v1/notices',
    method: 'post',
    data
  });
}

/** 修改公告 */
export function updateNotice(data: NoticeForm): AxiosPromise<void> {
  return request({
    url: `/api/v1/notices/${data.id}`,
    method: 'put',
    data
  });
}

/** 删除公告 */
export function deleteNotice(ids: string[]): AxiosPromise<void> {
  return request({
    url: `/api/v1/notices/${ids.join(',')}`,
    method: 'delete'
  });
}
```

## How pages consume the API

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getNoticePage, deleteNotice } from '@/api/notice'
import type { NoticeQuery, NoticeInfo } from '@/api/notice/types'

const list = ref<NoticeInfo[]>([])
const total = ref(0)
const loading = ref(false)
const query = ref<NoticeQuery>({ pageNum: 1, pageSize: 10 })

async function fetchList() {
  loading.value = true
  try {
    const { data } = await getNoticePage(query.value)
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function onRemove(row: NoticeInfo) {
  await ElMessageBox.confirm(`确认删除「${row.title}」?`, '提示', { type: 'warning' })
  await deleteNotice([row.id])
  ElMessage.success('删除成功')
  await fetchList()
}

onMounted(fetchList)
</script>
```

## Counter-examples (DO NOT)

- ❌ Creating `src/api/{module}/{entity}.ts` (interface) + `mock/{entity}.ts` + `real/{entity}.ts` + `adapter.ts` — this 4-file split is from a different admin template, NOT used here.
- ❌ Importing `axios` directly — always go through the global `request` helper (`@/utils/request`).
- ❌ Defining types inline in the page — put them in `types.ts`.
- ❌ Using class-based API wrappers (`class NoticeApi { ... }`) — this project uses plain functions.