import vue from "@vitejs/plugin-vue";

import { UserConfig, ConfigEnv, loadEnv, defineConfig } from "vite";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

import UnoCSS from "unocss/vite";
import legacy from '@vitejs/plugin-legacy'
import path from "path";

const pathSrc = path.resolve(__dirname, "src");

function normalizeEnvBoolean(value: string | undefined) {
  const normalized = value?.trim().replace(/^['"]|['"]$/g, "").toLowerCase();
  if (normalized === "1" || normalized === "true") {
    return true;
  }
  if (normalized === "0" || normalized === "false") {
    return false;
  }
  return null;
}

function parseSpecialPageEnv(value: string | undefined, mode: string) {
  const directResult = normalizeEnvBoolean(value);
  if (directResult !== null) {
    console.info(`[VITE_ENABLE_SPECIAL_PAGE] resolved from .env.${mode}: ${directResult ? "1" : "0"}`);
    return directResult;
  }

  if (value?.includes("#{")) {
    throw new Error(
      `[VITE_ENABLE_SPECIAL_PAGE] placeholder detected during ${mode} build: ${value}. ` +
      "Please edit .env.production manually and set it to 0 or 1 before build."
    );
  }

  if (value === undefined || value.trim() === "") {
    throw new Error(
      `[VITE_ENABLE_SPECIAL_PAGE] empty value in .env.${mode}. Please set it to 0 or 1 before build.`
    );
  }

  throw new Error(
    `[VITE_ENABLE_SPECIAL_PAGE] invalid value: ${value}. Only 0/1/true/false are supported.`
  );
}

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");
  const enableSpecialPage = parseSpecialPageEnv(env.VITE_ENABLE_SPECIAL_PAGE, mode);
  return {
    base: "./",
    resolve: {
      alias: {
        "@": pathSrc,
        // 特殊页面的构建开关：开启时走 enabled，关闭时走 disabled
        "@special-routes": path.resolve(
          pathSrc,
          enableSpecialPage ? "router/specialRoutes.enabled.ts" : "router/specialRoutes.disabled.ts"
        ),
        // 动态菜单页面扫描也要同步切换，否则被禁用页面仍可能被 import.meta.glob 打包进去
        "@view-modules": path.resolve(
          pathSrc,
          enableSpecialPage ? "store/modules/viewModules.enabled.ts" : "store/modules/viewModules.disabled.ts"
        ),
      },
    },
    css: {
      // CSS 预处理器
      preprocessorOptions: {
        //define global scss variable
        scss: {
          javascriptEnabled: true,
          additionalData: `
            @use "@/styles/variables.scss" as *;
          `,
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_APP_PORT),
      open: true, // 运行是否自动打开浏览器
      // 反向代理解决跨域,
      hmr: true,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          // 线上接口API地址
          // target: "http://vapi.youlai.tech",
          // 本地接口API地址
          // target: 'http://localhost:8989',
          target: 'https://allzone.zuma580.com',
          // target: 'https://yhya.gongshu.gov.cn',
          changeOrigin: true,
          rewrite: (path) =>
            // localhost:3000/dev-api/users/me → http://vapi.youlai.tech/users/me
            path.replace(new RegExp("^" + env.VITE_APP_BASE_API), ""),
        },
      },
    },
    optimizeDeps: {
      // 只扫描主应用入口，避免把 dist/ 和图标 demo html 当成依赖预构建入口
      entries: ["index.html"],
    },
    plugins: [
      vue(),
      legacy({
        targets:{"chrome":"63"},
        // modernPolyfills: ['es.global-this']
      }),
      UnoCSS({
        /* options */
      }),
      AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ["vue", "@vueuse/core"],
        eslintrc: {
          enabled: false, //  Default `false`
          filepath: "./.eslintrc-auto-import.json", // Default `./.eslintrc-auto-import.json`
          globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        },
        resolvers: [
          // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
          ElementPlusResolver(),
          // 自动导入图标组件
          IconsResolver({}),
        ],
        vueTemplate: true, // 是否在 vue 模板中自动导入
        dts: path.resolve(pathSrc, "types", "auto-imports.d.ts"), //  自动导入组件类型声明文件位置，默认根目录; false 关闭自动生成
      }),

      Components({
        resolvers: [
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ["ep"], //@iconify-json/ep 是 Element Plus 的图标库
          }),
          // 自动导入 Element Plus 组件
          ElementPlusResolver(),
        ],
        dts: path.resolve(pathSrc, "types", "components.d.ts"), //  自动导入组件类型声明文件位置，默认根目录; false 关闭自动生成
      }),

      Icons({
        // 自动安装图标库
        autoInstall: true,
      }),

      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(pathSrc, "assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]",
      }),
    ],
    build: {
      outDir:"build",
      chunkSizeWarningLimit: 1500, //上调单个模块文件超过了500k默认块儿限制
      sourcemap: false, // 是否生成 source map 文件,禁用生产环境的source map
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        format: {
          comments: false // 去除注释
        }
      }
    }
  };
});
