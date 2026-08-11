/* 动态权限路由 */
import router from "@/router";
import { specialRoutes } from "@special-routes";
import { useUserStoreHook } from "@/store/modules/user";
import { usePermissionStoreHook } from "@/store/modules/permission";
import axios from 'axios';
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import loadXinchuangScript from "@/utils/xinchuangMaiDian"
import baseAplus from "@/utils/zzdMaiDian"
NProgress.configure({ showSpinner: false }); // 进度条显示/隐藏

const permissionStore = usePermissionStoreHook();
const userStore = useUserStoreHook();
const specialWhiteList = specialRoutes.map((route) => route.path).filter((path): path is string => Boolean(path));


// const getIp = () => {
//   return new Promise<void>((resolve, reject) => {
//     (window as any).jsonp({
//       url: "https://vv.video.qq.com/checktime?otype=json",
//       success: function (obj: any) {
//         resolve(obj)
//       }
//     });
//   })
// }
// 白名单路由
// 如果新增特殊页面需要未登录直接访问，这里也要同步补路径。
const whiteList = [
  "/login",
  "/noPermission",
  "/zzdLogin",
  "/thirdLogin",
  ...specialWhiteList,
];

// 根据参数判断要重定向到哪个登录界面
const redirectLogin = () => {
  let params = new URL(window.location.href).searchParams //获取#号前的参数
  let thirdCode = params.get('code') //获取参数中‘code’字段
  
  let url = ""
  if (thirdCode) { //如果在地址栏中有code参数 则跳转第三方免登界面
    url = `/thirdLogin`
  } else if (userStore.isZzd) { //如果是在浙政钉环境 则跳转浙政钉免登界面
    url = `/zzdLogin`
  } else { //否则进入默认登录界面
    url = `/login`
  }
  return url
}
router.beforeEach(async (to, from, next) => {

  NProgress.start();
  // 获取外网IP地址
  // 获取当前时间并判断是否为工作日8-20点
  // let timeObj = {
  //   t: 0,
  //   ip: ''
  // }
  // let dateObj = await getIp()
  // Object.assign(timeObj, dateObj)
  // // 处理时间戳
  // var date = new Date(timeObj.t * 1000);
  // let day = date.getDay();
  // var hour = date.getHours();
  // var days = date.getDate() + ''
  // days = days.length === 1 ? '0' + days : days
  // let time = date.getMonth() + 1 + '' + days;

  // 是否工作时间
  // let isWorkTime = true;
  // 是否是国庆期间
  // let arr = ['929', '930', '1001', '1002', '1003', '1004', '1005', '1006']
  // if (arr.includes(time)) {
  //   isWorkTime = false
  // }
  // let arr2 = ['1007', '1008']
  // if (arr2.includes(time)) {
  //   isWorkTime = true
  // }
  // console.log(timeObj)
  // if (isWorkTime || timeObj.ip === '61.164.57.62') {
  const hasToken = localStorage.getItem("accessToken");

  // 先判断是否为白名单路由，防止有token并且过期时访问白名单路由时会进入登录页
  if (whiteList.indexOf(to.path) !== -1) {
    next();
  } else {
    // 有 token 则继续判断
    if (hasToken) {
      if (to.path === "/login") {

        await userStore.resetToken();
        next({ path: "/login" });
        NProgress.done();
        // // 如果已登录，跳转首页
        // // next({ path: userStore.thisInfo.menu[0].describe });
        // next({ path: "/" });
        // NProgress.done();
      } else {
        // 没登录
        // const hasRoles = userStore.roles && userStore.roles.length > 0;
        if (userStore.userList.length > 0) {
          // 浙政钉埋点
          baseAplus(to)

          next();
        } else {
          try {
            const { roles, region_id } = await userStore.getInfo();
            // console.log('获得的roles',roles)
            const accessRoutes = await permissionStore.generateRoutes(roles);
            userStore.setUserList(accessRoutes)
            let routes = {
              path: "/",
              name: "index",
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
            if (import.meta.env.VITE_APP_BASE_API.includes('yhya') || import.meta.env.VITE_APP_BASE_API.includes('chjd')) {// 拱宸运河沿岸未来社区，调用信创埋点
              loadXinchuangScript(userStore)
            }
            next({ ...to, replace: true });
          } catch (error) {
            // 移除 token 并跳转登录页
            await userStore.resetToken();
            // 跳转至登陆页
            next(redirectLogin())
            NProgress.done();
          }
        }
      }
    } else {
      // 未登录可以访问白名单页面
      // if (whiteList.indexOf(to.path) !== -1) {
      //   next();
      // } else {

        // 跳转至登陆页
        next(redirectLogin())
        NProgress.done();
      // }
    }
  }
  // } else {
  //   if ((to.path) == '/noPermission') {
  //     next();
  //   } else {
  //     next(`/noPermission`);
  //     NProgress.done();
  //   }
  // }
});

router.afterEach(() => {
  NProgress.done();
});
