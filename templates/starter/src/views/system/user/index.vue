<script lang="ts">
export default {
  name: '/user'
};
</script>

<script setup lang="ts">
import { getUserPage, getUserForm, addUser, updateUser, updateUserStatus } from '@/api/user';
import { UserForm, UserQuery, VenuetypeQuery } from '@/api/user/types';

import { getMainBodyList } from "@/api/mainBody/index";
import { MainBodyQuery } from "@/api/mainBody/types";

import { getRegionTree, getVillageList } from '@/api/region';
import { RegionTreeQuery, RegionForm } from '@/api/region/types';
import { getRolePage } from '@/api/role';
import { RoleQuery } from '@/api/role/types';
import { getCommunityList } from '@/api/app';
import { useUserStore } from "@/store/modules/user";
import { TreeNodeChildState } from 'element-plus/es/components/tree/src/tree.type';

// 密码加密
import { encrypt } from '@/utils/rsa.js';
const dataIntegrity = import.meta.env.VITE_DATA_INTEGRITY
const userStore = useUserStore()

const isStreetAccount = ref(0) // 是否是街道账号
const regionList = ref(userStore.regionManager) // 可管理社区列表
const isAdmin = ref(userStore.thisInfo.is_system_account) // 1.超管账号 2.其他账号
const queryFormRef = ref(ElForm); // 查询表单
const userFormRef = ref(ElForm); // 用户表单

const loading = ref(false);
const loadingBtn = ref(false); // 防止按钮重复点击
const ids = ref([]);
const total = ref(0);
const operateType = ref(); // 1.添加 2.编辑
const dialog = reactive<DialogOption>({
  visible: false
});

const treeList = ref([]); // 区域树
const defaultCheckedKeys = ref<any>([]) // 编辑用户时默认选中的区域id集合
  
const queryParams = reactive<UserQuery>({
  region_id: "",
  index: 1,
  size: 20
});
const userList = ref();

const menuRef = ref(ElTree);
const defaultProps = {
  children: 'child',
  label: 'name',
  id: 'id',
  icon: 'icon'
}
const queryTreeParams = reactive<RegionTreeQuery>({
  maxlevel: 4,
  minlevel: 2
});

const formData = reactive<UserForm>({
  region_id: isAdmin.value==0?[Number(userStore.region_id)]:[],//regionList.value.length==1?[regionList.value[0].id]:[],
  state: 1,
  password: '',
  password_e_t: 'rsa',
  telephone:'',
  configinfo:{
    ai_appkey:'',
    ai_appsecret:''
  }
});

// 添加时密码必填，编辑时非必填
const validPsssword = (rule: any, value: any, callback: any) => {
  const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@ #$%^&*()_+`\-={}:";'<>?,.\/]).{8,20}$/;
  if (value === '') {
      return callback(new Error('密码不能为空'))
  } else if (!regex.test(value)) {
      callback(new Error('长度为8-20位,必须包含数字+大小写字母+特殊符号'));
  } else {
    callback()
  };
}
const rules = reactive({
  // region_id: [{ required: true, message: '所属社区不能为空', trigger: 'blur' }],
  village_id: [{ required: true, message: '管理小区不能为空', trigger: 'blur' }],
  account: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, validator: validPsssword, trigger: 'blur' }],
  role_id: [{ required: true, message: '请选择角色', trigger: 'blur' }],
});

/**
 * 获取角色下拉列表
 */
/* 备注：角色列表超管账号需要传社区id为0 */
const roleList = ref();
const roleParams = reactive<RoleQuery>({
  region_id: isAdmin.value==0&&userStore.region_id?userStore.region_id:0,
  index: 1,
  size: 999
});
async function getRoleOptions() {
  getRolePage(roleParams)
    .then(({ data }) => {
      roleList.value = data.list;
    })
}

/**
 * 获取小区下拉列表
 */
const villageList = ref();
async function getVillageOptions() {
  const regionId = roleParams.region_id;
  getVillageList(regionId)
    .then(({ data }) => {
      villageList.value = data;
      villageList.value.unshift({
        code:null,
        id:-1,
        name:'全社区'
      })
    })
}
const checkChange = (value: any,index:any)=>{
  console.log(value)
  console.log(index)
  if(index==0){
    if(value){
      formData.village_id =[-1]
      villageList.value.forEach((item:any)=>{
        if(item.id!=-1){
          item.disabled = true
        }
      })
    }else{
      villageList.value.forEach((item:any)=>{
          item.disabled = false
      })
    }
  }
}
/**
 * 获取主体下拉列表
 */
