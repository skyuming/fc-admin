<script lang="ts">
  export default { name: '/role' };
</script>

<script setup lang="ts">
import { getRolePage, updateRole, getRoleForm, addRole, deleteRoles } from '@/api/role';
import { RoleForm, RoleQuery } from '@/api/role/types';
import { listMenus } from '@/api/menu';
import { MenuQuery } from '@/api/menu/types';

import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore()

const queryFormRef = ref(ElForm);
const roleFormRef = ref(ElForm);
const userprivateval = userStore.thisInfo.role.is_view_privateinfo // 登录账号是否可查看敏感信息，如果可查看添加的角色脱敏选项都可选，不可查看则添加的角色只能选脱敏
const dataIntegrity = import.meta.env.VITE_DATA_INTEGRITY
const loading = ref(false);
const loadingBtn = ref(false); // 防止按钮重复点击
const ids = ref<number[]>([]);
const total = ref(0);
const isAdmin = ref(userStore.thisInfo.is_system_account) // 1.超管账号 2.其他账号
const operateType = ref(); // 2.修改 3.一键复制

/* 备注：角色列表超管账号需要传社区id为0 */
const queryParams = reactive<RoleQuery>({
  region_id: isAdmin.value==0&&userStore.region_id?userStore.region_id:0,
  index: 1,
  size: 20
});

const roleList = ref();

const allListCheck = ref(false) // 权限是否全选
// const flagList = userStore.menu

const dialog = reactive<DialogOption>({
  title: '',
  visible: false
});

const formData = reactive<RoleForm>({
  rolename: '',
  flag: '',
  region_id: isAdmin.value==0&&userStore.region_id?userStore.region_id:0,
});

const rules = reactive({
  rolename: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  flag: [{ required: true, message: '请选择权限', trigger: 'blur' }]
});

