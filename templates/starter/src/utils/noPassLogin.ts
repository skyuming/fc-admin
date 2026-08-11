import { noPassLogin, zzdNoPassLogin } from "@/api/user"
import router from "@/router"
import { useUserStore } from "@/store/modules/user";
import { usePermissionStoreHook } from "@/store/modules/permission";


const permissionStore = usePermissionStoreHook();
const userStore = useUserStore();
const login = async (zzdCode: any) => {
    let codeStr: string = ''
    let codeAry: string[]
    let codeItem;
    let redirectItem;
    let appkeyItem;
    let code: string = '';
    let redirect: string = '';
    let appkey: string = '';
    let data = {
        code,
        appkey
    }
    let userInfo: any = {}
    if (zzdCode === undefined) {
        if (!window.location.search) {
            return
        }
        codeStr = window.location.search.slice(1);
        codeAry = codeStr.split("&");
        codeItem = codeAry.find(el => {
            return el.startsWith("code=");
        });
        redirectItem = codeAry.find(el => {
            return el.startsWith("redirect=");
        });
        appkeyItem = codeAry.find(el => {
            return el.startsWith("appkey=");
        });
        code = codeItem?.split("=")[1] ?? "";
        redirect = redirectItem?.split("=")[1] ?? "";
        appkey = appkeyItem?.split("=")[1] ?? "";
        if (!code || !appkey) {
            return
        }
        data = {
            code,
            appkey
        }
        userInfo = await noPassLogin(data);

    } else {
        userInfo = await zzdNoPassLogin(zzdCode);
    }
    if (userInfo.data.code!==undefined && userInfo.data.code !== 200 ) {
        return userInfo
    }
    let { data: { tokeninfo: { access_token } } } = userInfo
    userStore.setNoPassToken(access_token);
    
    const { roles } = await userStore.getInfo();
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
    if (redirect) {
        // 开放重定向防护：只允许相对路径
        const isRelativePath = /^[a-zA-Z0-9_-]+$/.test(redirect);
        if (isRelativePath) {
            router.push({ path: `/redirect/${redirect}` });
        } else {
            router.push({ path: "/" });
        }
    } else {
        router.push({ path: "/" });
    }
}
login(undefined);
// 导出login
export default login;