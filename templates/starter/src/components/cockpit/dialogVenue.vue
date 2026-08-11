<template>
  <!-- 点位弹窗-场馆信息 -->
  <div>
    <dialogBox :title="dialogName" width="500px" :dialogVisible="dialogVisiblea" @close="closeDialog">
      <template v-slot:container>
        <div class="point-box">
          <div class="point-name OnlyShowOne">
            {{ chargingPileInfo.name }}
          </div>

          <swiper v-if="swiperShow" class="point-img" :space-between="20" :loop="true" :modules="modules"
            :autoplay="chargingPileInfo.pictures.length>1?autoplayOptions:false">
            <swiper-slide v-for="item, index in chargingPileInfo.pictures" :key="index">
              <img :src="item" alt="" />
            </swiper-slide>

          </swiper>
          <div v-if="chargingPileInfo.pictures.length < 1" class="point-img">
            <img src="@/assets/images/cockpit_images/venue-default.png" alt="" />
          </div>
        </div>
        <div class="line_list flex">
          <div class="line_item OnlyShowOne"
            :class="chargingPileInfo.linestatus[index] == 1 ? 'bg-green' : chargingPileInfo.linestatus[index] == 2 ? 'bg-blue' : 'bg-red'"
            v-for="item, index in chargingPileInfo.linestatus_name">{{ item }}</div>
        </div>

        <div class="popup-scope-rule">
          <div class="title">
            <span class="text-blue">基本信息</span>
          </div>
          <ul class="basic-info">
            <li v-for="(item, index) in chargingPileInfo.baseInfo" :key="index">
              <label>{{ item.label }}</label>
              <span>{{ item.info }}</span>
            </li>
          </ul>
          <div v-if="chargingPileInfo.introduction">
            <div class="title">
              <span class="text-blue">场所介绍</span>
            </div>
            <div class="info">
              <p v-html="sanitizeHTML(chargingPileInfo.introduction)">
              </p>
            </div>
          </div>
        </div>
      </template>
    </dialogBox>
  </div>
</template>

<script setup>
import dialogBox from "./dialogBox.vue"
import { sanitizeHTML } from "@/utils/sanitize"
import 'swiper/swiper.min.css'
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
// export default {

const emits = defineEmits(['update:dialogVisiblea'])

const props = defineProps({
  dialogName: {
    type: String,
    default() {
      return "";
    },
  },
  chargingPileInfo: {
    type: Object,
    default() {
      return null;
    },
  },
  dialogVisiblea: {
    type: Boolean
  },

})
const swiperShow = ref(false) //由于组件化的swiper的observer配置无效，所以用一个变量来控制swiper的视图刷新时机（正常情况下动态加载数据时，需要配置observer否则loop会失效）
const modules = [A11y, Autoplay]
const autoplayOptions = {
  delay: 3000,
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}
onMounted(() => {
  nextTick(() => {
    swiperShow.value = true;
  });
})
const closeDialog = () => {
  emits('update:dialogVisiblea', false)
}

// };
</script>

<style lang="scss" scoped>
.point-box {
  position: relative;

  .point-name {
    position: absolute;
    top: 10px;
    left: 10px;
    color: #fff;
    z-index: 10;
    max-width: 180px;
    padding: 5px 10px;
    background: rgba(0, 28, 50, 0.76);
    border-radius: 0px 0px 10px 0px;
  }
}

.point-img {
  width: 100% !important;
  height: 200px !important;
  margin: 0 auto;
  padding: 10px 10px 0;
  box-sizing: border-box;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.line_list {
  flex-wrap: wrap;
  margin-top: 20px;
  padding: 0 15px;

  .line_item {
    width: 32%;
    margin-right: 5px;
    margin-bottom: 5px;
    text-align: center;
    padding: 5px;
    border-radius: 2px;
    font-size: 13px;
    font-weight: 400;

    &:last-child {
      margin-right: 0;
    }
  }

}

.popup-scope-rule {
  padding: 0 15px 20px;
  color: #fff;

  //   height: 500px;
  //   overflow: auto;
  .imgbox {
    padding: 0 16px;
    max-height: 300px;
    overflow: hidden;

    .desc-img {
      width: 100%;
    }
  }

  .title {
    position: relative;
    margin: 20px 5px 10px;

    &::after {
      content: "";
      position: absolute;
      left: 70px;
      top: 10px;
      width: calc(100% - 100px);
      height: 1px;
      background: #062738;
    }

    span {
      font-size: 16px;
      font-weight: bold;
    }
  }

  .info {
    height: 150px;
    overflow: auto;
    padding: 0px 5px 15px 5px;
    line-height: 24px;
  }

  .basic-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    font-size: 14px;

    li {
      padding: 5px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: calc(50% - 10px);
    }

    li label {
      width: 80px;
      color: #999;
    }
  }
}
</style>
