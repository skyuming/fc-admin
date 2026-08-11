import { useRoute } from 'vue-router';
import { useUserStore } from "@/store/modules/user";

// baseAplus 函数需要在每一个页面去调用这个方法， route 是当前页面的路由， userInfo是当前账号的用户信息
const baseAplus = (route, userInfo) => {
    if (useUserStore().isZzd) {
        route == undefined ? route = useRoute() : ""
        userInfo == undefined ? userInfo = useUserStore().zzdUserInfo : ""
        console.log(route, userInfo);
        // 流量分析代码(A+)
        // 单页应用 或 “单个页面”需异步补充PV日志参数还需进行如下埋点：
        aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['aplus-waiting', 'MAN']
        })

        // 单页应用路由切换后 或 在异步获取到pv日志所需的参数后再执行sendPV：
        aplus_queue.push({
            'action': 'aplus.sendPV',
            'arguments': [
                { is_auto: false },
                {
                    // 当前你的应用信息，此两行请勿修改
                    sapp_id: useUserStore().zzdAppInfo.sapp_id, // 应用标识
                    sapp_name: useUserStore().zzdAppInfo.sapp_name,
                    page_id: String(route.meta.id),
                    page_name: route.meta.title,
                    page_url: route.path
                }
            ]
        })
        // 如采集用户信息是异步行为需要先执行这个BLOCK埋点
        aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['_hold', 'BLOCK']
        })

        // // 用户信息埋点
        // 设置会员昵称
        aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['_user_nick', userInfo.lastname]
        })

        // 设置会员ID
        aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['_user_id', userInfo.accountid]
        })

        // // 设备ID是业务定义的，用于定义唯一的设备标识。这个目前没有要求，可不设置。
        // aplus_queue.push({
        //   action: "aplus.setMetaInfo",
        //   arguments: ["_dev_id", "yourDeviceId"]
        // });

        // 如采集用户信息是异步行为，需要先设置完用户信息后再执行这个START埋点
        // 此时被block住的日志会携带上用户信息逐条发出
        aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['_hold', 'START']
        })
    }

}


export default baseAplus