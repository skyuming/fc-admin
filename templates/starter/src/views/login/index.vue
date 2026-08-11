<template>
  <div class="login-container">
    <div class="login-top">{{ $t('login.title') || 'Admin Console' }}</div>
    <div class="login-box">
      <div class="login-form">
        <h3 class="text-center">欢迎登录</h3>
        <el-form ref="loginFormRef" :model="loginData" :rules="loginRules">
          <el-form-item prop="username">
            <el-input v-model="loginData.username" placeholder="用户名" name="username" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginData.password" type="password" placeholder="密码" name="password" @keyup.enter="handleLogin" />
          </el-form-item>
          <el-button :loading="loading" type="primary" class="w-full" @click.prevent="handleLogin">
            登录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { loginApi } from '@/api/auth';
import { useUserStore } from '@/store/modules/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const redirect = ref(typeof route.query.redirect === 'string' ? route.query.redirect : '/');

const loginData = reactive({
  username: '',
  password: ''
});

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

async function handleLogin() {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate();
  loading.value = true;
  try {
    await userStore.login(loginData);
    ElMessage.success('登录成功');
    router.push(redirect.value);
  } catch (err: any) {
    ElMessage.error(err?.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
.login-top {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
}
.login-box {
  width: 420px;
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.login-form { width: 100%; }
.w-full { width: 100%; }
</style>
