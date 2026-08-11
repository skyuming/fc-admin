<!-- 管理端角色：原平台的网格角色，Flag = "ManagementRoleList，ManagementRoleOperate" -->
<script lang="ts">
  export default { name: "/managementRole" };
</script>

<script setup lang="ts">
import { getRolePage, getGrideventtype, updateRole, getRoleForm, addRole, deleteRoles, stateRoles, gridshowRoles } from '@/api/role/indexManagement';
import { RoleQuery, ManagementRoleForm } from '@/api/role/types';
import { getAppAllSelect } from '@/api/app';
import { getCommunityList } from '@/api/app';

import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore()

const queryFormRef = ref(ElForm);
const roleFormRef = ref(ElForm);

const loading = ref(false);
const loadingBtn = ref(false); // 防止按钮重复点击
const isDisabled = ref(false) // 点详情的时候表单不能编辑
const roleList = ref();
const ids = ref<number[]>([]);
const total = ref(0);

/* 备注：角色列表超管账号需要传社区id为空 */
const regionID = ref(userStore.thisInfo.is_system_account==0&&userStore.region_id?userStore.region_id:"")
const queryParams = reactive<RoleQuery>({
  region_id: undefined,
  index: 1,
  size: 20
});
const applistqueryParams = reactive<any>({
  region_id: Number(regionID.value),
  management_client: "1",
  is_show: 1
});

const dialog = reactive<DialogOption>({
  title: '',
  visible: false
});

const formData = reactive<ManagementRoleForm>({
  state: 1,
  is_circulation: 0,
  is_circulation_alarm: 0,
  is_grid_show: 0,
  hierarchy: 1,
  event_type: [],
  app_id: []
});

const rules = reactive({
  region_id: [{ required: true, message: '请选择社区', trigger: 'blur' }],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  hierarchy: [{ required: true, message: '请输入层级', trigger: 'blur' }],
  event_type: [{ required: true, message: '请选择可管理问题类型', trigger: 'blur' }],
  app_id: [{ required: true, message: '请选择可管理应用', trigger: 'blur' }]
});

/**
 * 获取社区下拉数据
 */
 const communityList = reactive<any>([]) // 社区列表
