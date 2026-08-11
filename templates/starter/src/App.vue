<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import { useAppStore } from '@/store/modules/app';
import { useUserStore } from '@/store/modules/user';
import loadZzdScript from "@/utils/zzdJianKong"
// console.log('6', import.meta.env.VITE_APP_TITLE)
if (import.meta.env.VITE_APP_TITLE) {
  document.title = import.meta.env.VITE_APP_TITLE as string;
} else {
  document.title = '智慧服务平台';
}

const appStore = useAppStore();
const userStore = useUserStore();
// 通过浏览器标识来判断是否在浙政钉环境
let ua = navigator.userAgent.toLowerCase();
if (ua.match(/TaurusApp/i)) {
  //在浙政钉环境中
  userStore.setIsZzd(true)
  if (userStore.zzdAppInfo) { loadZzdScript(userStore.zzdAppInfo.bid) } //如果有浙政钉应用信息则加载“浙政钉稳定性监控”
} 
</script>

<template>
  <el-config-provider :locale="appStore.locale" :size="appStore.size">
    <router-view />
  </el-config-provider>
</template>
