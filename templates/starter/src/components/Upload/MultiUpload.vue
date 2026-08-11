<!--
  多图上传组件
  @author: youlaitech
  @date 2022/11/20
-->

<template>
  <div style="display: block; width: 100% !important">
    <el-upload
      v-model:file-list="fileList"
      list-type="picture-card"
      :before-upload="handleBeforeUpload"
      :http-request="handleUpload"
      :on-remove="handleRemove"
      :on-preview="previewImg"
      :limit="props.limit"
      :on-exceed="handleExceed"
    >
      <i-ep-plus />
    </el-upload>
  </div>
  <div class="text">{{ textInfo }}</div>

  <el-dialog v-model="dialogVisible">
    <img w-full :src="previewImgUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script setup lang="ts">
import {
  UploadRawFile,
  UploadRequestOptions,
  UploadUserFile,
  UploadFile,
  UploadProps
} from 'element-plus';
import { uploadFileApi, deleteFileApi } from '@/api/file';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  /**
   * 文件路径集合
   */
  modelValue: {
    type: Array<string>,
    default: [] as Array<string>
  },
  /**
   * 文件上传数量限制
   */
  limit: {
    type: Number,
    default: 5
  },
  textInfo: {
    type: String,
    default: ''
  },
  modelType: {
    type: String,
    default: "image/jpeg&image/png&image/gif",
  },
});

const previewImgUrl = ref('');
const dialogVisible = ref(false);

const fileList = ref([] as UploadUserFile[]);
watch(
  () => props.modelValue,
  (newVal: string[]) => {
    const filePaths = fileList.value.map(file => file.url);
    // 监听modelValue文件集合值未变化时，跳过赋值
    if (
      filePaths.length > 0 &&
      filePaths.length === newVal.length &&
      filePaths.every(x => newVal.some(y => y === x)) &&
      newVal.every(y => filePaths.some(x => x === y))
    ) {
      return;
    }

    fileList.value = newVal.map(filePath => {
      return { url: filePath } as UploadUserFile;
    });
  },
  { immediate: true }
);

/**
 * 自定义图片上传
 *
 * @param params
 */
async function handleUpload(options: UploadRequestOptions): Promise<any> {
  // 上传API调用
  const { data: fileInfo } = await uploadFileApi(options.file);
   console.log(fileList)
  // 上传成功需手动替换文件路径为远程URL，否则图片地址为预览地址 blob:http://
  const fileIndex = fileList.value.findIndex(
    file => file.uid == (options.file as any).uid
  );
  console.log(fileIndex,"fileIndex")
  console.log(fileInfo,"fileInfo")
  fileList.value.splice(fileIndex, 1, {
    name: '',
    url: fileInfo
  } as UploadUserFile);
  console.log(fileList,"fileListfileList")
  emit(
    'update:modelValue',
    fileList.value.map(file => file.url)
  );
}

/**
 * 删除图片
 */
function handleRemove(removeFile: UploadFile) {
  const filePath = removeFile.url;
   console.log(filePath,"filePathfilePath")
  if (filePath) {
    // deleteFileApi(filePath).then(() => {  目前接口没有删除图片的接口
      // 删除成功回调
      emit(
        'update:modelValue',
        fileList.value.map(file => file.url)
      );
    // });
  }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (props.modelType.indexOf(file.type) === -1 || file.type=='') {
    ElMessage.error('只能上传图片格式!')
    return false
  }else if (file.size > 2 * 1048 * 1048) {
    ElMessage.warning('上传图片不能大于2M');
    return false;
  }
  return true;
}

/**
 * 预览图片
 */
const previewImg: UploadProps['onPreview'] = uploadFile => {
  previewImgUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};

/**
 * 超出限制数量时的行为
 */
const handleExceed: UploadProps['onExceed'] = (files, uploadFile) => {
  ElMessage.warning("文件已上传至最大数量")
};
</script>
