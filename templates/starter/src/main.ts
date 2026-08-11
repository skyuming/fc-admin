import "core-js";
import "regenerator-runtime/runtime";

import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router';
import { setupStore } from '@/store';

import { setupDirective } from '@/directive';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@/permission';

// 本地SVG图标
import 'virtual:svg-icons-register';

// 启用 Mock 数据(开发 / 测试时用,生产环境务必 VITE_USE_MOCK=false)
if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('@/mock').then(({ setupMock }) => setupMock());
}

// 国际化
import i18n from '@/lang/index';

// 样式
import 'element-plus/theme-chalk/dark/css-vars.css';
import '@/styles/index.scss';
import 'uno.css';
import '@/assets/iconfonts/iconfont.css'

// import '@/styles/zzdStyle.scss'

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
// 全局注册 自定义指令(directive)
setupDirective(app);
// 全局注册 状态管理(store)
setupStore(app);
app.use(router).use(i18n).mount('#app');
