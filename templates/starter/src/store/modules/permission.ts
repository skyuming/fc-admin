/* 根据用户角色获取拥有权限的路由(静态路由+动态路由) */
import { RouteRecordRaw } from "vue-router";
import { defineStore } from "pinia";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import { useUserStoreHook } from "@/store/modules/user";
import { modules } from "@view-modules";
import { isExternal } from "@/utils/index";

const userStore = useUserStoreHook();
const Layout = () => import("@/layout/routerView/index.vue");

/**
 * 使用meta.roles确定当前用户是否具有权限
 *
 * @param roles 用户角色集合
 * @param route 路由
 * @returns
 */
const hasPermission = (roles: string[], route: RouteRecordRaw) => {
  // if (route.meta && route.meta.roles) {
  //   // 角色【超级管理员】拥有所有权限，忽略校验
  //   if (roles.includes("ROOT")||roles.includes("ADMIN")) {
  //     return true;
  //   }
  //   return roles.some((role) => {
  //     if (route.meta?.roles !== undefined) {
  //       return (route.meta.roles as string[]).includes(role);
  //     }
  //   });
  // }
  // return false;

  // 菜单由接口返回，忽略校验
  return true;
};

/**
 * 递归过滤有权限的异步(动态)路由
 *
 * @param routes 接口返回的异步(动态)路由
 * @param roles 用户角色集合
 * @returns 返回用户有权限的异步(动态)路由
 */
const filterAsyncRoutes = (routes: any[], roles: string[]) => {
  const asyncRoutes: RouteRecordRaw[] = [];

  routes.forEach((route) => {
    const tmpRoute = { ...route }; // ES6扩展运算符复制新对象

    // 判断用户(角色)是否有该路由的访问权限
    if (hasPermission(roles, tmpRoute)) {
      if (tmpRoute.component?.toString() == "Layout") {
        tmpRoute.component = Layout;
      } else if (isExternal(tmpRoute.path)) {
        delete tmpRoute.component;
      } else {
        const component = modules[`../../views/${tmpRoute.component}.vue`];
        if (component) {
          tmpRoute.component = component;
        } else {
          tmpRoute.component = modules[`../../views/error-page/404.vue`];
        }
      }

      if (tmpRoute.children) {
        tmpRoute.children = filterAsyncRoutes(tmpRoute.children, roles);
      }

      asyncRoutes.push(tmpRoute);
    }
  });

  return asyncRoutes;
};

/**
 * 过滤出真正需要注册到 vue-router 的内部路由。
 * 外链菜单仅用于侧边栏展示，不能直接注册为路由。
 */
const filterRouterRoutes = (routes: RouteRecordRaw[]) => {
  const routerRoutes: RouteRecordRaw[] = [];

  routes.forEach((route) => {
    const tmpRoute: any = { ...route };

    if (isExternal(String(tmpRoute.path ?? ""))) {
      return;
    }

    if (tmpRoute.children?.length) {
      tmpRoute.children = filterRouterRoutes(tmpRoute.children);
      const firstInternalChild = tmpRoute.children.find(
        (child: RouteRecordRaw) => !isExternal(String(child.path ?? ""))
      );

      if (firstInternalChild) {
        tmpRoute.redirect = firstInternalChild.path;
      } else {
        delete tmpRoute.redirect;
      }
    }

    if (tmpRoute.children?.length || tmpRoute.component || tmpRoute.redirect) {
      routerRoutes.push(tmpRoute);
    }
  });

  return routerRoutes;
};

// setup
export const usePermissionStore = defineStore("permission", () => {
  // state
  const routes = ref<RouteRecordRaw[]>([]);

  // actions
  function setRoutes(newRoutes: RouteRecordRaw[]) {
    // console.log('全部路由',routes)
    routes.value = constantRoutes.concat(newRoutes);

  }
  /**
   * 生成动态路由
   *
   * @param roles 用户角色集合
   * @returns
   */
  function generateRoutes(roles: any[]) {
    return new Promise<RouteRecordRaw[]>((resolve) => {
      let getmenuList = userStore.menu // this接口获取的菜单
      // console.log('获得的menu', getmenuList)
      let menuRoute: any[] = [];
      getmenuList.forEach((rone) => { // 一级菜单处理
        let obj: any = {
          children: [],
          path: rone.describe,
          component: "Layout",
          meta: {
            title: rone.name,
            icon: rone.icon,
            hidden: false,
            roles: ["ADMIN"],
            flag: rone.flag,
            keepAlive: true
          }
        }
        // console.log(rone)
        // menuRoute.value.push()
        if (rone.children) {  // 二级菜单处理
          rone.children.forEach((rtwo: any) => {
            //场馆预约，接待预约，说后期还会有很多预约，需要传参
            const rawRoutePath = typeof rtwo.routepath === "string" ? rtwo.routepath : "";
            const isExternalMenu = Number(rtwo.type) === 3 && isExternal(rawRoutePath);
            const routepath = isExternalMenu ? "" : rawRoutePath.split("?")[0];
            const query = isExternalMenu ? "" : (rawRoutePath.split("?")[1] ?? "");
            let objChild: any = {
              path: isExternalMenu ? rawRoutePath : rtwo.describe,
              component: routepath,
              name: isExternalMenu ? `external-${rtwo.id}` : rtwo.describe,
              meta: {
                id:rtwo.id,
                title: rtwo.name,
                icon: rtwo.icon,
                hidden: false,
                roles: ["ADMIN"],
                flag: rtwo.flag,
                keepAlive: true,
                query,
                menuType: rtwo.type
              }
            }
            if (!objChild.path) {
              return;
            }
            obj.children.push(objChild);
            // if (rtwo.children) { // 三级菜单处理
            //   rtwo.children.forEach((rthree: any, threeInd: any) => {
            //     let obj = {
            //       path: rthree.describe,
            //       component: rthree.routepath,
            //       meta: {
            //         title: rthree.name,
            //         icon: rthree.icon,
            //         hidden: false,
            //         roles: ["ADMIN"],
            //         flag: rthree.flag,
            //         keepAlive: true
            //       }
            //     }
            //     menuRoute.value[index].children[twoInd].children[threeInd] = obj;
            //   })
            // }
          })
          const firstInternalChild = obj.children.find((child: any) => !isExternal(child.path));
          if (firstInternalChild) {
            obj.redirect = firstInternalChild.path;
          }
        }
        menuRoute.push(obj)
      });
      // 动态路由赋值
      // console.log('重组menu',menuRoute.value)
      // 接口获取所有路由
      // listRoutes()
      //   .then(({ data: asyncRoutes }) => {
      //     console.log('asyncRoutes:',asyncRoutes,roles)
      //     // 根据角色获取有访问权限的路由
      //     const accessedRoutes = filterAsyncRoutes(asyncRoutes, roles);
      //     setRoutes(accessedRoutes);
      //     resolve(accessedRoutes);
      //   })
      //   .catch((error) => {
      //     reject(error);
      //   });
      // 根据角色获取有访问权限的路由
      // const accessedRoutes = filterAsyncRoutes(menuList.AdminMenu.data, roles);
      const menuRoutes = filterAsyncRoutes(menuRoute, roles);
      const accessedRoutes = filterRouterRoutes(menuRoutes);
      // console.log(accessedRoutes)
      setRoutes(menuRoutes);
      resolve(accessedRoutes);
    });
  }
  return { routes, setRoutes, generateRoutes };
});

// 非setup
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}