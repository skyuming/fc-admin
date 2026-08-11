<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/store/modules/app";
import { useTagsViewStore } from "@/store/modules/tagsView";
import { useUserStore } from "@/store/modules/user";
import { number } from "echarts";
import {getBasicConfig} from "@/api/operationManage/basicConfig/index"
import { updatePassword } from "@/api/user/index"
// 密码加密
import { encrypt } from '@/utils/rsa.js';

const appStore = useAppStore();
const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();

const route = useRoute();
const router = useRouter();

const { device } = storeToRefs(appStore); // 设备类型：desktop-宽屏设备 || mobile-窄屏设备

// const allLoginType = import.meta.env.VITE_LOGIN_TYPE
const region_id = ref(Number(userStore.region_id)) // 初始社区id
const regionList = ref(userStore.regionManager) // 可管理社区列表
const isStreetAccount = ref(false) // 是否是街道账号

const isZzd=ref(useUserStore().isZzd) // 判断是否是浙政钉环境，如果是则隐藏全屏、修改密码和退出登录的功能

// const date: Date = new Date();

// const greetings = computed(() => {
//   if (date.getHours() >= 6 && date.getHours() < 8) {
//     return "早上好！";
//   } else if (date.getHours() >= 8 && date.getHours() < 12) {
//     return "上午好！";
//   } else if (date.getHours() >= 12 && date.getHours() < 18) {
//     return "下午好！";
//   } else if (date.getHours() >= 18 && date.getHours() < 24) {
//     return "晚上好！";
//   } else if (date.getHours() >= 0 && date.getHours() < 6) {
//     return "晚安！";
//   }
// });

function toggleSideBar() {
  appStore.toggleSidebar(true);
}

// 切换社区
async function selectRegion() {
  // console.log('切换社区', region_id.value)
  let {data:{xqcgxx}} =  await getBasicConfig(region_id.value,'xqcgxx')
  // 判断xqcgxx.type是否存在，存在则为多社区管理员，不存在则为单社区管理员
  if(xqcgxx){
    userStore.region_type = xqcgxx.type.toString()
    localStorage.setItem("region_type", xqcgxx.type.toString())
  }else{
    userStore.region_type = '0'
    localStorage.setItem("region_type", '0')
  }
  userStore.region_id = region_id.value.toString()
  localStorage.setItem("region_id", region_id.value.toString())
  router.replace({ path: "/redirect" + router.currentRoute.value.fullPath }).catch((err) => {
    // console.warn(err);
  });
}
// 退出登录
function logout() {
  ElMessageBox.confirm("退出系统后登录自动失效，确定退出？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    userStore
      .logout()
      .then(() => {
        tagsViewStore.delAllViews();
      })
      .then(() => {
        router.push(`/login?redirect=${route.fullPath}`);
      });
  });
}

const FormRef = ref(ElForm); // 表单
const dialog = reactive<DialogOption>({
  title: "修改密码",
  visible: false
});
const formData = reactive<any>({
  openid: '',
  oldpassword: '',
  password_e_t: 'rsa',
  password: '',
  surepassword: ''
});
// 密码校验
const validPsssword = (rule: any, value: any, callback: any) => {
  const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@ #$%^&*()_+`\-={}:";'<>?,.\/]).{8,20}$/;
  if (value === '') {
    return callback(new Error('请输入'))
  } else if (!regex.test(value)) {
    callback(new Error('长度为8-20位,必须包含数字+大小写字母+特殊符号'));
  } else {
    callback()
  };
}
const rules = reactive({
  oldpassword: [{ required: true, message: '请输入', trigger: 'blur' }],
  password: [{ required: true, validator: validPsssword, trigger: 'blur' }],
  surepassword: [{ required: true, validator: validPsssword, trigger: 'blur' }]
});
// 打开修改密码弹窗
function changepwdgo() {
  // router.push(`/changepwd`);
  dialog.visible = true;
}
// 培训视频下载
function videoDown() {
  const routeUrl = router.resolve({
    path: '/helpFile'
  })
  window.open(routeUrl.href, '_blank')
}
const haveVideo = ref(false)
const vivivi = import.meta.env.VITE_HAVE_VIDEO
// console.log('vivivi',typeof vivivi)
if(vivivi&&Number(vivivi)==1){
  haveVideo.value=true
}
// console.log('haveVideo', haveVideo.value)
/**
 * 关闭用户弹窗
 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/**
 * 重置表单
 */
