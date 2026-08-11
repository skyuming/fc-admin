<!-- 菜单管理 -->
<script lang="ts">
export default {
  name: "/menuManager"
};
</script>

<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon/index.vue';
import IconSelect from '@/components/IconSelect/index.vue';
import { MenuQuery, MenuForm, MenuVO } from '@/api/menu/types';
import {
  listMenus,
  getMenuForm,
  addMenu,
  deleteMenu,
  updateMenu
} from '@/api/menu';

const queryFormRef = ref(ElForm);
const menuFormRef = ref(ElForm);

const loading = ref(false);
const dialog = reactive<DialogOption>({
  visible: false
});

const queryParams = reactive<MenuQuery>({});
const menuList = ref<MenuVO[]>([]);
const menuTableRef = ref();
// 记录需要展开的菜单ID集合
const expandedMenuIds = ref<Set<number>>(new Set());
// 是否全部展开状态（用于按钮文字显示）
const isAllExpanded = ref(false);

const formData = reactive<MenuForm>({
  parent_id: 0,
  is_hide: 0,
  sort: 1,
  describe: '',
  type: 0
});
//目录路径自定义校验规则
const dirrule = (rule: any, value: any, callback: any) => {
  const desc = (formData.describe as any).substring(0,1)
  if(value==='') {
    callback(new Error('请输入路由路径'))
  } else if(formData.type==0 && desc!="/") {
     callback(new Error('目录以/开头'))
  } else {
    callback()
  }
}
const rules = reactive({
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  describe: [{ required: true, validator: dirrule, trigger: 'blur' }],
  url: [
    { required: true, message: '请输入组件完整路径', trigger: 'blur' }
  ]
});

// 选择表格的行菜单ID
const selectedRowMenuId = ref<number | undefined>();

const menuCacheData = reactive({
  type: 0,
  url: ''
});

/**
 * 查询
 */
function handleQuery() {
  // 重置父组件
  loading.value = true;
  listMenus(queryParams)
    .then(({ data }) => {
      menuList.value = data;
    })
    .then(() => {
      loading.value = false;
      // 恢复展开状态
      nextTick(() => {
        // 根据状态恢复展开
        const restoreExpand = (rows: MenuVO[]) => {
          rows.forEach((row) => {
            if (row.children?.length && row.id != null) {
              const shouldExpand = isAllExpanded.value || expandedMenuIds.value.has(row.id);
              menuTableRef.value?.toggleRowExpansion(row, shouldExpand);
              restoreExpand(row.children);
            }
          });
        };
        restoreExpand(menuList.value);
      });
    });
}

/**
 * 查询重置
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

/**
 * 行点击事件
 *
 * @param row
 */
function onRowClick(row: MenuVO) {
  selectedRowMenuId.value = row.id;
}

/**
 * 打开表单弹窗
 *
 * @param parentId 父菜单ID
 * @param menuId 菜单ID
 */
function openDialog(parentId?: number, menuId?: number) {
  dialog.visible = true;
  console.log('点击的ID=',parentId,menuId)
  if (menuId) {
      dialog.title = '编辑菜单';
      getMenuForm(menuId).then(({ data }) => {
        Object.assign(formData, data);
        console.log('formData=',formData,menuCacheData.type,data.type)
        menuCacheData.type = Number(data.type);
        menuCacheData.url = data.url ?? '';
      });
    } else {
      dialog.title = '新增菜单';
      formData.parent_id = parentId;
    }
}

/**
 * 菜单类型 change
 */
function onMenuTypeChange() {
  // 如果菜单类型改变，清空路由路径；未改变在切换后还原路由路径
  if (formData.type !== menuCacheData.type) {
    formData.url = '';
  } else {
    formData.url = menuCacheData.url;
  }
}

/**
 * 菜单提交
 */
function submitForm() {
  menuFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      let data = JSON.parse(JSON.stringify(formData));
      const menuId = data.id;
      data.type == 2 ? data.is_hide = 1 : ''; // 按钮类型默认隐藏
      console.log('菜单提交data:',data)
      if (menuId) {
        updateMenu(data).then(() => {
          ElMessage.success('修改成功');
          closeDialog();
          handleQuery();
        });
      } else {
        addMenu(data).then(() => {
          ElMessage.success('新增成功');
          closeDialog();
          handleQuery();
        });
      }
    }
  });
}

/**
 * 删除菜单
 */
function handleDelete(menuId: number) {
  if (!menuId) {
    ElMessage.warning('请勾选删除项');
    return false;
  }

  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteMenu(menuId).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
    })
    .catch(() => ElMessage.info('已取消删除'));
}

/**
 * 关闭弹窗
 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/**
 * 重置表单
 */
function resetForm() {
  menuFormRef.value.resetFields();
  menuFormRef.value.clearValidate();

  formData.id = undefined;
  formData.parent_id = 0;
  formData.is_hide = 1;
  formData.sort = 1;
}

