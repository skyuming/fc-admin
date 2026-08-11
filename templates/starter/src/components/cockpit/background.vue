<template>
  <!-- 拱宸桥文旅驾驶舱背景  样式来源assets/style/cockpit.scss文件-->
  <div id="app" class="h100 cockpit-homebg">
    <!--底2-->
    <div class="bg-gradient-top"></div>
    <!-- <div class="bg-gradient-top" style="opacity: 0.55"></div> -->
    <div class="bg-gradient-left"></div>
    <!-- <div class="bg-gradient-left"></div> -->
    <!-- <div class="bg-gradient-right"></div> -->
    <div class="bg-gradient-right"></div>
    <!-- <div class="bg-gradient-bottom"></div> -->
    <!-- <div class="bg-gradient-bottom" style="opacity: 0.55"></div> -->
    <div class="bg-top"></div>

    <!--头部-->
    <div class="home-top flex-between">
      <div class="top_text-box">
        <div class="top_text" @click="aaaaa">文旅驾驶舱</div>
      </div>

      <div class="home-top-left">
        <div>{{ todaydata }} {{ todayweek }} {{ dateTime }}</div>
      </div>

      <div class="home-top-center flex-align">
        <img style="cursor: pointer" src="@/assets/images/cockpit_images/prev02.png" alt=""
          @click="pointTypeSwiper.slidePrev()">
        <swiper class="venue_list" :modules="modules" :slidesPerView="5.8" @swiper="onPointTypeSwiper">
          <swiper-slide v-for="item, index in pointTypeEnum" :key="item.key" class="venue_item"
            :class="index == pointTypeActive ? 'active' : ''" @click="pointTypeChange(item.key, index)">
            {{ item.name }}
          </swiper-slide>
        </swiper>
        <img style="cursor: pointer" src="@/assets/images/cockpit_images/next02.png" alt=""
          @click="pointTypeSwiper.slideNext()">
      </div>

      <div class="home-top-right">
      </div>
    </div>

    <!--插槽为内容显示区域-->
    <slot name="container"></slot>

    <div id="map" class="viewBim"> </div>

    <div class="point-box flex-column">
      <div v-for="(item, index) in routesTypeEnum" :key="item.id" class="point-item"
        :style="routesTypeActive !== index ? 'opacity:0.6' : ''" @click="routesTypeChange(item.key, index)">
        <img :src="routesTypePic[index]" alt="" />
        <div>{{ item.name }}</div>
      </div>
    </div>
    <dialogVenue v-if="dialogVenues" dialogName="点位详情" v-model:dialogVisiblea="dialogVenues" :chargingPileInfo="venueInfo"
      @close="dialogVenues = false"></dialogVenue>

    <dialogShopDetails v-if="dialogShopDetailsShow" width="1300px" dialogName="商家详情"
      v-model:dialogShopDetailsShow="dialogShopDetailsShow" :chargingPileInfo="shopInfo"
      @close="dialogShopDetailsShow = false"></dialogShopDetails>

    <dialogCamera v-if="dialogCameraShow" width="600px" :cameraId="cameraId" dialogName="摄像头详情"
      v-model:dialogCameraShow="dialogCameraShow" @close="dialogCameraShow = false"></dialogCamera>

  </div>
</template>

<script>
export default {
  name: "Background",
}
</script>

<script setup>
import 'swiper/swiper.min.css'
import { ref, reactive, onMounted } from "vue";
import useEnumList from "@/utils/hooks"
import dialogVenue from "./dialogVenue.vue";
import dialogShopDetails from "./dialogShopDetails.vue"
import dialogCamera from "./dialogCamera.vue"

import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { getPointList, getPointDetails, getShopDetails, getRoutesDetails, playCamera } from "@/api/gongchenqiao/cockpit/index.ts"
import MapPointIcon_img from "@/assets/images/cockpit_images/map_point-icon.png"
import cjsgzlx_img from "@/assets/images/cockpit_images/cjsgzlx_icon.png"
import shgzlx_img from "@/assets/images/cockpit_images/shgzlx_icon.png"
import lzlx_img from "@/assets/images/cockpit_images/lzlx_icon.png"
import map_bg from "@/assets/images/cockpit_images/map-bg.png"

