<template>
  <div style="border: 1px solid #ccc" v-if="dialog">
    <!-- 工具栏 -->
    <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" style="border-bottom: 1px solid #ccc" :mode="mode" />
    <!-- 编辑器 -->
    <Editor :defaultConfig="editorConfig" v-model="defaultHtml" @onChange="handleChange"
      :style="{ height: height, 'overflow-y': 'auto' }" :mode="mode" @onCreated="handleCreated" />
  </div>
</template>

<script setup lang="ts">
import xss from 'xss'
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

// API 引用
import { uploadFileApi } from "@/api/file";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  dialog: {
    type: Boolean
  },
  height: {
    type: String,
    default: "300px",
  },
  readonly: {
    default: false
  }
});



const emit = defineEmits(["update:modelValue"]);

const defaultHtml = useVModel(props, "modelValue", emit);

const editorRef = shallowRef(); // 编辑器实例，必须用 shallowRef
const mode = ref("default"); // 编辑器模式
const toolbarConfig = ref({}); // 工具条配置
// 编辑器配置
const editorConfig = ref({
  placeholder: "请输入内容...",
  readOnly: false,
  MENU_CONF: {
    uploadImage: {
      // 自定义图片上传
      async customUpload(file: any, insertFn: any) {
        uploadFileApi(file).then(({ data }) => {
          const url = data;
          insertFn(url);
        });
      },
    },
  },
});

// watch(() => props.readonly, (nv) => {
//   if (nv) {
//     editorConfig.value.readOnly = true
//     return
//   }
//   editorConfig.value.readOnly = false
// }, {
//   deep: true,
//   immediate: true
// })

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};

function handleChange(editor: any) {
  // console.log(editor.getHtml())
  
  const htmlStr = editor.getHtml();

  // 第一种：未配置防止xss攻击
  // emit("update:modelValue",htmlStr);

  // 第二种：配置防止xss攻击白名单(CSS样式丢失处理)
  const options: any = {
    onIgnoreTagAttr: function(tag: any, name: any, value: any, isWhiteAttr: any) {
      if (name.substr(0, 2) === 'on') {
        return '' // 过滤掉所有的事件监听器属性，例如 onclick
      }
      // 如果属性是 style，并且不在白名单内，仍然允许它通过
      if (name === 'style' || name === 'iframe') {
        return `${name}="${value}"` // 直接返回 style 属性
      }
    },
    onTag: (tag: any, html: any) => {
      if (tag === 'style') {
        // 当遇到 style 标签时，直接返回，不做处理
        return html
      }
      if (tag === 'iframe') {
        // 从 HTML 字符串中解析出 src 属性的值
        const srcMatch = html.match(/src="([^"]+)"/)
        const src = srcMatch ? srcMatch[1] : ''
        // 验证 src 是否来自可信来源
        if (src.startsWith('http://www.iot-wiki.cn')) {
          return html
        } else {
          // 如果不是可信来源，移除 iframe
          return ''
        }
      }
    },
    stripIgnoreTag: true, // 去除不在白名单上的标签
    stripIgnoreTagBody: ['script'],// 去除不在白名单上的标签及其内容
    css: false
  }
  // 防止XSS攻击，防止用户输入恶意代码（如链接地址中输入javascript：alert(1))
  const safeHtml = xss(htmlStr, options)
  emit("update:modelValue",safeHtml);
  // console.log('处理过 xss 攻击的内容：', safeHtml)
}

defineExpose({
  editorRef
})

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>