const venueOmTypeList = ref();
// const venueOmTypeParams = reactive<VenuetypeQuery>({
//   region_id: isAdmin.value==0&&userStore.region_id?userStore.region_id:0,
//   index: 1,
//   size: 999
// });
const venueOmTypeParams = reactive<MainBodyQuery>({
    region_id: isAdmin.value==0&&userStore.region_id?userStore.region_id:0,
    venuename:"",
    index: 1,
    size: 999,
})
async function getVenueOmTypeOptions() {
  getMainBodyList(venueOmTypeParams)
    .then(({ data }) => {
      venueOmTypeList.value = data.list;
    })
}

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  if(!isAdmin.value && !isStreetAccount.value) {
    getVillageOptions(); // 初始化小区
    getVenueOmTypeOptions(); // 初始化主体类型
  }
  getRegionTree(queryTreeParams)
    .then(({ data }) => {
      treeList.value = data;
    })
  getUserPage(queryParams)
    .then(({ data }) => {
      userList.value = data.list;
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
 * 注销用户
 */
 function handleDelete(id?: number) {
  const userIds = [id || ids.value].join(',');
  if (!userIds) {
    ElMessage.warning('请勾选删除项');
    return;
  }

  ElMessageBox.confirm('确认注销用户?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '加载中...'
            updateUserStatus(userIds,'',3).then(() => {
                ElMessage.success('注销成功');
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
 * 打开弹窗
 *
 * @param account 用户账号
 */
async function openDialog(account?: any) {
  console.log('打开弹窗',userStore.regionManager);
  await getRoleOptions();
  dialog.visible = true;
  if (account) {
    operateType.value = 2;
    dialog.title = '修改用户';
    getUserForm(account).then(({ data }) => {
      defaultCheckedKeys.value = data.region_id
      // 处理没有角色时把用户的角色加入角色列表
      const isfind = roleList.value.some((item:any) => item.id==data.role_id)
      if(!isfind){
        roleList.value.push(data.role)
      }
      if((isAdmin.value==1 || isStreetAccount.value)&&data.configinfo==null) {
        data.configinfo = {
          ai_appkey:'',
          ai_appsecret:''
        }
      }
      data.password = ''
      Object.assign(formData, data);
      // 处理主体没选时选项中显示0
      if(data.user_id==0) {
        formData.user_id = undefined
      }
      if(!data.village_id?.length){
        formData.village_id = [-1]
      }
    });
  } else {
    operateType.value = 1;
    dialog.title = '添加用户';
  }
}

/**
 * 关闭用户弹窗
 */
function closeDialog() {
  dialog.visible = false;
  loadingBtn.value = false;
  resetForm();
}

/**
 * 重置表单
 */
function resetForm() {
  userFormRef.value.resetFields();
  userFormRef.value.clearValidate();
  formData.id = undefined;
  formData.user_id = undefined;
  formData.state = 1;
  if(isAdmin.value==1 || isStreetAccount.value) {
    defaultCheckedKeys.value = []; // 光清除此项没用
    menuRef.value.setCheckedKeys([])
  }
}
/* 点击区域树 */
const handleCheckChange = (data:any, checked:any) => {
  // console.log('data:',data,checked);
  let cid = menuRef.value.getCheckedKeys()
  formData.region_id = cid
  // console.log('cid=',cid);
};
/**
 * 表单提交
 */
function handleSubmit() {
  userFormRef.value.validate((valid: any) => {
    if (valid) {
      const userId = formData.id;
      loadingBtn.value = true;
      let params = JSON.parse(JSON.stringify(formData))
      if(formData.password) { // 密码加密
        params.password = encrypt(formData.password)
      }
      if(params.village_id&&params.village_id.includes(-1)){
        params.village_id = []
      }
      if (userId) {
        updateUser(params)
          .then(() => {
            ElMessage.success('修改用户成功');
            closeDialog();
            handleQuery();
          })
          .finally(() => (loadingBtn.value = false));
      } else {
        addUser(params)
          .then(() => {
            ElMessage.success('添加用户成功');
            closeDialog();
            resetQuery();
          })
          .finally(() => (loadingBtn.value = false));
      }
    }
  });
}

onMounted(() => {
  // 判断是否是街道账号
  isStreetAccount.value = userStore.thisInfo.all_manage_regions.some((item:any)=>{
    return item.level == 3
  })
  handleQuery(); // 初始化用户列表数据
  getCommunitytOptions()
});
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col>
        <div class="search">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">

            <el-form-item prop="region_id">
            <el-select v-model="queryParams.region_id" placeholder="所属社区" filterable clearable>
                <el-option v-for="item in communityList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            </el-form-item>

            <el-form-item prop="account">
              <el-input
                v-model="queryParams.account"
                placeholder="用户名"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item prop="status">
              <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 200px" >
                <el-option label="正常" value="1" />
                <el-option label="注销" value="3" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleQuery" ><i-ep-search />搜索</el-button >
              <el-button @click="resetQuery"> <i-ep-refresh /> 重置</el-button >
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="never">
          <template #header>
              <el-button type="success" @click="openDialog()" v-hasPerm="['sys:user:AccountOperate']"><i-ep-plus />添加</el-button>
              <el-button type="danger" :disabled="ids.length === 0" @click="handleDelete()" v-hasPerm="['sys:user:AccountOperate']">
                <i class="iconfont" style="font-size: 18px">&#xe60b;</i>注销
              </el-button>
          </template>

          <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange" border>
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="所属区域" prop="region_name" />
            <el-table-column label="手机号" align="center" prop="telephone" />
            <el-table-column label="用户名" align="center" prop="account" />
            <el-table-column label="昵称" align="center" prop="name" />
            <el-table-column label="角色" align="center" prop="role.rolename" />
            <el-table-column label="状态" align="center">
              <template #default="scope">
                  <el-tag :type="scope.row.state==1?'success':'info'">
                      {{ scope.row.state==1?'正常':'注销' }}
                  </el-tag>
              </template>
            </el-table-column>
        <el-table-column label="数据是否完整" v-if="dataIntegrity.includes(1)"  align="center"  width="130" >
          <template #default="scope">
            <el-tag v-if="scope.row.is_data_integrality==1" type="success">是</el-tag>
            <el-tag v-else type="danger">否</el-tag>
          </template>
        </el-table-column>
            <el-table-column label="操作" fixed="right" align="center" width="100" v-hasPerm="['sys:user:AccountOperate']">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="openDialog(scope.row.account)"
                  ><i-ep-edit />编辑</el-button
                >
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
      </el-col>
    </el-row>

    <!-- 表单弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1000px" append-to-body @close="closeDialog" >
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="150px" >
        <!-- 超管账号显示区域树 -->
        <el-form-item label="所属区域" prop="region_id" v-if="isAdmin==1 || isStreetAccount">
          <div class="flex items-center" style="width: 100%">
            <el-tree
                :default-checked-keys="defaultCheckedKeys"
                ref="menuRef"
                node-key="id"
                show-checkbox
                :data="treeList"
                :props="defaultProps"
                :default-expand-all="true"
                :check-strictly="true"
                @check-change="handleCheckChange"
              >
                <template #default="{ data }">
                  {{ data.name }}
                </template>
            </el-tree>
          </div>
        </el-form-item>
        <!-- 单个社区管理员显示社区名称 -->
        <el-form-item label="所属区域" prop="region_id" v-if="isAdmin==0 && isStreetAccount==0 && regionList && regionList.length==1">
          <el-input disabled v-model="regionList[0].name" placeholder="请输入" />
        </el-form-item>
        <!-- 多个社区管理员显示切换社区，一般管理多个社区权限的管理员不会给添加用户权限，暂不考虑此情况 -->
        <el-form-item label="所属社区" prop="region_id" v-if="isAdmin==0 && isStreetAccount==0 &&regionList&&regionList.length>1">
          <div class="flex items-center" style="width: 100%">
            <el-select v-model="formData.region_id" placeholder="请选择社区" multiple style="width: 100%" disabled>
              <el-option v-for="item in regionList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
        </div>
        </el-form-item>

        <el-form-item label="管理小区" prop="village_id" v-if="!isAdmin&&!isStreetAccount">
          <el-checkbox-group v-model="formData.village_id">
            <el-checkbox v-for="(item,index) in villageList" :key="item.id" :label="item.id" :disabled="item.disabled" @change="checkChange($event,index)">
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="用户名" prop="account">
          <el-input
            :readonly="!!formData.user_id"
            v-model.trim="formData.account"
            placeholder="请输入用户名"
            :disabled="formData.id"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="telephone">
          <el-input
            v-model.trim="formData.telephone"
            placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="operateType==1">
          <el-input v-model="formData.password" placeholder="请输入用户密码,长度8-20位,必须包含数字+大小写字母+特殊符号" />
        </el-form-item>
        <el-form-item label="密码" prop="passwordedit" v-else>
          <el-input v-model="formData.password" placeholder="请输入用户密码,长度8-20位,必须包含数字+大小写字母+特殊符号" />
        </el-form-item>

        <el-form-item label="昵称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入用户昵称" />
        </el-form-item>

        <el-form-item label="状态" prop="state">
          <el-radio-group v-model="formData.state">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="3">注销</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="角色" prop="role_id">
          <el-select v-model="formData.role_id" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.rolename"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="主体" prop="user_id" v-if="!isAdmin">
          <el-select v-model="formData.user_id" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in venueOmTypeList"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="AI外呼平台APPKey" prop="configinfo" v-if="!isAdmin">
          <el-input v-model="formData.configinfo.ai_appkey" placeholder="请输入AI外呼平台APPKey" />
        </el-form-item>
        <el-form-item label="AI外呼平台APPSecret" prop="configinfo" v-if="!isAdmin">
          <el-input v-model="formData.configinfo.ai_appsecret" placeholder="请输入AI外呼平台APPSecret" />
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
