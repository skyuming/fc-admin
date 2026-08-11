import axios from 'axios';
const loadXinchuangScript = (userStore) => {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    if (!userStore.isZzd) {
        script.src = 'https://mdxc.hzszxc.hzswb.cn:8443/js/login-details.js';
    } else {
        script.src = 'https://mdxcv2.hzszxc.hzswb.cn:8443/js/login-details.js';

    }
    // 建设单位信息
    var unit = {
        unitId: "",
        name: ""
    }
    if (import.meta.env.VITE_APP_BASE_API.includes('yhya')) { 
        unit = {
            unitId: "4604", //单位id
            appName: "杭州市拱墅区拱宸桥街道运河沿岸未来社区数字化系统" //应用名称
        }
    } else if (import.meta.env.VITE_APP_BASE_API.includes('chjd')) {
        unit = {
            unitId: "4682", //单位id
            appName: "杭州市滨江区长河未来社区系统" //应用名称
        }
    }

    head.appendChild(script);
    script.addEventListener('load', function (e) {
        console.log('信创服务加载完成', e);
        signData(userStore.thisInfo.name, userStore.thisInfo.telephone || "", "", unit.unitId, userStore.thisInfo.role.rolename, unit.appName)
        // axios.get('https://hzszxc.hzswb.cn:8443/mh-gateway/system/sys_unit_mh/managUnitTree').then((res) => {
        //     console.log(res);
        //     res.data.data.forEach(item => {
        //         if (item.unitName.indexOf('拱墅区数据资源管理局') != -1) {
        //             console.log(item);
        //         }
        //         if (item.unitName.indexOf('长河街道办事处') != -1) {
        //             console.log(item);
        //         }
        //     });
        // })

    }, false);

}


export default loadXinchuangScript