import { defineStore } from 'pinia';
import { loginApi } from '@/api/auth';
import { getUserInfo } from '@/api/user';
import { resetRouter } from '@/router';
import { store } from '@/store';
import { LoginData } from '@/api/auth/types';
import { UserInfo } from '@/api/user/types';

export const useUserStore = defineStore('user', () => {
  // state
  const token = ref('');
  const nickname = ref('');
  const avatar = ref('');
  const roles = ref<Array<string>>([]);     // route-level roles
  const perms = ref<Array<string>>([]);      // button-level codes (v-has-perm)
  const menu = ref<Array<any>>([]);          // menu tree from backend
  const userList = ref<any>([]);             // dynamic route list

  // actions
  async function login(loginData: LoginData) {
    const { data } = await loginApi(loginData);
    token.value = 'Bearer ' + data.access_token;
    localStorage.setItem('accessToken', token.value);
  }

  async function getInfo(): Promise<UserInfo> {
    const { data } = await getUserInfo();
    if (!data) {
      throw new Error('Verification failed, please login again.');
    }
    nickname.value = data.account;
    avatar.value = data.avatar || '';
    roles.value = data.roles || ['ADMIN'];
    perms.value = data.perms || [];
    menu.value = data.menu || [];
    return data as UserInfo;
  }

  function setUserList(list: any[]) {
    userList.value = list;
  }

  function logout() {
    return new Promise<void>((resolve) => {
      resetRouter();
      resetToken();
      resolve();
    });
  }

  function resetToken() {
    localStorage.clear();
    sessionStorage.clear();
    token.value = '';
    nickname.value = '';
    avatar.value = '';
    roles.value = [];
    perms.value = [];
    menu.value = [];
    userList.value = [];
  }

  return {
    token,
    nickname,
    avatar,
    roles,
    perms,
    menu,
    userList,
    login,
    getInfo,
    setUserList,
    logout,
    resetToken
  };
});

export function useUserStoreHook() {
  return useUserStore(store);
}
