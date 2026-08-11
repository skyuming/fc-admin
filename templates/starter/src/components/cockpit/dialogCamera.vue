<template>
  <!-- 商家详情-弹窗 -->
  <div>
    <dialogBox :title="dialogName" :width="cameraDetails.list && cameraDetails.list.length ? '850px' : '500px'"
      :dialogVisible="dialogCameraShow" @close="closeDialog">
      <template v-slot:container>
        <div class="box flex-align">
          <div id="cameraEl" class="video"></div>
          <div class="right" v-if="cameraDetails.list && cameraDetails.list.length">
            <div>当前拥挤度</div>
            <div id="liquid2" class="charts"></div>
            <div class="label_item flex-align">
              <div class="icon green_background"></div> 低拥挤度人数范围： {{ cameraDetails.list[0].firstplace }}~{{
                cameraDetails.list[0].secondplace }}
            </div>
            <div class="label_item flex-align">
              <div class="icon yellow_background"></div> 中拥挤度人数范围：{{ cameraDetails.list[1].firstplace }}~{{
                cameraDetails.list[1].secondplace }}
            </div>
            <div class="label_item flex-align">
              <div class="icon red_background"></div> 高拥挤度人数范围：{{ cameraDetails.list[2].firstplace }}~{{
                cameraDetails.list[2].secondplace }}
            </div>
          </div>
        </div>
      </template>
    </dialogBox>
  </div>
</template>

<script setup>
import dialogBox from "./dialogBox.vue"
import * as echarts from 'echarts';
import 'echarts-liquidfill'
import { playCamera } from "@/api/gongchenqiao/cockpit/index.ts"

const emits = defineEmits(['update:dialogVisiblea'])

const props = defineProps({
  dialogName: {
    type: String,
    default() {
      return "";
    },
  },
  width: {
    type: String,
    default() {
      return "600px";
    },
  },
  chargingPileInfo: {
    type: Object,
    default() {
      return null;
    },
  },
  dialogCameraShow: {
    type: Boolean
  },
  cameraId: {
    type: Number
  },

})
const cameraEl = ref()
const cameraDetails = reactive({})
const colorList = ref([
  new echarts.graphic.RadialGradient(0.6, 0, 1, [
    { offset: 0, color: "#00FB9D" },
    { offset: 1, color: "#00C09E" },
  ]),
  new echarts.graphic.RadialGradient(0.6, 0, 1, [
    { offset: 0, color: "#EFF181" },
    { offset: 1, color: "#FFA739" },
  ]),
  new echarts.graphic.RadialGradient(0.6, 0, 1, [
    { offset: 0, color: "#FF6066" },
    { offset: 1, color: "#8F0003" },
  ])
])

onMounted(() => {
  playCameraFunc()
})
/**查看监控*/
const playCameraFunc = () => {
  playCamera(props.cameraId).then((res) => {
    Object.assign(cameraDetails, res.data)
    cameraEl.value = new WebMediaPlayer(
      res.data.flv_url,
      "cameraEl",
      () => { },
      {}
    );
    cameraEl.value.play(res.data.flv_url, 1, 0);
    nextTick(() => {

      const gridLiquid = echarts.init(document.getElementById('liquid2'));
      let rate = (res.data.place / res.data.list[2].secondplace).toFixed(2)
      GetGridLiquidFillOption(res.data.place, rate, colorList.value[res.data.currentcrowdrange - 1], gridLiquid)
    })
  })
}

// 配置水球图
const GetGridLiquidFillOption = (currentRate, num, the_color, chart) => {
  chart.setOption({
    title: {
      text: currentRate,
      textStyle: {
        fontSize: 24,
        color: "#fff",
      },
      textAlign: "center",
      left: "46%",
      top: "38%",
      zlevel: 0,
    },
    series: [
      {
        type: "liquidFill",
        radius: "100%",
        center: ["50%", "50%"],
        data: [num, num, num], // data个数代表波浪数
        backgroundStyle: {
          borderWidth: 1,
          color: the_color,
          opacity: 0.5,

        },
        label: { show: false },
        outline: { show: false },
        color: [the_color, the_color, the_color],
      },
    ],
  });
}
const closeDialog = () => {
  emits('update:dialogCameraShow', false)
}

</script>

<style lang="scss" scoped>
.box {
  padding: 16px;
}


.video {
  padding-top: 0 !important;
  width: 500px !important;
  height: 300px !important;
  background-color: #000;
}

.right {
  flex: 1;
  text-align: center;
  margin-left: 23px;
  color: #fff;
  font-size: 14px;

  .charts {
    width: 120px;
    height: 120px;
    margin: 10px auto 0;
    border-radius: 50%;
    // background-color: #11B4FF;
  }

  .label_item {
    margin-top: 15px;
    margin-left: 45px;
  }

  .icon {
    margin-right: 8px;
    width: 12px;
    height: 6px;
    border-radius: 3px;
  }

  .green_background {

    background: linear-gradient(90deg, #00FB9D, #00C09E);
  }

  .yellow_background {
    background: linear-gradient(90deg, #FFA739, #EFF181);
  }

  .red_background {

    background: linear-gradient(90deg, #8F0003, #FF6066);
  }
}</style>