function getCommunitytOptions() {
  getCommunityList().then(({ data }) => {
      Object.assign(communityList, data.list);
  });
}
/**
 * 获取事件类型
 */
 const grideventtypeList = ref() // 问题类型列表
 async function getgrideventtypeOptions() {
  let typelist = ref<any>(formData.event_type); // 点编辑event_type有内容
  getGrideventtype(formData.region_id).then(({ data }) => {
      Object.assign(grideventtypeList.value, data);
      grideventtypeList.value.forEach((item:any,ind: any) => {
        if(typelist.value.length>0) {
          // console.log('编辑')
          typelist.value.forEach((m:any,i:any) => {
            if(item.id === m.type_id) {
              // console.log('相等项：',ind)
              grideventtypeList.value[ind].ischecked = true
              // 判断是否勾选“默认接收推送”
              if(item.is_default_receive==0) {
                grideventtypeList.value[ind].isreceivechecked = false
              } else {
                grideventtypeList.value[ind].isreceivechecked = true
              }
              // 判断能否操作“默认接收推送”
              if(item.is_default_receive==0 || (item.is_default_receive==1&&m.is_default_receive==1)) {
                grideventtypeList.value[ind].operate = true
              } else {
                grideventtypeList.value[ind].operate = false
              }
            }
          })
        } else {
          // console.log('发布')
          // 初始化类型和“默认接收推送”未勾选
          item.ischecked = false
          item.isreceivechecked = false
          // 判断能否操作“默认接收推送”
          if(item.is_default_receive==0) {
            item.operate = true
          } else {
            item.operate = false
          }
        }
      })
  });
}
/**
 * 获取应用列表
 */
 const appList = ref() // 应用列表
 async function getAppOptions() {
  getAppAllSelect(applistqueryParams).then(({ data }) => {
    Object.assign(appList.value, data);
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

/* 表单弹窗选择社区 */
async function communityChange() {
    const param = formData
    if(param.region_id) {
        applistqueryParams.region_id = formData.region_id
        await getgrideventtypeOptions()
        await getAppOptions()
    } else {
        appList.value = []
        formData.app_id = undefined
    }
}

/**
 * 打开角色表单弹窗
 *
 * @param roleId
 */
 async function openDialog(roleId?: number, rolename?:string, type?: number) {
  grideventtypeList.value = [];
  appList.value = [];
  if(type==3) { isDisabled.value = true } // 点详情的时候表单不能编辑
  if (roleId) {
    dialog.title = '【' + rolename + '】角色'+ (type==2?'修改':'详情');
    getRoleForm(roleId).then(({ data }) => {
      Object.assign(formData, data);
      if(formData.region_id) {
        communityChange()
      }
    });
  } else {
    dialog.title = '添加管理端角色';
  }
  dialog.visible = true;
}

/**
 * 角色表单提交
 */
function handleSubmit() {
  // 给formData.event_type赋值
  const list = ref<any>([]);
  grideventtypeList.value.forEach((item:any) => {
    if(item.ischecked) {
      list.value.push({
        type_id: item.id,
        is_default_receive: item.isreceivechecked?1:0
      })
    }
  })
  formData.event_type = list.value
  roleFormRef.value.validate((valid: any) => {
    if (valid) {
      const roleId = formData.id;
      // console.log('表单提交',roleId,formData)
      // return
      loadingBtn.value = true;
      if (roleId) {
        updateRole(formData)
          .then(() => {
            ElMessage.success('修改成功');
            closeDialog();
            handleQuery();
          })
          .finally(() => (loadingBtn.value = false));
      } else {
        addRole(formData)
          .then(() => {
            ElMessage.success('添加成功');
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
  dialog.visible = false;
  resetForm();
  formData.id = undefined;
  formData.region_id = undefined;
  isDisabled.value = false;
  loading.value = false;
  loadingBtn.value = false;
}

/**
 * 重置表单
 */
function resetForm() {
  roleFormRef.value.resetFields();
  roleFormRef.value.clearValidate();

  formData.id = undefined;
  formData.region_id = undefined;
  formData.name = '';
  formData.flag = '';
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
  ElMessageBox.confirm('确认删除已选中的数据项?', '【删除】警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '加载中...'
            deleteRoles(roleIds).then(() => {
                ElMessage.success('删除成功');
                done();
                handleQuery();
            }).catch(() => {
                instance.confirmButtonLoading = false
                instance.confirmButtonText = '确定'
            })
        }else{
          done()
        }
    }
  });
}
/**
 * 修改角色状态
 */
 function handleLock(type:any) {
  const desc = type==1?'恢复':'锁定'
  const roleIds = [ids.value].join(',');
  if (!roleIds) {
    ElMessage.warning('请勾选'+desc+'项');
    return;
  }
  ElMessageBox.confirm('确认'+desc+'已选中的数据项?', '【'+desc+'】警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '加载中...'
            stateRoles(roleIds, type).then(() => {
              ElMessage.success(desc+'成功');
              done();
              handleQuery();
            }).catch(() => {
              instance.confirmButtonLoading = false
              instance.confirmButtonText = '确定'
            })
        }else{
          done()
        }
    }
  });
}
/**
 * 修改网格显示状态
 */
 function handleShowGrid(type:any) {
  const desc = type==1?'显示':'隐藏'
  const roleIds = [ids.value].join(',');
  if (!roleIds) {
    ElMessage.warning('请勾选'+desc+'项');
    return;
  }
  ElMessageBox.confirm('确认'+desc+'已选中的数据项?', '网格在线【'+desc+'】警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '加载中...'
            gridshowRoles(roleIds, type).then(() => {
              ElMessage.success(desc+'成功');
              done();
              handleQuery();
            }).catch(() => {
              instance.confirmButtonLoading = false
              instance.confirmButtonText = '确定'
            })
        }else{
          done()
        }
    }
  });
}

