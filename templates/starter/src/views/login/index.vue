<template>
  <div class="login-container">
    <div class="login-top">{{ $t("login.title") }}</div>
    <div class="login-box">
      <div class="flex items-center loginBanner">
        <img src="@/assets/images/login-banner.png">
      </div>
      <div class="flex items-center login-right">
        <!-- 手机号登录 -->
        <div class="login-form">
          <h3 class="text-center" style="margin-top: 0;" v-if="loginType !== 3">欢迎登录</h3>
          <el-form ref="loginFormRef" v-show="loginType == 1 || loginType == 4" :model="loginData" :rules="loginRules">
            <div>
              <el-form-item prop="username">
                <div class="p-2">
                  <svg-icon icon-class="user" />
                </div>
                <el-input class="flex-1" ref="username" size="large" v-model="loginData.username"
                  :placeholder="$t('login.username')" name="username" />
              </el-form-item>

              <el-tooltip :disabled="isCapslock === false" content="Caps lock is On" placement="right">
                <el-form-item prop="password">
                  <span class="p-2">
                    <svg-icon icon-class="password" />
                  </span>
                  <el-input class="flex-1" v-model="loginData.password" placeholder="密码"
                    :type="passwordVisible === false ? 'password' : 'input'" size="large" name="password"
                    @keyup="checkCapslock" @keyup.enter="handleLogin" />
                  <span class="mr-2" @click="passwordVisible = !passwordVisible">
                    <svg-icon :icon-class="passwordVisible === false ? 'eye' : 'eye-open'" class="cursor-pointer" />
                  </span>
                </el-form-item>
              </el-tooltip>

              <!-- 验证码,开发及测试阶段暂时隐藏验证码(前端生成的) -->
              <el-form-item prop="verificationCode" v-show="loginType == 1">
                <span class="p-2">
                  <svg-icon icon-class="verify_code" />
                </span>
                <el-input v-model="loginData.verificationCode" auto-complete="off" :placeholder="$t('login.verifyCode')"
                  class="w-[60%]" @keyup.enter="handleLogin" />

                <div class="captcha">
                  <canvas ref="canvasRef" width="100" height="48" @click="refresh"></canvas>
                </div>
              </el-form-item>
              
              <!-- 验证码(后端获取的) -->
              <div style="position: relative; display: flex; justify-content: space-between;" v-if="loginType == 4 && validatedCodeImg">
                <el-form-item prop="verificationCode" style="width: calc(100% - 150px)">
                  <span class="p-2"> <svg-icon icon-class="verify_code" /> </span>
                  <el-input v-model="loginData.verificationCode" auto-complete="off" :placeholder="$t('login.verifyCode')"
                    class="w-[60%]" @keyup.enter="handleLogin" />
                </el-form-item>
                <div class="captcha">
                  <img style="width:140px;height:48px" :src="validatedCodeImg" alt="" @click="refresh">
                </div>
              </div>
            </div>

            <el-button style="margin: 30px 0 10px;" size="default" :loading="loading" type="primary" class="w-full"
              @click.prevent="handleLogin">{{
                $t("login.login") }}
            </el-button>
          </el-form>
          <!-- 手机验证码登录 -->
          <div v-show="loginType == 2">
            <el-form ref="codeloginFormRef" :model="codeLoginData" :rules="codeloginRules">
              <el-form-item prop="account">
                <div class="p-2">
                  <!-- <i class="el-icon-edit"></i> -->
                  <el-icon>
                    <Iphone />
                  </el-icon>
                </div>
                <el-input class="flex-1" ref="account" size="large" v-model="codeLoginData.account"
                  :placeholder="$t('login.account')" name="account" />
              </el-form-item>
              <el-tooltip :disabled="isCapslock === false" content="Caps lock is On" placement="right">
                <el-form-item prop="password">
                  <span class="p-2">
                    <svg-icon icon-class="password" />
                  </span>
                  <el-input class="flex-1" v-model="codeLoginData.password" placeholder="密码"
                    :type="passwordVisible === false ? 'password' : 'input'" size="large" name="password"/>
                  <span class="mr-2" @click="passwordVisible = !passwordVisible">
                    <svg-icon :icon-class="passwordVisible === false ? 'eye' : 'eye-open'" class="cursor-pointer" />
                  </span>
                </el-form-item>
              </el-tooltip>
              <el-form-item prop="code">
                <div class="p-2">
                  <svg-icon icon-class="verify_code" />
                </div>
                <el-input class="flex-1" size="large" v-model="codeLoginData.code"
                  :placeholder="$t('login.code')" name="code" />
                <div class="obtain-verification-code" v-if="!secondShow" @click="obtainVerificationCode">
                  获取验证码
                </div>
                <div class="obtain-verification-code-second" v-else @click="obtainVerificationCode">
                  {{ second }} 秒后重发
                </div>
              </el-form-item>
              <el-button style="margin: 30px 0 10px;" size="default" :loading="loading" type="primary" class="w-full"
                @click.prevent="codeHandleLogin">{{
                  $t("login.login") }}
              </el-button>
            </el-form>
          </div>
          <!-- 浙证钉登录 -->
          <div v-show="loginType == 3">
            <iframe style="width: 218px;height: 320px;margin: 0 auto;display: block;" :src="iframeSrc"
              frameborder="0"></iframe>
          </div>
          <div class="login-type">
            <div class="item" v-if="allLoginType.includes(1)&&(allLoginType.includes(2)||allLoginType.includes(3)||allLoginType.includes(4))">
              <el-button size="default" link type="primary" class="w-full" @click.prevent="cutLoginType(1)">
                账号密码登录
              </el-button>
              <div class="w-full"></div>
            </div>
            <div class="item" v-if="allLoginType.includes(4)&&(allLoginType.includes(1)||allLoginType.includes(2)||allLoginType.includes(3))">
              <el-button size="default" link type="primary" class="w-full" @click.prevent="cutLoginType(4)">
                密码安全登录
              </el-button>
            </div>
            <div class="item" v-if="allLoginType.includes(2)&&(allLoginType.includes(1)||allLoginType.includes(3)||allLoginType.includes(4))">
              <el-button size="default" link type="primary" class="w-full" @click.prevent="cutLoginType(2)">
                手机验证码登录
              </el-button>
            </div>
            <div class="item" v-if="allLoginType.includes(3)&&(allLoginType.includes(2)||allLoginType.includes(1)||allLoginType.includes(4))">
              <el-button size="default" link type="primary" class="w-full" @click.prevent="cutLoginType(3)">
                浙证钉登录
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 修改密码弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body @close="closeDialog">
      <div style="margin: -20px 0 20px">
        <el-alert title="您的密码已过期，请修改密码后登录。" type="warning" show-icon :closable="false" />
      </div>
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

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import axios from 'axios';
import qs from 'qs';
import hmacsha from "@/utils/hmacsha512";
import router from "@/router";
import SvgIcon from "@/components/SvgIcon/index.vue";
import { useUserStoreHook } from '@/store/modules/user';
import { usePermissionStoreHook } from "@/store/modules/permission";
import login from "@/utils/noPassLogin"
// 状态管理依赖
import { useUserStore } from "@/store/modules/user";
// API依赖
import { LocationQuery, LocationQueryValue, useRoute } from "vue-router";
import { LoginData } from "@/api/auth/types";
import { updatePassword, obtainVerificationCodeApi, getValidatedCode } from "@/api/user/index"
// 处理获取token接口请求头暴露密码漏洞（椒江提的）
import { encrypt } from '@/utils/rsa.js';


