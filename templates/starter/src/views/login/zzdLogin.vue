<template>
    <div class="contentBox">
        <div v-loading.fullscreen.lock="fullscreenLoading"></div>
        <div v-if="!fullscreenLoading && info" class="content">
            <div class="text">
                <div> {{ info.message }}</div>
                <el-button v-if="info.code == 401" type="text" class="apply_btn" @click="dialog.visible = true"> 前往申请
                </el-button>
                <div class="bullshit__info" v-if="userStore.zzdContacts">
                    <div class="flex">
                        <div class="left">应用归属单位：</div>{{ userStore.zzdContacts.unit }}
                    </div>
                    <div class="flex">
                        <div class="left">应用管理员：</div>{{ userStore.zzdContacts.name }}
                    </div>
                    <div class="flex">
                        <div class="left">联系方式：</div>{{ userStore.zzdContacts.phone }}
                    </div>
                </div>
            </div>
        </div>
        <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" top="30vh" append-to-body
            @close="closeDialog">
            <el-form ref="FormRef" :model="info.data" label-width="100px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="账号">
                            {{ info.data.account }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="用户名">
                            {{ info.data.nicknamecn }}
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="handleSubmit">申 请</el-button>
                    <el-button @click="closeDialog">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import router from "@/router";
import { zzdH5NoPassLogin, zzdApplyAccount } from "@/api/user"
import { ElLoading } from 'element-plus'
// 状态管理依赖
import { useUserStore } from "@/store/modules/user";
// API依赖
import dd from "gdt-jsapi"
import { usePermissionStoreHook } from "@/store/modules/permission";
import hmacsha from "@/utils/hmacsha512";
import { ElMessageBox, ElMessage } from 'element-plus'

const userStore = useUserStore();
const permissionStore = usePermissionStoreHook();
const fullscreenLoading = ref(true)

const info = ref()

const dialog = reactive({
    title: "申请账号",
    visible: false
})

onMounted(() => {
    dd.ready(() => {
        let ua = navigator.userAgent.toLowerCase();
        if (ua.match(/TaurusApp/i)) {
            // 在浙政钉环境中
            console.log("在浙政钉环境中");
                dd.getAuthCode({}).then((result: any) => {
                    if (result) {
                        let zzdCode = result.auth_code
                        zzdLogin(zzdCode)
                    }
                }).catch(err => {
                    fullscreenLoading.value = false
                    info.value = { message: err }
                })
            // }
        } else {
            // 不在浙政钉环境中
            console.log("不在浙政钉环境中");
            fullscreenLoading.value = false
            info.value = { message: '当前非浙政钉环境中，请在浙政钉环境中打开' }
        }
    })


});
const zzdLogin = async (zzdCode: any) => {
    zzdH5NoPassLogin(zzdCode).then(async (res: any) => {
        if (res.data.code == 401 || res.data.code == 400) {
            info.value = res.data
            fullscreenLoading.value = false
        } else if (res.data.code === 200) {
            let access_token = res.data.data.tokeninfo.access_token
            userStore.setNoPassToken(access_token);
            const { roles } = await userStore.getInfo();
            const accessRoutes = await permissionStore.generateRoutes(roles);
            userStore.setUserList(accessRoutes)
            userStore.setZzdUserInfo(res.data.data.zzduser)
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
            router.push({ path: "/", replace: true });
        }
    }).catch(() => {
        fullscreenLoading.value = false
    })


}
const handleSubmit = () => {
    let BasicAuthorization = hmacsha.GetTrendsSwkjBasicStr("/api/manager/zzd/applyforauth?timestamp=");
    localStorage.setItem("accessToken", BasicAuthorization.Authorization)
    let _data = {
        account: info.value.data.account,
        account_id: info.value.data.accountid,
        name: info.value.data.lastname,
        remarks: "申请账号"
    }
    JSON.parse(JSON.stringify(info.value.data))
    zzdApplyAccount(BasicAuthorization.time, _data).then((res) => {
        ElMessage({
            message: '申请成功！',
            type: 'success',
        });
        closeDialog()
        dd.getAuthCode({}).then((result: any) => {
            if (result) {
                let zzdCode = result.auth_code
                zzdLogin(zzdCode)
            }
        })
    })
}
const closeDialog = () => {
    dialog.visible = false
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
  