const flagList = ref<any>([])
const querymenuParams = reactive<MenuQuery>({});
function getmenuList() {
  listMenus(querymenuParams)
    .then(({ data }) => {
      // console.log('data=',data)
      let newarr = ref<any>([])
      data.forEach((item: any,index: any) => {
        // 以下写法列表和操作权限不在一起
        // newarr.value[index] = item // 一级菜单赋值
        // if(item.children!=null) { // 如果二级菜单不为空
        //   newarr.value[index].children = item.children
        //   item.children.forEach((m:any, ind:any) => {
        //     if(m.children != null) { // 三级菜单不为空
        //       m.children.forEach((td:any, tdind:any) => {
        //         newarr.value[index].children.push(td)
        //       })
        //     }
        //   })
        // }
        // 尝试列表和操作权限在一起
        newarr.value[index] = { // 一级菜单赋值
          describe: item.describe,
          flag: item.flag,
          icon: item.icon,
          id: item.id,
          is_hide: item.is_hide,
          name: item.name,
          parent_id: item.parent_id,
          routepath: item.routepath,
          sort: item.sort,
          type: item.type,
          children: []
        }
        if(item.children) { // 如果二级菜单不为空
          item.children.forEach((sem:any, seind:any) => {
            newarr.value[index].children.push({ // 二级菜单赋值
              describe: sem.describe,
              flag: sem.flag,
              icon: sem.icon,
              id: sem.id,
              is_hide: sem.is_hide,
              name: sem.name,
              parent_id: sem.parent_id,
              routepath: sem.routepath,
              sort: sem.sort,
              type: sem.type
            })
            if(sem.children) {
              sem.children.forEach((trdem: any, trdind: any) => {
                newarr.value[index].children.push({ // 三级菜单赋值
                  describe: trdem.describe,
                  flag: trdem.flag,
                  icon: trdem.icon,
                  id: trdem.id,
                  is_hide: trdem.is_hide,
                  name: trdem.name,
                  parent_id: trdem.parent_id,
                  routepath: trdem.routepath,
                  sort: trdem.sort,
                  type: trdem.type
                })
              })
            }
          })
          // newarr.value[index].children = item.children
          // item.children.forEach((m:any, ind:any) => {
          //   if(m.children != null) { // 三级菜单不为空
          //     m.children.forEach((td:any, tdind:any) => {
          //       newarr.value[index].children.push(td)
          //     })
          //   }
          // })
        }
      })
      // 以上操作把三级按钮合并到二级菜单里了
      // console.log('newarr:',newarr.value)
      flagList.value = newarr.value
    })
}

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  getRolePage(queryParams)
    .then(({ data }) => {
      roleList.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}
/**
 * 重置查询
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.index = 1;
  handleQuery();
}

/**
 * 行checkbox change事件
 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

const checkList = (flag:any) => {
  let arr = (formData as any).flag.split(',')
  return arr.includes(flag)
}

/**
 * 打开角色表单弹窗
 *
 * @param roleId
 */
function openDialog(roleId?: number, rolename?:string, type?:number) { // type:2.修改 3.一键复制
  if(type) { operateType.value = type }
  // 写在这防止添加时是否脱敏会抖动
  if(!roleId) { formData.is_view_privateinfo = 0; }
  // 回显角色已拥有的菜单
  flagList.value.forEach((item:any) => {
    item.checkFlagList = []
    item.allFlagList = []
    if (item.children != null) { // 二级不为空
      item.children.forEach((m:any) => {
        item.allFlagList.push(m.flag)
        m.isCheck = false
      })
      item.isCheck = false
    } else {
      item.isCheck = false
    }
  })
  if (roleId) {
    dialog.title = '【' + rolename + '】角色'+ (type==2?'修改':'一键复制');
    getRoleForm(roleId).then(({ data }) => {
      Object.assign(formData, data);
      flagList.value.forEach((item:any) => {
        if (item.flag) { // 如果一级flag不为空
          item.isCheck = checkList(item.flag)
          if (item.children != null) {
            item.children.forEach((m:any) => {
              item.allFlagList.push(m.flag)
              m.isCheck = checkList(m.flag)
              if (m.isCheck) {
                item.checkFlagList.push(m.flag)
              }
            })
          }
        } else {
          let arr = 0
          item.children.forEach((m:any) => {
            if(m.flag) { // 如果二级flag不为空
              item.allFlagList.push(m.flag)
              m.isCheck = checkList(m.flag)
              if (m.isCheck) {
                arr += 1
                item.checkFlagList.push(m.flag)
              }
            }
          })
          arr == item.children.length ? item.isCheck = true : item.isCheck = false
        }
      })
      if (flagList.value.every((target:any) => target.isCheck === true)) {
        // console.log('验证通过,将全选按钮勾选')
        allListCheck.value = true
      }
    });
  } else {
    dialog.title = '添加角色';
  }
  dialog.visible = true;
}

/**
 * 角色表单提交
 */
function handleSubmit() {
  formData.flag = ""
  // console.log('提交formflag',formData.flag)
  // console.log('提交flaglist',flagList.value)
  flagList.value.forEach((item:any) => {
      if (item.isCheck) {
        formData.flag += item.flag + ','
      }
      if (item.children != null) {
        if (item.checkFlagList.length) {
          formData.flag += item.checkFlagList.join(',') + ','
        }
      }
  })
  // console.log('提交权限',formData.flag)
  roleFormRef.value.validate((valid: any) => {
    if (valid) {
      const roleId = formData.id;
      // console.log('表单提交',roleId,formData)
      loadingBtn.value = true;
      if (roleId && operateType.value==2) {
        updateRole(formData)
          .then(() => {
            ElMessage.success('修改成功');
            closeDialog();
            handleQuery();
          })
          .finally(() => (loadingBtn.value = false));
      } else {
        const params = ref<any>();
        if(operateType.value==3) {
          params.value = {
            rolename: formData.rolename,
            flag: formData.flag,
            region_id: formData.region_id,
            is_view_privateinfo: formData.is_view_privateinfo
          }
        }
        addRole(operateType.value==3?params.value:formData)
          .then(() => {
            ElMessage.success((operateType.value==3?'一键复制':'添加') + '成功');
            closeDialog();
            resetQuery();
          })
          .finally(() => (loadingBtn.value = false));
      }
    }
  });
}

/**
 * 关闭弹窗
 */
function closeDialog() {
  allListCheck.value = false;
  dialog.title = '';
  dialog.visible = false;
  loading.value = false;
  loadingBtn.value = false;
  setTimeout(() => {
    resetForm();
  }, 500);
}

/**
 * 重置表单
 */
function resetForm() {
  roleFormRef.value.resetFields();
  roleFormRef.value.clearValidate();

  formData.id = undefined;
  formData.rolename = '';
  formData.flag = '';
  formData.is_view_privateinfo = undefined;
}

/**
 * 删除
 */
function handleDelete(roleId?: number) {
  const roleIds = [roleId || ids.value].join(',');
  if (!roleIds) {
    ElMessage.warning('请勾选删除项');
    return;
  }

  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '加载中...'
            deleteRoles(roleIds).then(() => {
                ElMessage.success('删除成功');
                done()
                handleQuery();
            }).catch(() => {
                instance.confirmButtonLoading = false
                instance.confirmButtonText = '确定'
            })
        }else{
            done()
        }
    }
  })
}
const handleCheckAllChange = (val:any, ind:number) => { // 一级菜单点击
  if (val) {
    if (flagList.value[ind].flag) {
      flagList.value[ind].isCheck = val
    } else {
      flagList.value[ind].checkFlagList = [...flagList.value[ind].allFlagList]
    }
  } else {
    if (flagList.value[ind].flag) {
      flagList.value[ind].isCheck = val
    } else {
      flagList.value[ind].checkFlagList.splice(0, flagList.value[ind].checkFlagList.length)
    }
  }
}
const handleCheckedCitiesChange = (val:any, ind:number) => { // 二级菜单点击
  if (!flagList.value[ind].flag) {
    if (flagList.value[ind].checkFlagList.length == flagList.value[ind].allFlagList.length) {
      flagList.value[ind].isCheck = true
    } else {
      flagList.value[ind].isCheck = false
    }
  }
}
const checkAllListCheck = (val:any) => { // 全选点击
  console.log(val)
  flagList.value.forEach((item:any, index:any) => {
    item.isCheck = val
    handleCheckAllChange(val, index)
  })
}

