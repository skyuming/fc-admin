<script lang="ts">
export default {
  name: 'region'
};
</script>

<script setup lang="ts">
import {
  getRegionTree,
  getRegionForm,
  addRegion,
  updateRegion
} from '@/api/region';
import { RegionTreeQuery, RegionForm } from '@/api/region/types';

const regionRef = ref(ElForm);

const loading = ref(false);
const loadingBtn = ref(false); // 防止按钮重复点击
const treeList = ref([]);

const defaultProps = {
  children: 'child',
  label: 'name',
  id: 'id',
  icon: 'icon'
}

const queryParams = reactive<RegionTreeQuery>({
  maxlevel: 5,
  minlevel: 0
});

const formData = reactive<RegionForm>({
  name: '',
  code: '',
  longitude: 0,
  latitude: 0,
  state:0,
  level: 0,
});

const rules = reactive({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '区划代码不能为空', trigger: 'blur' }],
  longitude: [{ required: true, message: '请选择位置', trigger: 'blur' }],
  latitude: [{ required: true, message: '请选择位置', trigger: 'blur' }],
});

const clickMapPosition = ref({  // 点击地图获取的经纬度
    lng: '',
    lat: ''
})
const dialogFormVisible = ref(false)
const savePosition = (e:any) => {
    formData.longitude = e.lng
    formData.latitude = e.lat
}

/**
 * 查询
 */
 function handleQuery() {
  loading.value = true;
  getRegionTree(queryParams)
    .then(({ data }) => {
      treeList.value = data;
    })
    .finally(() => {
      loading.value = false;
    });
}

const type = ref()  // 1添加2编辑
const changeRegionName = ref() // 编辑的区域名称
function append(data:any) { // 添加子集
  resetForm()
  console.log(data)
  formData.parent_id = data.id
  formData.level = data.level + 1
  type.value = 1
  changeRegionName.value = data.name
}
function edit(node:any,data:any) {  // 编辑
  // console.log(node)
  // console.log(data)
  type.value = 2
  changeRegionName.value = data.name
  if(formData.id && formData.id==data.id) { // 防止重复请求接口
    return
  } else {
    getRegionForm(data.id).then(({ data }) => {
        Object.assign(formData, data);
    })
  }
}
/**
 * 重置表单
 */
 function resetForm() {
  formData.id = undefined;
  formData.name = '';
  formData.parent_id = undefined;
  formData.code = '';
  formData.longitude = 0;
  formData.latitude = 0;
  formData.state = 0;
  formData.level = 0;
}
/**
 * 重置查询
 */
 function resetQuery() {
  regionRef.value.resetFields();
  formData.state = 0;
  handleQuery();
}
/**
 * 表单提交
 */
 function handleSubmit() {
  regionRef.value.validate((valid: any) => {
    if (valid) {
      const regionId = formData.id;
      loadingBtn.value = true;
      console.log('提交表单', formData)
      if (regionId) {
        updateRegion(formData)
          .then(() => {
            ElMessage.success('修改成功');
            resetQuery();
          })
          .finally(() => (loadingBtn.value = false));
      } else {
        addRegion(formData)
          .then(() => {
            ElMessage.success('添加成功');
            resetQuery();
          })
          .finally(() => (loadingBtn.value = false));
      }
    }
  });
}

onMounted(() => {
  handleQuery(); // 初始化用户列表数据
});
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 区域树 -->
      <el-col :lg="10" :xs="24">
        <el-card shadow="never" style="border:none">
          <div class="left-box">
            <el-tree 
                empty-text="无数据"
                :data="treeList"
                :props="defaultProps"
                node-key="id"
                :expand-on-click-node="false"
                default-expand-all
            >
                <template #default="{ node, data }">
                  <span class="custom-tree-node">
                    <span class="ml-2">{{ node.label }}</span>
                    <span style="margin-left: 20px;">
                      <template v-if="node.level < 6">
                        <el-button link type="primary" @click="append(data)">
                          <span style="margin-right: 3px;"><i-ep-plus /></span>添加子集
                        </el-button>
                      </template>
                      <el-button link type="primary" @click="edit(node,data)">
                        <span style="margin-right: 3px;"><i-ep-edit /></span>编辑
                      </el-button>
                    </span>
                  </span>
                </template>
            </el-tree>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="14" :xs="24">
        <el-card shadow="never" style="border:none; height: 100%">
          <template #header>
            {{type==1?'【'+changeRegionName+'】添加子集':type==2?'编辑'+'【'+changeRegionName+'】':'添加区域'}}
          </template>
          <div style=" margin: 30px 50px 0 0; height: 100%;">
            <el-form ref="regionRef" :model="formData" :rules="rules" label-width="160px">
              <el-form-item label="名称:" prop="name">
                <el-input size="large" v-model.trim="formData.name" placeholder="请输入名称"/>
              </el-form-item>
              <el-form-item label="区域代码:" prop="code">
                <el-input size="large" v-model.trim="formData.code" placeholder="请输入区域代码"/>
              </el-form-item>
              <el-form-item label="经度:" prop="longitude">
                <el-input size="large" v-model.trim="formData.longitude" placeholder="请输入经度"/>
              </el-form-item>
              <el-form-item label="纬度:" prop="latitude">
                <el-input size="large" v-model.trim="formData.latitude" placeholder="请输入纬度"/>
              </el-form-item>
              <el-form-item label="在地图上的位置:">
                <el-button  type="primary"  @click="dialogFormVisible = true">点击选择</el-button>
              </el-form-item>
              <el-form-item label="是否禁用:" v-if="formData.level==4">
                <el-checkbox :true-label="1" :false-label="0" v-model="formData.state"></el-checkbox>
              </el-form-item>
            </el-form>
            <div class="flex-center" style="margin:50px auto;width: 100%;height:42px">
                <el-button type="primary" size="large" @click="handleSubmit" :loading="loadingBtn">提交</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 选择经纬度弹窗 -->
    <choosePosition v-model:show="dialogFormVisible" @savePosition="savePosition" :defaultPosition="clickMapPosition" />
 </div>
</template>

<style lang="scss" scoped>
  :deep(.el-tree-node, .el-tree-node__content) {
    margin: 5px 0 !important;
  }
  .left-box {
    margin-right: -20px; height: calc(100vh - 150px); overflow-y: auto;
    .el-button { font-size: 12px !important; width: auto; font-weight: normal; }
  }
  .maoBox{
    height: 350px;
    width: 100%;
    .search_box {
        position: absolute;
        width: 25%;
        top: 10px;
        left: 10px;

        .map_search {
            width: 100%;
            max-height: 200px;
            overflow: auto;
        }
    }
    .map {
      width: 100%;
      height: 100%;
    }
  }
  .jingweidu {
    display: flex; justify-content: space-between; align-items: center;
  }
  .flex-center { display: flex; justify-content: center; align-items: center;}
</style>