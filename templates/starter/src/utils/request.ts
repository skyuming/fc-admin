/* Axios网络请求库封装 */
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
// import { useUserStoreHook } from '@/store/modules/user';
import { AxiosPromise } from 'axios';
import router from "@/router"
import { useUserStore } from '@/store/modules/user';
import dd from "gdt-jsapi"
import { zzdH5NoPassLogin } from "@/api/user"
// import { ElMessageBox, ElMessage } from 'element-plus'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 120000
});
const CancelToken = axios.CancelToken
// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let cancel: any
    if(useUserStore().thisInfo.platform_token_validity_period){
      let time = useUserStore().thisInfo.platform_token_validity_period * 60 * 1000
      if (useUserStore().loginTimeObj.timerId) {
        clearTimeout(useUserStore().loginTimeObj.timerId)
      }
      useUserStore().loginTimeObj.timerId = setTimeout(() => {
        useUserStore().loginTimeObj.isLose = true
        localStorage.clear();
        sessionStorage.clear();
        config.cancelToken = new CancelToken((c) => {
          cancel = c
        })
        cancel()
        ElMessage.error('登录失效，请重新登录');
        router.push({ path: "/login" });

        // 跳转到指定的 URL 地址
        // if(import.meta.env.VITE_LOGIN_TYPE.includes(5)) {
        //   // 跳转到指定的 URL 地址，并替换当前页面的历史记录
        //   location.replace(import.meta.env.VITE_THIRD_LOGIN_URL);
        // } else {
        //   router.push({ path: "/login" });
        // }

      }, time)
    }
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 2xx 范围内的状态码都会触发该函数，对响应数据做点什么
    // console.log('打印：',response.data)
    // const { code, msg } = response.data;
    // if (code === '00000') {
    //   return response.data;
    // }
    // // 响应数据为二进制流处理(Excel导出)
    // if (response.data instanceof ArrayBuffer) {
    //   return response;
    // }

    // ElMessage.error(msg || '系统出错');
    return response;
    // return Promise.reject(new Error(msg || 'Error'));
  },
  (error: any) => {
    // 超出 2xx 范围的状态码都会触发该函数，对响应错误做点什么
    // console.log('error内容',error)
    // console.log('alfal:',router.currentRoute.value.fullPath)
    // 401token 过期,重新登录;403无权限
    if (error.response.status === 401) {
      if (router.currentRoute.value.fullPath === "/login") { // 如果当前页面是登录页则清除本地缓存
        localStorage.clear();
        sessionStorage.clear();
      } else if (useUserStore().isZzd) { // 如果是浙政钉环境 则重新获取免登token
        dd.ready(() => {
          dd.getAuthCode({}).then((result: any) => {
            if (result) {
              let zzdCode = result.auth_code
              zzdH5NoPassLogin(zzdCode).then(async (res: any) => {
                if (res.data.code == 401 || res.data.code == 400) { // 如果获取token失败，则跳转至免登页面重新走免登的流程
                  router.push({ path: "/zzdLogin", replace: true });
                } else if (res.data.code === 200) {
                  let access_token = res.data.data.tokeninfo.access_token
                  useUserStore().setNoPassToken(access_token);
                }
              }).catch(() => {

              })
            }
          })
        })
      } else {
        // 如果当前页面不是登录页则跳转登录页并清除本地缓存
        localStorage.clear();
        sessionStorage.clear();

        // 下面的写法会导致跳转至登录页后，再次跳转至当前页面并且会弹出登录失效的提示一直不关闭
        // ElMessageBox.confirm('登录失效，请重新登录', '提示', {
        //   confirmButtonText: '确定',
        //   type: 'warning',
        //   showClose: false,
        //   showCancelButton: false,
        // }).then(() => {
        //   localStorage.clear();
        //   sessionStorage.clear();
        //   ElMessageBox.close(); // 关闭全部弹窗
        //   setTimeout(() => {
        //     router.push({ path: "/login" });

        //     // 跳转到指定的 URL 地址
        //     // if(import.meta.env.VITE_LOGIN_TYPE.includes(5)) {
        //     //   // 跳转到指定的 URL 地址，并替换当前页面的历史记录
        //     //   location.replace(import.meta.env.VITE_THIRD_LOGIN_URL);
        //     // } else {
        //     //   router.push({ path: "/login" });
        //     // }
        //   }, 500);
        // });
      }
    } else {
      ElMessage.error(error.response.data.error_description || '系统出错');
    }

    // if (error?.response?.data) {
    //   const { code, error_description } = error.response.data;
    //   // token 过期,重新登录
    //   if (code === 'A0230') {
    //     ElMessageBox.confirm('当前页面已失效，请重新登录', '提示', {
    //       confirmButtonText: '确定',
    //       type: 'warning'
    //     }).then(() => {
    //       localStorage.clear();
    //       window.location.href = '/';
    //     });
    //   } else {
    //     ElMessage.error(error_description || '系统出错');
    //   }
    // }
    return Promise.reject(error.message);
  }
);

// 导出 axios 实例
export default service;