onMounted(() => {
  handleQuery();
});

/**
 * 切换全部展开/收起
 */
function toggleExpandAll() {
  isAllExpanded.value = !isAllExpanded.value;
  // 遍历所有行，展开或收起
  const toggleRow = (rows: MenuVO[]) => {
    rows.forEach((row) => {
      if (row.children?.length && row.id != null) {
        menuTableRef.value?.toggleRowExpansion(row, isAllExpanded.value);
        toggleRow(row.children);
      }
    });
  };
  toggleRow(menuList.value);
}
</script>

<template>
  <div class="app-container">
    <!-- <div class="search">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="菜单名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"
            ><template #icon><i-ep-search /></template>搜索</el-button
          >
          <el-button @click="resetQuery">
            <template #icon><i-ep-refresh /></template>
            重置</el-button
          >
        </el-form-item>
      </el-form>
    </div> -->

    <el-card shadow="never">
      <template #header>
        <el-button type="success" @click="openDialog(0)">
          <template #icon><i-ep-plus /></template>
          新增顶级菜单
        </el-button>
        <el-button @click="toggleExpandAll">
          <template #icon><i-ep-rank /></template>
          {{ isAllExpanded ? '全部收起' : '全部展开' }}
        </el-button>
      </template>

      <el-table
        ref="menuTableRef"
        v-loading="loading"
        :data="menuList"
        highlight-current-row
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @row-click="onRowClick"
        row-key="id"
        default-expand-all
        border
      >
        <el-table-column label="菜单名称" min-width="300">
          <template #default="scope">
            <svg-icon :icon-class="scope.row.icon" />
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column label="菜单类型" align="center" width="100">
          <template #default="scope">
            <el-tag
              v-if="scope.row.type === 0"
              type="warning"
              >目录</el-tag
            >
            <el-tag v-if="scope.row.type === 1" type="success"
              >菜单</el-tag
            >
            <el-tag v-if="scope.row.type === 2" type="danger"
              >按钮</el-tag
            >
            <el-tag v-if="scope.row.type === 3" type="info"
              >外链</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="权限标识" align="center" width="300" prop="flag" />
        <el-table-column label="状态" align="center" width="150">
          <template #default="scope">
            <el-tag v-if="scope.row.is_hide === 0" type="success">显示</el-tag>
            <el-tag v-else type="info">隐藏</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="排序" align="center" width="100" prop="sort" />
        <el-table-column label="页面地址" min-width="400" prop="routepath" />
        <el-table-column fixed="right" align="center" label="操作" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="openDialog(scope.row.id)"
              v-if="scope.row.type == 0 || scope.row.type == 1"
            >
              <i-ep-plus />新增
            </el-button>

            <el-button
              type="primary"
              link
              size="small"
              @click.stop="openDialog(scope.row.parent_id, scope.row.id)"
            >
              <i-ep-edit />编辑
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="handleDelete(scope.row.id)"
              ><i-ep-delete />
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      @close="closeDialog"
      destroy-on-close
      appendToBody
      width="750px"
    >
      <el-form
        ref="menuFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >

        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type" @change="onMenuTypeChange">
            <el-radio :label="0">目录</el-radio>
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
            <el-radio :label="3">外链</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="formData.type == 3" label="外链地址" prop="url" >
          <el-input v-model="formData.url" placeholder="请输入外链完整路径" />
        </el-form-item>

        <el-form-item label="路由路径" prop="describe" v-if="formData.type == 0 || formData.type == 1">
          <el-input
            v-if="formData.type == 0"
            v-model="formData.describe"
            placeholder="/system  (目录以/开头)"
          />
          <el-input v-else v-model="formData.describe" placeholder="user" />
        </el-form-item>

        <!-- 组件页面完整路径 -->
        <el-form-item label="页面路径" prop="url" v-if="formData.type == 0 || formData.type == 1">
          <el-input
            v-model="formData.url"
            placeholder="system/user/index"
            style="width: 95%"
          >
            <template #prepend >src/views/</template >
          </el-input>
        </el-form-item>

        <el-form-item label="权限标识" prop="flag" v-if="formData.type != 3">
          <el-input v-model="formData.flag" placeholder="edit">
            <template #prepend >sys:user</template >
          </el-input>
        </el-form-item>

        <el-form-item label="图标" prop="no_select_images" v-if="formData.type != 2">
          <!-- 图标选择器 -->
          <icon-select v-model="formData.no_select_images" />
        </el-form-item>

        <el-form-item label="状态" v-if="formData.type != 2">
          <el-radio-group v-model="formData.is_hide">
            <el-radio :label="0">显示</el-radio>
            <el-radio :label="1">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" style="width: 100px" controls-position="right" :min="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