onMounted(() => {
  getmenuList();
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <div class="search">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="rolename">
          <el-input
            v-model="queryParams.rolename"
            placeholder="角色名称"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery" ><i-ep-search />搜索</el-button >
          <el-button @click="resetQuery"><i-ep-refresh />重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      
      <template #header>
        <el-button type="success" @click="openDialog()" v-hasPerm="['sys:user:RoleOperate']"><i-ep-plus />添加</el-button>
        <el-button type="danger" :disabled="ids.length === 0" @click="handleDelete()" v-hasPerm="['sys:user:RoleOperate']"><i-ep-delete />删除</el-button>
      </template>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="roleList"
        @selection-change="handleSelectionChange"
        highlight-current-row
        border
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="角色名称" prop="rolename" min-width="100" />
        <el-table-column label="添加时间" prop="addtime" align="center" width="300" />
        <el-table-column label="数据是否完整" v-if="dataIntegrity.includes(1)" align="center"  width="130" >
          <template #default="scope">
            <el-tag v-if="scope.row.is_data_integrality==1" type="success">是</el-tag>
            <el-tag v-else type="danger">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="220" align="center" v-hasPerm="['sys:user:RoleOperate']">
          <template #default="scope">
            <!-- <el-button
              type="primary"
              size="small"
              link
              @click="openMenuDialog(scope.row)"
            >
              <i-ep-position />分配权限
            </el-button> -->
            <el-button
              type="primary"
              size="small"
              link
              @click="openDialog(scope.row.id,scope.row.rolename,2)"
            >
              <i-ep-edit />编辑
            </el-button>
            <!-- 产品定：只有超管有一键复制角色功能 -->
            <el-button type="primary" link size="small" @click="openDialog(scope.row.id,scope.row.rolename,3)" v-if="isAdmin==1">
              <i class="iconfont" style="font-size: 14px;">&#xe656;</i>一键复制
            </el-button>
            <!-- <el-button
              type="primary"
              size="small"
              link
              @click="handleDelete(scope.row.id)"
            >
              <i-ep-delete />删除
            </el-button> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.index"
        v-model:limit="queryParams.size"
        @pagination="handleQuery"
      />
    </el-card>

    <!-- 角色表单弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="90%" @close="closeDialog" >
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="100px" >
        <el-form-item label="角色名称" prop="rolename">
          <el-input v-model="formData.rolename" placeholder="请输入角色名称" />
        </el-form-item>
        <!-- 管理员是否可以查看私密信息 -->
        <el-form-item label="脱敏" prop="is_view_privateinfo">
          <el-radio-group v-model="formData.is_view_privateinfo">
            <el-radio :label="0">脱敏</el-radio>
            <el-radio :label="1" :disabled="userprivateval==0?true:false">不脱敏</el-radio>
          </el-radio-group>
          <div style="margin-left: 20px;">（脱敏范围：手机号、身份证号码）</div>
        </el-form-item>

        <el-form-item label="权限" prop="flag">
          <el-checkbox v-model="allListCheck" @change="checkAllListCheck">全选</el-checkbox>
          <div class="treeBox" style="width: 100%;" v-for="(item, index) in flagList" :key="item.name">
            <div class="checkAll">
              <el-checkbox v-model="item.isCheck"
                :indeterminate="!!(item.checkFlagList.length && item.checkFlagList.length != item.allFlagList.length && !item.flag)"
                @change="handleCheckAllChange($event, index)">{{ item.name }}
              </el-checkbox>
            </div>
            <el-checkbox-group v-model="item.checkFlagList" @change="handleCheckedCitiesChange($event, index)">
              <el-checkbox v-for="m in item.children" :key="m.id" :label="m.flag">{{
                m.name
              }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit" :loading="loadingBtn">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
  .treeBox {
    margin-top: 5px;
    & > .checkAll {
      :deep(.el-checkbox__label) {color: #333;}
    }
    .checkAll {
      .el-checkbox {
        flex-direction: row-reverse;
      }

      :deep(.el-checkbox__label) {
        padding-left: 0;
        padding-right: 8px;
      }
    }

    :deep(.el-checkbox__label) {
      color: #666;
    }
  }
</style>