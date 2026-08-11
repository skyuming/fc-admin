<template>
    <div class="contentBox">
        <div v-loading.fullscreen.lock="fullscreenLoading"></div>

        <div v-if="!fullscreenLoading" class="content">
            <div class="text">
                <div> {{ info.message }}</div>


            </div>
        </div>

    </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import router from "@/router";
import { useRoute } from "vue-router"
import { xxjdNoPassLogin, chjdNoPassLogin } from "@/api/user"
import { ElLoading } from 'element-plus'
// 状态管理依赖
import { useUserStore } from "@/store/modules/user";
// API依赖
import { usePermissionStoreHook } from "@/store/modules/permission";
import hmacsha from "@/utils/hmacsha512";
import { ElMessageBox, ElMessage } from 'element-plus'
import qs from 'qs';
const userStore = useUserStore();
const permissionStore = usePermissionStoreHook();
const fullscreenLoading = ref(true)
const route = useRoute()
const info = ref()

onMounted(() => {

    let params = new URL(window.location.href).searchParams //获取#号前的参数
    let t = params.get('t') //获取参数中‘t’字段
    if (t) {
        thirdLogin()
    }

});


// 西兴街道免登方法
const thirdLogin = async () => {
    try {
        let res: any = await thirdLoginPromise()
        console.log(res);
        if (res.data.code == 401 || res.data.code == 400) {
            info.value = res.data
            fullscreenLoading.value = false
        } else if (res.data.code === 200) {
            let access_token = res.data.data.tokeninfo.access_token
            userStore.setNoPassToken(access_token);
            const { roles } = await userStore.getInfo();
            const accessRoutes = await permissionStore.generateRoutes(roles);
            userStore.setUserList(accessRoutes)
            initializeParameters()
            fullscreenLoading.value = false

        }
    } catch {
        fullscreenLoading.value = false
    }

}
const thirdLoginPromise = () => {
    return new Promise((resolve, reject) => {
        const url = new URL(window.location.href)
        let params = url.searchParams //获取#号前的参数
        let thirdCode = params.get('code') as string //获取参数中‘code’字段
        let t = params.get('t') //获取参数中‘code’字段

        if (t == 'xxjd') {
            xxjdNoPassLogin(thirdCode).then(res => {
                resolve(res)
            }).catch((err) => {
                reject(err)
            })
        } else if (t == 'chjd') {
            chjdNoPassLogin(thirdCode).then(res => {
                resolve(res)
            }).catch((err) => {
                reject(err)
            })
        }
    })
}


//登录成功之后初始化参数
async function initializeParameters() {
    const { roles, is_force_update_pwd } = await userStore.getInfo();
    // console.log('获得的roles',is_force_update_pwd)

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
    router.push({ path: "/" });

}
</script>
  
<style lang="scss" scoped>
.contentBox {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .content {
        width: 450px;
        background: url('../../assets/images/noPermission.png') no-repeat;
        background-size: 100% 100%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        height: 450px;

        .text {
            font-weight: 500;
            color: #999999;
            margin-bottom: 10px;
            user-select: none;
            text-align: center;
            font-size: 18px;

            .apply_btn {}
        }

        .bullshit__info {
            margin-top: 20px;
            text-align: left;
            font-size: 14px;

            .left {
                width: 120px;
            }
        }

    }
}
</style>
  