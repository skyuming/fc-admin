<template>
  <!-- 商家列表-弹窗 -->
  <div>
    <dialogBox title="商家列表" width="1000px" :dialogVisible="dialogShowListShow" @close="closeDialog">
      <template v-slot:container>
        <div class="table-box">
          <el-table :data="data.datalist" v-loading="data.loading" tooltip-effect="dark" style="width: 100%"
            empty-text="暂无商家" :cell-style="setEquipColor">
            <el-table-column prop="shop_name" show-overflow-tooltip label="商家名称">
            </el-table-column>
            <el-table-column prop="shop_address" label="商家地址" show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="banking_hours" label="营业时间" show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="shop_contact_phone" label="联系电话" show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="handle" label="操作" show-overflow-tooltip>
              <template #default="scope">
                <div @click="getShopDetailsFunc(scope.row.id)" class="lookDetails">
                  查看详情
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="cockpit_pagination">
            <el-pagination background layout="total,prev, pager, next" :page-size="params.size"
              :current-page="params.index" :total="data.total" @current-change="shopListChange">
            </el-pagination>
          </div>
        </div>
      </template>
    </dialogBox>
    <dialogShopDetails v-if="dialogShopDetailsShow" width="1300px" dialogName="商家详情" v-model:dialogShopDetailsShow="dialogShopDetailsShow"
      :chargingPileInfo="chargingPileInfo" @close="dialogShopDetailsShow = false"></dialogShopDetails>
  </div>
</template>

<script setup>
import dialogBox from "./dialogBox.vue"
import dialogShopDetails from "./dialogShopDetails.vue"
import { getShopList, getShopDetails } from "@/api/gongchenqiao/cockpit/index.ts"
const emits = defineEmits(['update:dialogVisible'])

const props = defineProps({
  dialogShowListShow: {
    type: Boolean
  },
})

const dialogShopDetailsShow = ref(false)

const params = reactive({
  index: 1,
  size: 10
})
const data = reactive({
  loading: false,
  ids: [],
  total: 0,
  datalist: []
})
const chargingPileInfo = reactive({})
onMounted(() => {
  
})

const getShopListFunc = () => {
  data.loading = true
  getShopList(params).then((res) => {
    data.datalist = res.data.list
    data.total = res.data.total
  }).finally(() => {
    data.loading = false
  })
}
const shopListChange = (e) => {
  params.index = e
  getShopListFunc()
}
const getShopDetailsFunc = (id) => {
  getShopDetails(id).then((res) => {
    Object.assign(chargingPileInfo, res.data)
    chargingPileInfo.shoptaskinfoslist.push(chargingPileInfo.shoptaskinfoslist[0])
    chargingPileInfo.shoptaskinfoslist.push(chargingPileInfo.shoptaskinfoslist[0])
    chargingPileInfo.shoptaskinfoslist.push(chargingPileInfo.shoptaskinfoslist[0])
    chargingPileInfo.shoptaskinfoslist.push(chargingPileInfo.shoptaskinfoslist[0])
    // chargingPileInfo.customcommoditys.push(chargingPileInfo.customcommoditys[0])
    // chargingPileInfo.customcommoditys.push(chargingPileInfo.customcommoditys[0])
    // chargingPileInfo.customcommoditys.push(chargingPileInfo.customcommoditys[0])
    chargingPileInfo.customcommoditys.push(chargingPileInfo.customcommoditys[0])
    chargingPileInfo.customcommoditys.push(chargingPileInfo.customcommoditys[0])
    chargingPileInfo.customcommoditys.push(chargingPileInfo.customcommoditys[0])
    chargingPileInfo.customdiscountcoupons.push(chargingPileInfo.customdiscountcoupons[0])
    chargingPileInfo.customdiscountcoupons.push(chargingPileInfo.customdiscountcoupons[0])
    // chargingPileInfo.customdiscountcoupons.push(chargingPileInfo.customdiscountcoupons[0])
    // chargingPileInfo.customdiscountcoupons.push(chargingPileInfo.customdiscountcoupons[0])
    // chargingPileInfo.customdiscountcoupons.push(chargingPileInfo.customdiscountcoupons[0])
    chargingPileInfo.baseInfo = [
      { label: "营业时间", info: res.data.banking_hours },
      { label: "联系电话", info: res.data.shop_contact_phone },
      { label: "地址", info: res.data.shop_address },
    ],
      dialogShopDetailsShow.value = true
  })
}
const closeDialog = () => {
  emits('close')
}
defineExpose({
  getShopListFunc
})

</script>

<style lang="scss" scoped>
.lookDetails {
  cursor: pointer;
  color: #11B4FF;

}
</style>
