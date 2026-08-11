/* Dynamic permission route guard */
import router from '@/router';
import { specialRoutes } from '@special-routes';
import { useUserStoreHook } from '@/store/modules/user';
import { usePermissionStoreHook } from '@/store/modules/permission';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });

const permissionStore = usePermissionStoreHook();
const userStore = useUserStoreHook();

const specialWhiteList = specialRoutes
  .map((route) => route.path)
  .filter((path): path is string => Boolean(path));

/** Routes accessible without authentication */
const whiteList = ['/login', '/noPermission', ...specialWhiteList];

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  const hasToken = localStorage.getItem('accessToken');

  if (whiteList.indexOf(to.path) !== -1) {
    next();
  } else if (hasToken) {
    if (to.path === '/login') {
      await userStore.resetToken();
      next({ path: '/login' });
      NProgress.done();
    } else {
      try {
        if (userStore.userList.length > 0) {
          next();
        } else {
          const { roles } = await userStore.getInfo();
          const accessRoutes = await permissionStore.generateRoutes(roles);
          userStore.setUserList(accessRoutes);
          const rootRoute = {
            path: '/',
            name: 'index',
            component: () => import('@/layout/index.vue'),
            redirect: accessRoutes[0].path,
            children: [
              { path: '401', component: () => import('@/views/error-page/401.vue'), meta: { hidden: true } },
              { path: '404', component: () => import('@/views/error-page/404.vue'), meta: { hidden: true } }
            ]
          };
          accessRoutes.forEach((route: any) => rootRoute.children.push(route));
          router.addRoute(rootRoute);
          next({ ...to, replace: true });
        }
      } catch (error) {
        await userStore.resetToken();
        next('/login');
        NProgress.done();
      }
    }
  } else {
    next('/login');
    NProgress.done();
  }
});

router.afterEach(() => {
  NProgress.done();
});