onMounted(() => {
  getCommunitytOptions(); // 初始化社区
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <div class="search">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="region_id">
            <el-select v-model="queryParams.region_id" placeholder="所属社区" filterable clearable>
                <el-option v-for="item in communityList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery" ><i-ep-search />搜索</el-button >
          <el-button @click="resetQuery"><i-ep-refresh />重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      <template #header>
        <el-button type="success" @click="openDialog()" v-hasPerm="['sys:user:ManagementRoleOperate']"><i-ep-plus />添加</el-button>
        <el-button type="danger" :disabled="ids.length === 0" @click="handleDelete()" v-hasPerm="['sys:user:ManagementRoleOperate']"><i-ep-delete />删除</el-button>
        <el-button type="warning" :disabled="ids.length === 0" @click="handleLock(2)" v-hasPerm="['sys:user:ManagementRoleOperate']"><i-ep-lock />锁定</el-button>
        <el-button type="success" @click="handleLock(1)" v-hasPerm="['sys:user:ManagementRoleOperate']"><i-ep-unlock />恢复</el-button>
        <el-button type="success" @click="handleShowGrid(1)" v-hasPerm="['sys:user:ManagementRoleOperate']"><svg-icon icon-class="eye-open" />&nbsp;网格在线显示</el-button>
        <el-button type="info" :disabled="ids.length === 0" @click="handleShowGrid(0)" v-hasPerm="['sys:user:ManagementRoleOperate']"><svg-icon icon-class="eye" />&nbsp;网格在线隐藏</el-button>
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
        <el-table-column label="所属社区" prop="region_name" />
        <el-table-column label="角色名称" prop="name" min-width="100" />
        <el-table-column label="层级" prop="hierarchy" align="center" width="100" />
        <el-table-column label="状态" align="center">
          <template #default="scope">
              <el-tag :type="scope.row.state==1?'success':'danger'">
                  {{ scope.row.state==1?'正常':'锁定' }}
              </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可被流转" align="center" prop="is_circulation">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.is_circulation"
                  :inactive-value="0"
                  :active-value="1"
                  disabled
                />
              </template>
            </el-table-column>
        <el-table-column label="网格在线" align="center">
          <template #default="scope">
              <el-tag :type="scope.row.is_grid_show==1?'success':'info'">
                  {{ scope.row.is_grid_show==1?'显示':'隐藏' }}
              </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="220" align="center" v-hasPerm="['sys:user:ManagementRoleOperate']">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              @click="openDialog(scope.row.id,scope.row.name,2)"
            >
              <i-ep-edit />编辑
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="openDialog(scope.row.id,scope.row.name,3)"
            >
              <i-ep-memo />详情
            </el-button>
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
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800" @close="closeDialog" >
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="150px">
        <el-form-item label="所属社区" prop="region_id">
            <el-select v-model="formData.region_id" placeholder="社区名称" filterable clearable style="width: 100%;" @change="communityChange()">
                <el-option v-for="item in communityList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="可被流转" prop="is_circulation">
          <el-switch v-model="formData.is_circulation" :inactive-value="0" :active-value="1" />
        </el-form-item>
        <el-form-item label="接收流转次数预警" prop="is_circulation_alarm">
          <el-switch v-model="formData.is_circulation_alarm" :inactive-value="0" :active-value="1" />
        </el-form-item>
        <el-form-item label="权限" prop="flag">
          <el-checkbox v-model="formData.flag" name="1" true-label="1" false-label="">督办</el-checkbox>
        </el-form-item>
        <el-form-item label="网格在线" prop="is_grid_show">
          <el-radio-group v-model="formData.is_grid_show">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="层级" prop="hierarchy">
          <el-input-number v-model="formData.hierarchy" style="width: 100px" controls-position="right" :min="1" />
          <div style="margin-left: 20px; font-size: 12px;">用于事件预警，低层级未处理向高层级预警</div>
        </el-form-item>
        <!-- 可管理问题类型说明：
          * 添加：当接口/api/manager/grideventtype拿到数据项的is_default_receive值为1则“默认接收推送”不可操作，为0则可操作
          * 编辑：默认接收推送”可操作（详情接口is_default_receive=1“；
        -->
        <el-form-item label="可管理问题类型" prop="event_type">
          <div class="treeBox" style="width: 100%;">
            <div v-for="item in grideventtypeList" :key="item.id" class="event-type">
              <div class="first">
                <el-checkbox v-model="item.ischecked" :label="item.name" />
              </div>
              <el-checkbox v-model="item.isreceivechecked" label="默认接收推送" :disabled="!item.operate" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="可管理应用" prop="app_id">
          <div class="treeBox" style="width: 100%;">
            <el-checkbox-group v-model="formData.app_id">
              <el-checkbox :label="item.id" v-for="item in appList" :key="item.id">{{ item.name }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer" v-if="!isDisabled">
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
  .event-type {
    display: flex;
    &:hover {
      :deep(.el-checkbox__label) { color: #000; }
    }
    .first { min-width: 150px; }
  }
</style>