# Component Conventions — future-community-manage

## Element Plus usage

- Always use the **global auto-imported** versions (`<el-button>`, not `<ElButton>`). Configured in `vite.config.ts` via `unplugin-vue-components`.
- Icon imports: `<el-icon><EpPlus /></el-icon>` using `@iconify-json/ep` icons.
- Forms: prefer `el-form` + `el-form-item` with `prop` bound for validation. Avoid building custom form layouts.

## Dictionary components

`<DictSelect>`, `<DictRadio>`, `<DictCheckbox>`, `<DictTag>` — all read from `useDictStore`:

```vue
<DictSelect dict-type="sys_yes_no" v-model="form.enabled" />
<DictRadio dict-type="article_category" v-model="form.category" />
```

Dictionary types are defined backend-side; ask the backend team if unsure.

## Table conventions

```vue
<el-table :data="list" v-loading="loading" border stripe>
  <el-table-column prop="title" label="标题" min-width="180" />
  <el-table-column prop="status" label="状态">
    <template #default="{ row }">
      <DictTag dict-type="sys_yes_no" :value="row.status" />
    </template>
  </el-table-column>
  <el-table-column label="操作" width="180" fixed="right">
    <template #default="{ row }">
      <el-button v-permission="['article:edit']" link type="primary" @click="onEdit(row)">编辑</el-button>
      <el-button v-permission="['article:del']" link type="danger" @click="onRemove(row)">删除</el-button>
    </template>
  </el-table-column>
</el-table>

<el-pagination
  v-model:current-page="query.pageNum"
  v-model:page-size="query.pageSize"
  :total="total"
  layout="total, sizes, prev, pager, next, jumper"
  @current-change="fetchList"
/>
```

## Drawer forms (new / edit)

```vue
<el-drawer v-model="drawerVisible" :title="form.id ? '编辑' : '新增'" size="500px">
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <el-form-item label="标题" prop="title">
      <el-input v-model="form.title" />
    </el-form-item>
    <!-- ... -->
  </el-form>
  <template #footer>
    <el-button @click="drawerVisible = false">取消</el-button>
    <el-button type="primary" :loading="submitting" @click="onSubmit">提交</el-button>
  </template>
</el-drawer>
```

## Counter-examples (DO NOT)

- ❌ Using `el-form` without `prop` — validation won't fire.
- ❌ Pagination outside the table's scroll container — layout breaks on small screens.
- ❌ Action buttons outside the `fixed="right"` column — they scroll out of view on horizontal overflow.
- ❌ Building custom dropdowns / selects when `<DictSelect>` already exists.