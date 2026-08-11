import { defineStore } from 'pinia';

import { loginApi } from '@/api/auth';
import { getUserInfo } from '@/api/user';
import { resetRouter } from '@/router';
import { store } from '@/store';
import { getBasicConfig } from "@/api/operationManage/basicConfig/index"

import { LoginData } from '@/api/auth/types';
import { UserInfo } from '@/api/user/types';

import { useStorage } from '@vueuse/core';
import { codelogin, usercodelogin } from "@/api/user/index"
export const useUserStore = defineStore('user', () => {
  // state
  const token = ref("");
  const region_id = ref(localStorage.getItem('region_id') || "");  // 存储社区id
  const livebood_region_id = ref(localStorage.getItem('livebood_region_id') || "")
  const region_type = ref(localStorage.getItem('region_type') || "");  // 存储社区类型 0:未来社区 1:产业社区
  const nickname = ref('');
  const avatar = ref('');
  const roles = ref<Array<string>>([]); // 用户角色编码集合 → 判断路由权限
  const perms = ref<Array<string>>([]); // 用户权限编码集合 → 判断按钮权限
  const menu = ref<Array<any>>([]); // 存储菜单
  const regionManager = ref<Array<any>>([]); // 存储所管理的社区列表
  const thisInfo = useStorage<any>('thisInfo', {}) // 存储this
  const userList = ref<any>([]);
  const isZzd = ref<boolean>(false); // 是否为浙政钉环境
  const zzdUserInfo = ref<any>({}); // 浙政钉用户信息
  const zzdContacts = ref() // 浙政钉应用上架审核用的联系人信息
  const zzdAppInfo = ref() // 浙政钉应用信息-用于发布
  const loginTimeObj = ref<any>({}) // 存储计时器信息

  // zzdContacts.value = {
  //   unit: "杭州市上城区委组织部",
  //   name: "黎愉（技术负责人）",
  //   phone: "13750851205"
  // }
  if (import.meta.env.VITE_APP_BASE_API.includes('chjd')) {//长河街道未来社区
    // zzdContacts.value = {
    //   unit: "杭州市滨江区人民政府长河街道办事处",
    //   name: "冯真",
    //   phone: "13868003698",
    // }
    zzdAppInfo.value = {
      sapp_id: '42071', //埋点应用标识
      sapp_name: 'chjdwlsq', //埋点应用名称
      bid: 'chjdwlsq_zzdpro', //稳定性监测bid
    }
  } else if (import.meta.env.VITE_APP_BASE_API.includes('xxjd')) {//西兴街道未来社区
    // zzdContacts.value = {
    //   unit: "杭州市滨江区人民政府西兴街道办事处",
    //   name: "来立成",
    //   phone: "15355428458"
    // }

    zzdAppInfo.value = {
      sapp_id: '42072',  
      sapp_name: 'XXJDWLSQ',
      bid: 'XXJDWLSQ_zzdpro', //稳定性监测bid

    }
  } else if (import.meta.env.VITE_APP_BASE_API.includes('xfllf')) {//上城幸福邻里坊

    // zzdContacts.value = {
    //   unit: "杭州市上城区委组织部",
    //   name: "黎愉（技术负责人）",
    //   phone: "13750851205"
    // }
    zzdAppInfo.value = {
      sapp_id: '44357',  
      sapp_name: 'sc_xfllf',
      bid: 'sc_xfllf_zzdpro', //稳定性监测bid

    }
  } else if (import.meta.env.VITE_APP_BASE_API.includes('yhya')) {// 拱宸运河沿岸未来社区
    // zzdContacts.value = {
    //   unit: "杭州市拱墅区人民政府拱宸桥街道办事处",
    //   name: "陈杭",
    //   phone: "18857189590"
    // }

    zzdAppInfo.value = {
      sapp_id: '44381',  
      sapp_name: 'gcq_yhyawlsq',
      bid: 'gcq_yhyawlsq_zzdpro', //稳定性监测bid

    }
  }

  /**
   * 登录调用
   *
   * @param {LoginData}
   * @returns
   * type=1 用户名密码登录（密码明文；前端绘制验证码）  type=2 手机号验证码登录 type=4 用户名密码登录（密码加密；从接口获取验证码）
   */
  function login(loginData: any, time: string, type: any) {
    return new Promise<void>((resolve, reject) => {
      if (type == 1) { // 用户名密码登录（密码明文；前端绘制验证码）
        loginApi(loginData, time)
          .then(({ data }) => {
            token.value = 'Bearer' + ' ' + data.access_token;
            localStorage.setItem('accessToken', token.value) // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      } else if (type == 2) { // 手机号验证码登录
        codelogin(loginData, time).then(({ data }) => {
          token.value = 'Bearer' + ' ' + data.access_token;
          localStorage.setItem('accessToken', token.value) // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx
          resolve();
        })
          .catch(error => {
            reject(error);
          });
      }
      else if (type == 4) { // 用户名密码登录（密码加密；从接口获取验证码）
        usercodelogin(loginData, time).then(({ data }) => {
          if (data.tokeninfo == null) { // 处理用户名密码错误
            ElMessage.error(data.mess);
            reject();
          } else {
            token.value = 'Bearer' + ' ' + data.tokeninfo.access_token;
            localStorage.setItem('accessToken', token.value) // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx
          }
          resolve();
        })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  //免密登录
  let setNoPassToken = (tokenStr: string) => {
    token.value = 'Bearer' + ' ' + tokenStr;
    localStorage.setItem('accessToken', token.value)
  }

  // 是否是浙政钉环境
  const setIsZzd = (data: boolean) => {
    isZzd.value = data;
  }
  // 浙政钉用户信息
  const setZzdUserInfo = (data: any) => {
    zzdUserInfo.value = data;
  }



  // 获取信息(用户昵称、头像、角色集合、权限集合)
  function getInfo() {
    return new Promise<UserInfo>((resolve, reject) => {
      getUserInfo()
        .then(async ({ data }) => {
          // console.log('this拿到的用户信息:', data)
          if (!data) {
            return reject('验证失败，请重新登录');
          }
          thisInfo.value = data;
          nickname.value = data.account;
          roles.value = ["ADMIN"];
          // perms.value = ["sys:user:edit", "sys:user:delete", "sys:user:add"];
          //* 重组权限
          let newflag = ref<Array<string>>([]);
          let roleflag = (data as any).role.flag.split("\,");
          roleflag.forEach((item: any) => {
            newflag.value.push("sys:user:" + item)
          })
          perms.value = newflag.value;
          // console.log('按钮权限:',perms.value)
          // 处理菜单
          const menuList = (data as any).menu;
          if (menuList && menuList.length > 0) {
            menu.value = data.menu;
          } else { // 处理没有菜单的情况，默认添加一个系统管理菜单
            menu.value.push({
              describe: "/system",
              flag: "",
              icon: "system",
              id: 1,
              is_hide: 0,
              name: "系统管理",
              parent_id: 0,
              routepath: "/system",
              sort: 100,
              type: 0,
              children: [
                {
                  "id": 3,
                  "name": "菜单管理",
                  "describe": "/menuManager",
                  "flag": "Menu",
                  "routepath": "system/menu/index",
                  "icon": "publish",
                  "type": 1,
                  "is_hide": 0,
                  "sort": 20,
                  "parent_id": 1,
                  "children": null
                }
              ]
            });
          }
          // console.log(menu.value)
          //* 管理的社区列表（管理的社区数量大于1个则给切换社区赋值）
          let regionsList = (data as any).manage_regions
          let all_manage_regions = (data as any).all_manage_regions
          if (regionsList.length) {
            // 判断是否是街道账号
            const isStreetAccount = all_manage_regions.some((item:any)=>{ return item.level == 3 })
            if(isStreetAccount){
              localStorage.setItem("region_id", (data as any).region_id[0])
              region_id.value = (data as any).region_id[0];
            } else {
              localStorage.setItem("region_id", (data as any).manage_regions[0].id)
              region_id.value = (data as any).manage_regions[0].id;
            }
            if(regionsList.length>0){ // 大于等于1都要赋值，用户页面需要做判断用
              regionManager.value = regionsList
            }
          }
          if(all_manage_regions.length!==0){
            livebood_region_id.value = (data as any).all_manage_regions[0].id;
          }
          localStorage.setItem("livebood_region_id", livebood_region_id.value)
          if (region_id.value) {
            let { data: { xqcgxx } } = await getBasicConfig(region_id.value, 'xqcgxx')
            if (xqcgxx) {
              region_type.value = xqcgxx.type.toString()
              localStorage.setItem("region_type", xqcgxx.type.toString())
            }
          }
          let rdata = {
            nickname: data.account,
            avatar: "",
            roles: ["ADMIN"],
            perms: newflag.value,
            account: data.account,
            region_id: data.region_id[0],
            menu: data.menu,
            regionManager: regionsList,
            thisInfo: data,
            is_force_update_pwd: data.is_force_update_pwd
          }
          resolve(rdata);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  /* 各角色菜单表 */

  /**
   * 系统管理员菜单
   */
  const setUserList = (list: any[]) => {
    userList.value = list;
  }


  // 注销
  function logout() {
    return new Promise<void>((resolve, reject) => {
      resetRouter();
      resetToken();
      resolve();
    });
  }

  // 重置
  function resetToken() {
    localStorage.clear();
    sessionStorage.clear();
    token.value = '';
    nickname.value = '';
    avatar.value = '';
    roles.value = [];
    perms.value = [];
    menu.value = [];
    region_id.value = "";
    regionManager.value = [];
    thisInfo.value = {};
    userList.value = [];
  }
  return {
    token,
    nickname,
    avatar,
    region_id,
    livebood_region_id,
    region_type,
    roles,
    perms,
    menu,
    regionManager,
    thisInfo,
    userList,
    isZzd,
    zzdUserInfo,
    zzdContacts,
    zzdAppInfo,
    loginTimeObj,
    login,
    getInfo,
    logout,
    resetToken,
    setUserList,
    setIsZzd,
    setZzdUserInfo,
    setNoPassToken
  };
});

// 非setup
export function useUserStoreHook() {
  return useUserStore(store);
}