function resetForm() {
  FormRef.value.resetFields();
  FormRef.value.clearValidate();

}
/**
* 表单提交
*/
function handleSubmit() {
  FormRef.value.validate((valid: any) => {
    if (valid) {
      if (formData.password != formData.surepassword) {
        ElMessage.error('新密码与确认新密码不一致');
        return false
      } else if (formData.password == formData.oldpassword) {
        ElMessage.error('新密码不能与旧新密码一致');
        return false
      }
      // 密码加密传输
      let cparams = JSON.parse(JSON.stringify(formData))
      cparams.oldpassword = encrypt(formData.oldpassword);
      cparams.password = encrypt(formData.password);
      cparams.surepassword = encrypt(formData.surepassword);
      updatePassword(cparams)
        .then(() => {
          ElMessage.success('修改成功,请重新登录');
          closeDialog()
          setTimeout(() => {
            //退出
            userStore.logout()
              .then(() => {
                tagsViewStore.delAllViews();
              })
              .then(() => {
                router.push(`/login?redirect=${route.fullPath}`);
              });
          }, 2000);
        })
    }
  });
}
onMounted(() => {
 // 判断是否是街道账号
 isStreetAccount.value = userStore.thisInfo.all_manage_regions.some((item:any)=>{
    return item.level == 3
  })
});
</script>

<template>
  <!-- 顶部导航栏 -->
  <div class="navbar">
    <!-- 左侧面包屑 -->
    <div class="flex">
      <hamburger :is-active="appStore.sidebar.opened" @toggleClick="toggleSideBar" />
      <breadcrumb />
    </div>

    <!-- 右侧导航设置 -->
    <div class="flex">
      <!-- 导航栏设置(窄屏隐藏)-->

      <!-- 多社区管理员切换社区（跟朱亮确认过超管、街道级别账号不需要显示切社区功能 ）-->
      <div class="flex items-center" style="margin-right: 20px;"
        v-if="regionList.length > 1 && userStore.thisInfo.is_system_account == 0 && isStreetAccount == false">
        <el-select v-model="region_id" placeholder="请选择社区" filterable v-if="regionList.length" style="width: 150px"
          @change="selectRegion()">
          <el-option v-for="item in regionList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </div>

      <div v-if="device !== 'mobile' && !isZzd" class="flex items-center">
        <!--全屏 -->
        <screenfull class="navbar-setting-item" />
      </div>

      <!-- 用户头像 -->
      <el-dropdown trigger="click">
        <div class="flex justify-center items-center mx-2">
          <span class="w-[26px] h-[26px] rounded-lg text-white flex justify-center items-center"
            style="background-color:#83d6d5; opacity: 1 !important;">
            <i class="iconfont">&#xe60d;</i>
          </span>
          <div class="leading-[40px]" style="margin-left: 10px;">
            {{ userStore.nickname }}
          </div>
          <!-- <div class="leading-[40px]">
            ，{{ greetings }}
          </div> -->
          <i-ep-caret-bottom v-if="!isZzd" class="w-3 h-3" />
        </div>
        <template #dropdown>
          <el-dropdown-menu v-if="!isZzd">
            <el-dropdown-item v-if="haveVideo" @click="videoDown()">培训视频下载</el-dropdown-item>
            <!-- 第三方统一平台登录不显示修改密码和退出登录功能 v-if="allLoginType.indexOf(5) == -1"
            <el-dropdown-item @click="changepwdgo()" :disabled="allLoginType.includes(5)">修改密码</el-dropdown-item>
            <el-dropdown-item divided @click="logout" :disabled="allLoginType.includes(5)"> -->
            <el-dropdown-item @click="changepwdgo()">修改密码</el-dropdown-item>
              <el-dropdown-item divided @click="logout">
              {{ $t("navbar.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body @close="closeDialog">
      <el-form ref="FormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="旧密码" prop="oldpassword">
          <el-input type="password" v-model="formData.oldpassword" placeholder="请输入旧密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input type="password" v-model="formData.password" placeholder="长度8-20位，必须包含数字+大小写字母+特殊符号" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="surepassword">
          <el-input type="password" v-model="formData.surepassword" placeholder="长度8-20位，必须包含数字+大小写字母+特殊符号"
            show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  background-color: #fff;
  box-shadow: 0 0 1px #0003;

  .navbar-setting-item {
    display: inline-block;
    width: 30px;
    height: 50px;
    line-height: 50px;
    color: #5a5e66;
    text-align: center;
    cursor: pointer;

    &:hover {
      background: rgb(249 250 251 / 100%);
    }
  }
}
</style>
