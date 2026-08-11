<!-- 数据导入模板管理(超管) -->
<template>
    <div class="app-container">
        <div class="search">
            <el-form ref="queryFormRef" :model="queryParams" :inline="true">
                <el-form-item prop="scope">
                    <el-select v-model="queryParams.scope" placeholder="模板范围" filterable clearable>
                        <el-option v-for="item in templateScopeList" :key="item.key" :label="item.name" :value="item.key" />
                    </el-select>
                </el-form-item>
                <el-form-item prop="isnew">
                    <el-select v-model="queryParams.isnew" placeholder="版本" filterable clearable>
                        <el-option label="最新版本" :value="1" />
                        <el-option label="全部版本" :value="0" />
                    </el-select>
                </el-form-item>
                <el-form-item prop="name">
                    <el-input v-model="queryParams.name" placeholder="名称" @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleQuery"><i-ep-search />搜索</el-button>
                    <el-button @click="resetQuery"><i-ep-refresh />重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-card shadow="never">
            <template #header>
                <el-button type="success" @click="openDialog()" v-hasPerm="['sys:user:EnumOperate']"><i-ep-plus />添加</el-button>
                <!-- 没有删除 -->
                <!-- <el-button type="danger"
                    :disabled="ids.length === 0"
                    @click="handleDelete()"
                    v-hasPerm="['sys:user:EnumOperate']"
                ><i-ep-delete />删除</el-button> -->
            </template>
            <el-table ref="dataTableRef" v-loading="loading" :data="dataList" @selection-change="handleSelectionChange"
                highlight-current-row border>
                <!-- <el-table-column type="selection" width="55" align="center" /> -->
                <el-table-column label="模板范围" prop="scope_name" width="180" align="center" />
                <el-table-column label="KEY值" prop="key" align="center" />
                <el-table-column label="名称" prop="name" align="center" />
                <el-table-column label="FTP路径" prop="file_ftp_url" align="center" />
                <el-table-column label="备注" prop="remark" align="center" />
                <el-table-column label="添加时间" prop="add_time" align="center" />
                <el-table-column fixed="right" label="操作" width="120" align="center" v-hasPerm="['sys:user:EnumOperate']">
                    <template #default="scope">
                        <el-button type="primary" size="small" link @click="openDialog(scope.row.id)">
                            <i-ep-edit />编辑
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <pagination v-model:total="total" v-model:page="queryParams.index" v-model:limit="queryParams.size" @pagination="handleQuery" />
        </el-card>
        <!-- 添加/编辑弹窗 -->
        <el-dialog
            :title="dialog.title"
            v-model="dialog.visible"
            width="800px"
            append-to-body
            @close="closeDialog"
            >
            <el-form
                ref="FormRef"
                :model="formData"
                :rules="rules"
                label-width="120px"
            >
                <el-form-item label="模板范围" prop="scope">
                    <el-select v-model="formData.scope" placeholder="请选择" filterable>
                        <el-option v-for="(item,eind) in templateScopeList" :key="eind" :label="item.name" :value="item.key" />
                    </el-select>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="KEY值" prop="key">
                    <el-select v-model="formData.key" placeholder="请选择" filterable>
                        <el-option v-for="(kitem,keind) in importTemplateKeyList" :key="keind" :label="kitem.name" :value="kitem.key" />
                    </el-select>
                </el-form-item>
                <el-form-item label="上传模板" prop="file_ftp_url" v-if="operatetype!=2">
                    <el-upload ref="upload" class="upload-demo" :action="uploadUrl" :limit="1" :on-exceed="handleExceed"
                        :before-upload="handleChangeFile" :headers="upLoadHeaders"
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        :on-success="handleSuccess" :on-remove="handleRemove">
                        <template #trigger>
                            <el-button type="primary">选择文件</el-button>
                        </template>
                    </el-upload>
                </el-form-item>
                <el-form-item label="上传模板" v-else>
                    <el-link :href="formData.file_ftp_url">
                        <el-text type="primary">{{ formData.file_ftp_url }}</el-text>
                    </el-link>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input type="textarea" :rows="3" resize="none" v-model="formData.remark" placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                <el-button type="primary" @click="handleSubmit" :loading="loadingBtn">确 定</el-button>
                <el-button @click="closeDialog">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script lang="ts">
    export default {
        name: "/TemplateManagement"
    };
</script>
<script setup lang="ts">
import { getImportTemplate, getImportTemplateForm, addImportTemplate, updateImportTemplate, deleteImportTemplate } from '@/api/sysconfig';
import useEnumList from "@/utils/hooks"