const pointTypeEnum = useEnumList("拱宸桥点位景点分类")
const routesTypeEnum = useEnumList("拱宸桥线路类别")
const pointTypeActive = ref(0)
const modules = [A11y]
const pointTypeSwiper = ref()

const dateTime = ref("")
const todayweek = ref("")
const todaydata = ref("")
const yesterday = ref("")
const timer = ref() // 定义一个定时器的变量
const map = ref(null)
const pointList = ref([]) // 点位类型列表

const dialogVenues = ref(false) //点位详情弹窗
const dialogShopDetailsShow = ref(false) //商家详情弹窗
const dialogCameraShow = ref(false)  //摄像头弹窗
const cameraId = ref() //点击地图点位获取的摄像头id
const venueInfo = reactive({})
const shopInfo = reactive({})

const routesTypeActive = ref()
const routesTypePic = [cjsgzlx_img, shgzlx_img, lzlx_img]
const routesDetails = reactive({})

const markerList = ref([])
const polylineList = ref([])
onMounted(() => {
  timer.value = setInterval(getTime, 1000);

  initMap()
  getPointListFunc(0)
})

const getPointListFunc = (type) => {
  getPointList(type).then((res) => {
    pointList.value = res.data.allpoint
    postMarker()
  })
}

const onPointTypeSwiper = (swiper) => {
  pointTypeSwiper.value = swiper
};

const pointTypeChange = (key, index) => {
  pointTypeActive.value = index
  getPointListFunc(key)
}

const getShopDetailsFunc = (id) => {
  getShopDetails(id).then((res) => {
    Object.assign(shopInfo, res.data)
    shopInfo.baseInfo = [
      { label: "营业时间", info: res.data.banking_hours },
      { label: "联系电话", info: res.data.shop_contact_phone },
      { label: "地址", info: res.data.shop_address },
    ]
    dialogShopDetailsShow.value = true
  })
}

const postMarker = () => {
  markerList.value.forEach(item => item.setMap(null))
  markerList.value = []
  pointList.value.forEach((item) => {
    const markerContent = `<div class="map_point">
          <div class="point_name">${item.name}</div>
          <img src="${MapPointIcon_img}" alt="">
        </div>`;
    const position = new AMap.LngLat(item.longitude, item.latitude); // Marker经纬度
    const marker = new AMap.Marker({
      thirdId: item.thirdid,
      pointType: item.pointcategory, //点位类型pointType,1:商铺 2:点位 3:摄像头
      position: position,
      content: markerContent, // 将 html 传给 content
      offset: new AMap.Pixel(-62, -40) // 以 icon 的 [center bottom] 为原点
    });
    marker.on('click', function (e) {
      //点位类型pointType,1:商铺 2:点位 3:摄像头
      if (e.target._originOpts.pointType == 1) {
        getShopDetailsFunc(e.target._originOpts.thirdId)
      } else if (e.target._originOpts.pointType == 2) {
        getPointDetailsFunc(e.target._originOpts.thirdId)
      } else if (e.target._originOpts.pointType == 3) {
        cameraId.value = e.target._originOpts.thirdId
        dialogCameraShow.value = true
      }
    });
    map.value.add(marker);
    markerList.value.push(marker)
  })
}
const getPointDetailsFunc = (id) => {
  getPointDetails(id).then((res) => {
    Object.assign(venueInfo, res.data)
    venueInfo.baseInfo = [
      { label: "开放时间", info: res.data.openinghours },
      { label: "联系热线", info: res.data.contactbotline },
      { label: "地址", info: res.data.address },
      { label: "打卡人数", info: res.data.count }
    ]
    dialogVenues.value = true
  })
}

