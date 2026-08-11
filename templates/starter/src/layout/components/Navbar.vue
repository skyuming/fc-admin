<script setup lang="ts">
import { useAppStore } from '@/store/modules/app';
import { useTagsViewStore } from '@/store/modules/tagsView';
import { useUserStore } from '@/store/modules/user';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

const appStore = useAppStore();
const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

function toggleSideBar() {
  appStore.toggleSidebar(true);
}

function logout() {
  ElMessageBox.confirm('确定退出登录?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout().then(() => {
      tagsViewStore.delAllViews();
    }).then(() => {
      router.push(`/login?redirect=${route.fullPath}`);
    });
  });
}
</script>

<template>
  <div class="navbar">
    <div class="navbar-left">
      <hamburger :is-active="appStore.sidebar.opened" @toggleClick="toggleSideBar" />
      <breadcrumb />
    </div>
    <div class="navbar-right">
      <screenfull class="navbar-setting-item" />
      <el-dropdown trigger="click">
        <div class="navbar-user">
          <span class="navbar-avatar">{{ userStore.nickname?.charAt(0) || 'U' }}</span>
          <span class="navbar-nickname">{{ userStore.nickname }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
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
  padding: 0 16px;
}
.navbar-left { display: flex; align-items: center; }
.navbar-right { display: flex; align-items: center; gap: 16px; }
.navbar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.navbar-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-size: 14px;
}
.navbar-setting-item {
  display: inline-flex;
  align-items: center;
  height: 50px;
  cursor: pointer;
}
</style>
