<template>
 <!-- 用户组件 -->
 <el-autocomplete v-model="queryParams.des" :fetch-suggestions="queryUser"  value-key="des" class="inline-input w-full"
   :placeholder="place" @select="handleSelect" @blur="usernameblur">
   <template #default="{ item }" >
     <div class="value" v-if="item.user_id!=-1" >{{ item.des }}</div>
     <div class="value" v-else style="cursor: default;" >{{ item.des }}</div>
   </template>
 </el-autocomplete>
</template>
<script lang="ts" setup>
import { getAccounthousehold } from "@/api/integral";
import { useUserStore } from "@/store/modules/user";

const props = defineProps({
  place: {
    type: String,
    default: '姓名/电话'
  }
})
let queryParams = {
 region_id: useUserStore().region_id,
 des: "",
 text:"",
 take: 20,
};
//获取用户列表
let currentuser = ref<any>();
const queryUser = (queryString: string, cb: (arg: any) => void) => {
  // 文本框内容未改变且已选中有效用户时，直接返回当前用户，避免重复请求
  if (currentuser.value && currentuser.value.user_id && queryString === currentuser.value.des) {
    cb([currentuser.value]);
    return;
  }

  if(currentuser.value !=undefined&&queryParams.des==currentuser.value.des)
  {
    queryParams.text=currentuser.value.telephone
  } else{
    queryParams.text=queryParams.des
  }
 getAccounthousehold(queryParams)
   .then((data) => {
    console.log(queryParams,"data.data")

    queryParams.text=""
     if (data.data.length > 0) {
       cb(data.data);
     } else {
      let info=[{
        account: "",
        des: "无此用户",
        name: "",
        user_id: -1
      }]
      cb(info);
       currentuser.value = {}
     }
   })
   .finally(() => { });
};
const emits = defineEmits(['refreshuser'])
const usernameblur = () => {
 if (currentuser.value?.des != queryParams.des) {
   currentuser.value = {}
   emits('refreshuser', null)
   queryParams.text = "";
   queryParams.des="" 
 } else {
   console.log(222)
   emits('refreshuser', currentuser.value)
 }
};
const handleSelect = (item: any) => {
  console.log(item,"item")
  if(item.user_id!=-1){
 currentuser.value = item;
 emits('refreshuser', currentuser.value)
}
};
onMounted(() => {

});
</script>
   