window.addEventListener('message', function (event) {
  // 这里的event.data 就是登录成功的信息            // 数据格式：{ "code": "aaaa", "state": "bbbb" }        
  if (event.data.code) {
    login(event.data.code).then((res: any) => {
      if (res.data.code !== 200) {
        ElMessage.error(res.data.message);
        setTimeout(() => {
          // 刷新iframeSrc地址
          iframeSrc.value = `https://login-pro.ding.zj.gov.cn/oauth2/auth.htm?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=get_user_info&authType=QRCODE&embedMode=true&time=${new Date().getTime()}`
        }, 1500);
      }
    })
  }
});
const permissionStore = usePermissionStoreHook();
const userStore = useUserStore();
const route = useRoute();
const proxy = getCurrentInstance()
const client_id = import.meta.env.VITE_APP_client_id
const allLoginType = import.meta.env.VITE_LOGIN_TYPE
const redirect_uri = import.meta.env.VITE_APP_redirect_uri
const iframeSrc = ref()
const loginType = ref(4)
allLoginType.includes(4) ? loginType.value = 4 : allLoginType.includes(2) ? loginType.value = 2 : allLoginType.includes(3) ? loginType.value = 3 : loginType.value = 1
allLoginType.includes(3)?iframeSrc.value = `https://login-pro.ding.zj.gov.cn/oauth2/auth.htm?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=get_user_info&authType=QRCODE&embedMode=true&time=${new Date().getTime()}`:''