const routesTypeChange = (key, index) => {
  if (routesTypeActive.value !== index) {
    routesTypeActive.value = index
    getRoutesDetailsFunc(key)
  } else {
    routesTypeActive.value = null
    if (polylineList.value) {
      map.value.remove(polylineList.value);
      polylineList.value = []
    }
  }
}

const getRoutesDetailsFunc = (id) => {
  getRoutesDetails(id).then((res) => {
    Object.assign(routesDetails, res.data)
    roadLine()
  })
}


const initMap = () => {
  var imageLayer = new AMap.ImageLayer({
    url: map_bg,
    bounds: new AMap.Bounds(
      [120.136091, 30.313604],
      [120.14250, 30.319828]
    ),
    zooms: [3, 25]
  });
  map.value = new AMap.Map('map', {
    viewMode: '2D',
    zoom: 18,
    center: [120.139397, 30.317056],
    layers: [
      AMap.createDefaultLayer(),
      imageLayer,
    ]
  });


}

const roadLine = () => {
  if (polylineList.value) {
    map.value.remove(polylineList.value);
    polylineList.value = []
  }
  routesDetails.mapinfo.forEach((item) => {
    let path = item.rousubs.map(el => {
      return new AMap.LngLat(el.longitude, el.latitude);
    })
    let polyline = new AMap.Polyline({
      path: path,
      strokeOpacity: 1,
      strokeWeight: 7,
      strokeColor: routesTypeActive.value === 0 ? '#8BE107' : routesTypeActive.value === 1 ? '#11B4FF' : '#ff3e55', // 线条颜色
      lineJoin: 'round' // 折线拐点连接处样式
    });
    map.value.add(polyline);
    polylineList.value.push(polyline)
  })
  console.log(polylineList.value);
}

//获取当前时间
const getTime = () => {
  var time = new Date();
  var year = time.getFullYear();
  var month = time.getMonth() + 1;
  var day = time.getDate();
  var yesterDay = time.getDate() - 1;
  var hour = time.getHours(); //得到小时
  var minu = time.getMinutes(); //得到分钟
  var sec = time.getSeconds(); //得到秒
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (day >= 0 && day <= 9) {
    day = "0" + day;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minu < 10) {
    minu = "0" + minu;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  var days = time.getDay();
  switch (days) {
    case 1:
      days = "周一";
      break;
    case 2:
      days = "周二";
      break;
    case 3:
      days = "周三";
      break;
    case 4:
      days = "周四";
      break;
    case 5:
      days = "周五";
      break;
    case 6:
      days = "周六";
      break;
    case 0:
      days = "周日";
      break;
  }
  todaydata.value = year + "/" + month + "/" + day;
  dateTime.value = hour + ":" + minu + ':' + sec;
  todayweek.value = days;
  yesterday.value = year + "." + month + "." + yesterDay;
}


onBeforeUnmount(() => {
  clearInterval(timer.value)
})


</script>


<style lang="scss" scoped>
// @import "@/assets/style/cockpit.scss";
.viewBim {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  min-height: 1080px;
  border-width: 0px;
  z-index: 0;
}

.point_type-prev,
.point_type-next {
  position: absolute;
  cursor: pointer;
}

.point_type-prev {
  top: 0px;
  right: 40px;
}

.point_type-next {
  bottom: 0px;
  right: 40px;
}


.point-box {
  position: absolute;
  right: 520px;
  top: 250px;
  height: 600px;
  z-index: 50;

  .point-item {
    margin-bottom: 15px;
    position: relative;
    text-align: center;
    font-size: 14px;
    // background: linear-gradient(0deg, #ffb30f 0%, #76effd 0%, #ffffff 100%);
    // -webkit-background-clip: text;
    // -webkit-text-fill-color: transparent;
    cursor: pointer;
    transition: all 0.2s;


    font-weight: 400;
    color: #F0FEFF;
    text-shadow: 0px 2px 6px rgba(10, 56, 122, 0.35);

    img {
      width: 75px;
      height: 75px;
      object-fit: cover;
    }
  }
}
</style>
