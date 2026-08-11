<template>
  <div>

    <!-- 上传组件 -->
    <el-upload
      class="single-uploader"
      v-model="imgUrl"
      :show-file-list="false"
      list-type="picture-card"
      :before-upload="handleBeforeUpload"
      :http-request="uploadFile"
    >
    <div v-if="imgUrl" class="single-box">
      <img :src="imgUrl" class="single" />
      <div class="single-close" @click.stop="deleteImg">
        <el-icon size="20"><DeleteFilled /></el-icon>
      </div>
    </div>
      <el-icon v-else class="single-uploader-icon"><i-ep-plus /></el-icon>
    </el-upload>
    <span class="tips">只能上传jpg;jpeg;png文件{{ textInfo }}</span>
  </div>
</template>

<script setup lang="ts">
import { UploadRawFile, UploadRequestOptions } from "element-plus";
import { uploadFileApi } from "@/api/file";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  modelType: {
    type: String,
    default: "image/jpeg&image/png&image/gif",
  },
  textInfo: {
    type: String,
    default: ''
  },
});

const emit = defineEmits(["update:modelValue"]);
const imgUrl = useVModel(props, "modelValue", emit);

/**
 * 自定义图片上传
 *
 * @param options
 */
async function uploadFile(options: UploadRequestOptions): Promise<any> {
  const { data: fileInfo } = await uploadFileApi(options.file);
  imgUrl.value = fileInfo;
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (props.modelType.indexOf(file.type) === -1 || file.type=='') {
    ElMessage.error('只能上传图片格式!')
    return false
  } else if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('上传图片不能大于2M!')
    return false
  }
  return true;
}
function deleteImg() {
  imgUrl.value = "";
}
</script>

<style scoped>
.single-box{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}
.single-close{
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
}
.single-uploader .single {
  display: block;
  width: 178px;
}
</style>

<style>
.single-uploader .el-upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  transition: var(--el-transition-duration-fast);
}

.single-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.single-uploader-icon {
  width: 178px;
  height: 178px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}
</style>