let getIpUrl = ['https://api.ip.sb/geoip','https://api.my-ip.io/v2/ip.json','https://ip.nf/me.json','https://qifu-api.baidubce.com/ip/local/geo/v1/district'] // 获取ip地址的接口
let nowIpIndex = 0

/**
 * 按钮loading
 */
const loading = ref(false);
/**
 * 是否大写锁定
 */
const isCapslock = ref(false);
/**
 * 密码是否可见
 */
const passwordVisible = ref(false);

/**
 * 登录表单引用
 */
const loginFormRef = ref(ElForm);
const codeloginFormRef = ref(ElForm);
const validatedCodeImg = ref(); // 账号密码登录的验证码图片
const loginData = ref<LoginData>({
  username: "",
  password: "",
  verificationCode: "",
  scope: "wechatweb",
  grant_type: "password"
});
const codeLoginData = ref<LoginData>({
  account: "", // [admin Swkj@123.][mym Swkj@123.]
  code: "",
  password:""
});

const checkAccount = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入手机号'))
  };
  if (!(/^1[3456789]\d{9}$/.test(value)) || !(/([0-9]{3,4}-)?[0-9]{7,8}/.test(value))) {
    return callback(new Error('请输入正确手机号码'))
  }
  callback()
}
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: "blur" }],
  password: [{ required: true, trigger: "blur", validator: passwordValidator }],
  verificationCode: [{ required: true, message: '请输入验证码', trigger: "blur" }],
};
const codeloginRules = {
  account: [{ required: true, trigger: "blur", validator: checkAccount }],
  code: [{ required: true, message: '请输入验证码', trigger: "blur" }],
  password: [{ required: true, trigger: "blur", validator: passwordValidator }],
};
/**
 * 密码校验器
 */
function passwordValidator(rule: any, value: any, callback: any) {
  if (!value) {
    callback(new Error("请输入密码"));
  } else if (value.length < 6) {
    callback(new Error("密码不能少于6位"));
  } else {
    callback();
  }
}

/**
 * 检查输入大小写状态
 */
function checkCapslock(e: any) {
  const { key } = e;
  isCapslock.value = key && key.length === 1 && key >= "A" && key <= "Z";
}

/**
 * 前端绘制验证码
 */
const code = ref('')
const canvas = ref()
// 绘制验证码图片
function draw() {
  const ctx = canvas.value.getContext("2d");

  // 生成随机的四位数字验证码
  code.value = Math.floor(Math.random() * 9000 + 1000).toString();

  // 开发用自动填充验证码，发布正式需删除
  // loginData.value.verificationCode = code.value

  // 绘制验证码文本
  ctx.font = "30px Arial";
  ctx.fillText(code.value, 25, 35);

  // 绘制干扰线
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 100, Math.random() * 48);
    ctx.lineTo(Math.random() * 100, Math.random() * 48);
    ctx.strokeStyle = "rgb(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ")";
    ctx.stroke();
  }
}
 
// 从接口获取登录验证码
function getValidatedCodeFunc() {
  // 获取浏览器缓存中的验证码key（用于防止该浏览器多次请求）
  let key = localStorage.getItem('validatedCode_Key') || ""
  let BasicAuthorization = hmacsha.GetTrendsSwkjBasicStr(`/api/manager/accountlogin/validatedcode?key=${key}&timestamp=`);
  localStorage.setItem("accessToken", BasicAuthorization.Authorization) // 存储token

  getValidatedCode(key, BasicAuthorization.time).then((res) => {
    validatedCodeImg.value = res.data.code_img
    if (!key) { //如果浏览器缓存中没有验证码key 则存一个
      localStorage.setItem('validatedCode_Key', res.data.code_key)
    }
  })
}
// 获取当前ip
function getIp(_url:any) {
  const axiosVue = axios.create();
  axiosVue.get(_url)
    .then((res:any) => {
      // console.log(res.data)
      if(typeof res.data.ip == 'string'){
        loginData.value.ip = res.data.ip
      }else if(typeof res.data.ip == 'object'){
        if(res.data.ip.ip){
          loginData.value.ip = res.data.ip.ip
        }
      }
      if(!loginData.value.ip){
        if (nowIpIndex < getIpUrl.length) {
          nowIpIndex++
          getIp(getIpUrl[nowIpIndex])
        }
      }
    })
    .catch((error) => {
      if (nowIpIndex < getIpUrl.length) {
        nowIpIndex++
        getIp(getIpUrl[nowIpIndex])
      }
    });
}