const queryFormRef = ref(ElForm); // 查询表单
const FormRef = ref(ElForm); // 表单

const loading = ref(false);
const loadingBtn = ref(false); // 防止按钮重复点击
const dialog = reactive<DialogOption>({
    title: '',
    visible: false
});

const ids = ref([]); // 选择列
const total = ref(0)  // 列表页数
const dataList = ref() // 列表
const operatetype = ref() // 操作类型 2.编辑
const templateScopeList = useEnumList("导入模板范围")
const importTemplateKeyList = useEnumList("导入模板唯一键")
const uploadUrl = `${import.meta.env.VITE_APP_BASE_API}/auth/api/manager/file/singleupload`
const upLoadHeaders = {
    Authorization: localStorage.getItem('accessToken')
}
const upload = ref()
const handleExceed = (files:any, uploadFiles:any) => {
    ElMessageBox.confirm('重复上传会覆盖之前的材料，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        console.log(files)
        console.log(uploadFiles)
        upload.value.clearFiles()
        const file = files[0]
        upload.value.handleStart(file)
        upload.value.submit()
    })
}
const handleChangeFile = (file:any, fileList:any) => {
    if (!file) return
    if (!/\.(xlsx|xls|XLSX|XLS)$/.test(file.name)) {
        ElMessage.warning("上传Excel只能为xlsx、xls格式");
        return false;
    }
}
const handleSuccess = (res:any, file:any, fileList:any) => {
    formData.file_ftp_url = res
}
const handleRemove = () => {
    formData.file_ftp_url = ''
}

const queryParams = reactive<any>({
    index: 1,
    size: 20
});
const formData = reactive<any>({
    name: '',
    key: '',
    scope: '',
    file_ftp_url: '',
    remark: ''
});
const rules = reactive({
    scope: [{ required: true, message: '请选择模板范围', trigger: 'blur' }],
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
    key: [{ required: true, message: '请选择KEY值', trigger: 'blur' }]
});

/**
 * 查询
 */
 function handleQuery() {
  loading.value = true;
  getImportTemplate(queryParams)
    .then(({ data }) => {
        dataList.value = data.list;
        total.value = data.total
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 查询重置
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.index = 1;
  handleQuery();
}

/**
 * 行checkbox change事件
 */
 function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/**
 * 打开弹窗
 *
 * @param typeId ID
 */
 async function openDialog(typeId?: number) {
  dialog.visible = true;
  dialog.title = (typeId?'编辑':'添加') + '数据导入模板'
  operatetype.value = typeId?2:1
  if (typeId) {
    getImportTemplateForm(typeId).then(({ data }) => {
      Object.assign(formData, data);
      formData.scope = Number(formData.scope)
    });
  }
}

/**
 * 关闭用户弹窗
 */
function closeDialog() {
  dialog.visible = false;
  if(operatetype.value!=2) {
    upload.value.clearFiles()
  }
  loadingBtn.value = false;
  resetForm();
}

/**
 * 重置表单
 */
function resetForm() {
  FormRef.value.resetFields();
  FormRef.value.clearValidate();

  formData.id = undefined;
}
/**
 * 表单提交
 */
function handleSubmit() {
    FormRef.value.validate((valid: any) => {
        if (valid) {
        const typeId = formData.id;
        let params = {
            ...formData
        }
        params.scope = String(params.scope)
        loadingBtn.value = true;
        if (typeId) {
            updateImportTemplate(params)
            .then(() => {
                ElMessage.success('修改成功');
                closeDialog();
                handleQuery();
            })
            .finally(() => (loadingBtn.value = false));
        } else {
            addImportTemplate(params)
            .then(() => {
                ElMessage.success('添加成功');
                closeDialog();
                resetQuery();
            })
            .finally(() => (loadingBtn.value = false));
        }
        }
    });
}
/**
 * 删除
 */
 function handleDelete(id?: number) {
  const typeIds = [id || ids.value].join(',');
  if (!typeIds) {
    ElMessage.warning('请勾选删除项');
    return;
  }

  ElMessageBox.confirm('确认删除?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '加载中...'
            deleteImportTemplate(typeIds).then(() => {
              ElMessage.success('删除成功');
              done();
              handleQuery();
            }).catch(() => {
              instance.confirmButtonLoading = false
              instance.confirmButtonText = '确定'
            })
        }else{
          done()
        }
    }
  });
}
onMounted(() => {
    handleQuery();
});
</script>
<style lang="scss" scoped>
:deep(.el-select) {
    width: 100%;
}
</style>