function cutLoginType(type: number) {
  loginType.value = type
  nextTick(async () => {
    if (loginType.value == 1) {
      canvas.value = proxy?.refs?.canvasRef;
      await nextTick(); // 等待 canvas 元素渲染完成
      refresh();
    } else if (loginType.value == 4) {
      refresh();
    }
    loginFormRef.value.clearValidate();
  })
}

// 刷新验证码
function refresh() {
  loginData.value.verificationCode = "";
  if(loginType.value == 1 && canvas.value) { // 确保 canvas 存在
    const ctx = canvas.value.getContext("2d");
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    draw();
  }
  if(loginType.value == 4) {
    getValidatedCodeFunc()
  }
}

const second = ref(60)
const secondShow = ref(false)
//获取手机验证码
function obtainVerificationCode() {
  codeloginFormRef.value.validateField('account', (valid: boolean) => {
    if (valid) {
      let BasicAuthorization = hmacsha.GetTrendsSwkjBasicStr(`/api/manager/account/msgcode?account=${codeLoginData.value.account}&timestamp=`);
      localStorage.setItem("accessToken", BasicAuthorization.Authorization)
      obtainVerificationCodeApi(codeLoginData.value.account, BasicAuthorization.time).then((data) => {
        secondShow.value = true
        let timer = setInterval(function () {
          second.value--;
          if (second.value == 0) {
            second.value = 30
            secondShow.value = false
            clearInterval(timer);
          }
        }, 1000)
      })
    }else{
      return false
    }
  })
}

//手机号验证码登录
function codeHandleLogin() {
  codeloginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      let BasicAuthorization = hmacsha.GetTrendsSwkjBasicStr(`/api/manager/account/codelogin?timestamp=`);
      localStorage.setItem("accessToken", BasicAuthorization.Authorization)
      let info = {
        account: codeLoginData.value.account,
        code: codeLoginData.value.code,
        password: codeLoginData.value.password
      }
      userStore.login(info, BasicAuthorization.time, loginType.value).then(async () => {
        initializeParameters()
      }).finally(() => {
        loading.value = false;
      });
    }
  })

}

/* 用户名密码登录 */
function handleLogin() {
  loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      //账号密码登录（密码明文；前端绘制验证码）
      if (loginType.value==1 && loginData.value.verificationCode === code.value) { // 验证码验证通过
        loading.value = true
        //获取token
        let BasicAuthorization = hmacsha.GetSwkjBasicStr();
        localStorage.setItem("accessToken", BasicAuthorization.Authorization)
        userStore.login(qs.stringify(loginData.value), BasicAuthorization.time, loginType.value).then(async () => {

          initializeParameters()

        })
          .catch((err) => {
            // console.log('打印err：', err)
            // 重新生成验证码
            refresh();
          })
          .finally(() => {
            loading.value = false;
          });
      }

      // 账号密码登录（密码加密；从接口获取验证码）
      if (loginType.value==4) { 
        let params = JSON.parse(JSON.stringify(loginData.value))
        const password = loginData.value.password;
        const encryptedPassword = encrypt(password);
        params.password = encryptedPassword
        // return
        let params1 = {
          account: params.username,
          password:params.password,
          password_e_t: "rsa",
          ip: params.ip?params.ip:localStorage.getItem('validatedCode_Key'),
          code: params.verificationCode,
          code_key: localStorage.getItem('validatedCode_Key'), //登录时传入验证码的key
          scope: "wechatweb",
          grant_type: "password"
        }
        loading.value = true
        //获取登录时用的加密的token
        let BasicAuthorization = hmacsha.GetTrendsSwkjBasicStr(`/api/manager/accountlogin?timestamp=`);

        localStorage.setItem("accessToken", BasicAuthorization.Authorization)

        userStore.login(params1, BasicAuthorization.time, loginType.value).then(async () => {
          initializeParameters()
        }).catch((err) => {
            // console.log('打印err：', err)
            // 重新生成验证码
            refresh();
          }).finally(() => {
            loading.value = false;
          });
      } 
      // else {
      //   ElMessage.error('验证码错误');
      //   // 重新生成验证码，注意：验收要求验证码错误时要刷新验证码
      //   refresh();
      // }
    }
  });
}
//登录成功之后初始化参数
async function initializeParameters() {
  const { roles, is_force_update_pwd } = await userStore.getInfo();
  // console.log('获得的roles',is_force_update_pwd)
  // 后台账号密码定期更换策略。6个月需要修改一次密码，必须修改后才可进入页面。
  if (is_force_update_pwd == 1) {
    dialog.visible = true; // 打开修改密码弹窗
  } else {
    const accessRoutes = await permissionStore.generateRoutes(roles);
    userStore.setUserList(accessRoutes)
    let routes = {
      path: "/",
      name: 'index',
      component: () => import("@/layout/index.vue"),
      redirect: accessRoutes[0].path,
      children: [
        {
          path: "401",
          component: () => import("@/views/error-page/401.vue"),
          meta: { hidden: true },
        },
        {
          path: "404",
          component: () => import("@/views/error-page/404.vue"),
          meta: { hidden: true },
        },
      ],
    }
    accessRoutes.forEach((route: any) => {
      routes.children.push(route)
    });
    router.addRoute(routes);
    router.push({ path: "/" });
  }
}

// 修改密码
const FormRef = ref(ElForm); // 表单
const dialog = reactive<DialogOption>({
  title: "修改密码",
  visible: false
});
const formData = reactive<any>({
  openid: '',
  oldpassword: '',
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
      cparams.password_e_t='rsa'
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

              })
          }, 2000);
        })
    }
  });
}

onMounted(() => {
  if(loginType.value == 1) {
    // 前端绘制验证码
    canvas.value = proxy?.refs?.canvasRef;
    draw();
  }
  if(loginType.value == 4) {
    // 接口获取验证码
    getIp(getIpUrl[nowIpIndex])
    getValidatedCodeFunc()
  }
});
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  min-height: 100%;
  overflow: hidden;
  background-color: #f8f9fa;
  box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15) !important;

  .login-top {
    margin-left: 60px;
    height: 68px;
    line-height: 68px;
    font-weight: bold;
    font-size: 32px;
  }

  .login-box {
    display: flex;
    justify-content: space-between;
    padding: 0 50px 0 146px;
    height: calc(100vh - 128px);
    min-height: 450px;
    background-color: #0068de;

    .loginBanner {
      width: 50%;
      height: 100%;

      img {
        width: 100%;
        max-width: 779px;
      }
    }

    .el-form-item {
      background: rgb(232, 240, 254);
      border: 1px solid #ebedf2;
      border-radius: 5px;
    }

    .el-input {
      background: transparent;

      // 子组件 scoped 无效，使用 :deep
      :deep(.el-input__wrapper) {
        padding: 0;
        background: transparent;
        box-shadow: none;

        .el-input__inner {
          color: #000;
          background: transparent;
          border: 0;
          border-radius: 0;
          caret-color: #000;

          &:-webkit-autofill {
            box-shadow: 0 0 0 1000px transparent inset !important;
            -webkit-text-fill-color: #000 !important;
          }

          // 设置输入框自动填充的延迟属性
          &:-webkit-autofill,
          &:-webkit-autofill:hover,
          &:-webkit-autofill:focus,
          &:-webkit-autofill:active {
            transition: color 99999s ease-out, background-color 99999s ease-out;
            transition-delay: 99999s;
          }
        }
      }
    }
  }

  .login-right {
    width: 50%;
    height: 100%;
    min-width: 400px;
    justify-content: center;

    h3 {
      font-size: 19px;
      font-weight: 600;
      margin-bottom: 25px;
    }
  }

  .login-form {
    width: 400px;
    padding: 40px 25px 50px 25px;
    background: #fff;
    border-radius: 5px;

    .captcha {
      position: absolute;
      top: 0;
      right: 0;

      img {
        width: 120px;
        height: 48px;
        cursor: pointer;
      }
    }
  }
}

.login-type {
  display: flex;
  justify-content: center;
  .item { padding: 0 5px;}
}

.obtain-verification-code {
  margin-right: 15px;
  color: #0068de;
  cursor: pointer;
}

.obtain-verification-code-second {
  margin-right: 15px;
  color: #999;
}</style>
