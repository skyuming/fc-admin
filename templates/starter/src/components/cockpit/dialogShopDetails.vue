<template>
  <!-- 商家详情-弹窗 -->
  <div>
    <dialogBox :title="dialogName" :width="'fit-content'" :dialogVisible="dialogShopDetailsShow" @close="closeDialog">
      <template v-slot:container>
        <div class="box flex">
          <div class="left">
            <div class="point-img">
              <swiper v-if="swiperShow" :modules="modules" :loop="true" :pagination="{ clickable: true }"
                :autoplay="chargingPileInfo.facade_images.length > 1 ? autoplayOptions : false" @slideChange="onSlideChange">
                <swiper-slide v-for="item, index in chargingPileInfo.facade_images" :key="index">
                  <img :src="item" alt="" />
                </swiper-slide>

              </swiper>

              <img v-if="chargingPileInfo.facade_images.length < 1" src="@/assets/images/cockpit_images/venue-default.png"
                alt="" />
            </div>
            <div class="popup-scope-rule">
              <div class="title">
                <span class="text-blue">基本信息</span>
              </div>
              <div class="basic-info">
                <div class="item flex" v-for="(item, index) in chargingPileInfo.baseInfo" :key="index">
                  <div class="label">{{ item.label }}</div>
                  <div class="info OnlyShowOne">{{ item.info }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="coupon_box" v-if="chargingPileInfo.customdiscountcoupons.length">
              <div class="title">
                <span class="text-blue">店铺优惠券 ({{ chargingPileInfo.customdiscountcoupons.length }})</span>
              </div>
              <div class="coupon_list">
                <swiper :modules="modules" :slidesPerView="5">
                  <swiper-slide class="coupon_card" v-for="item in chargingPileInfo.customdiscountcoupons" :key="item.id">
                    <div class="time">{{ item.end_time }}到期</div>
                    <div class="flex-center">
                      <div class="info">
                        <div class="name OnlyShowOne">{{ item.name }}</div>
                      </div>
                    </div>
                    <div class="coin">{{ item.deduction_amount }}积分</div>
                  </swiper-slide>
                </swiper>
              </div>
            </div>
            <div class="flex">
              <div class="goods_box" v-if="chargingPileInfo.customcommoditys.length">
                <div class="title">
                  <span class="text-blue">推荐商品 ({{ chargingPileInfo.customcommoditys.length }})</span>
                </div>
                <div class="goods_list">
                  <swiper :modules="modules" :slidesPerView="3">
                    <swiper-slide class="goods_item" v-for="item in chargingPileInfo.customcommoditys" :key="item.id">
                      <img class="goods_img" :src="item.pictures" alt="">
                      <div class="goods_name"> {{ item.name }} </div>
                      <div class="goods_price">￥{{ item.price }}</div>
                    </swiper-slide>
                  </swiper>
                </div>
              </div>
              <div class="interaction_box" v-if="chargingPileInfo.shoptaskinfoslist.length">
                <div class="title">
                  <span class="text-blue">商家互动 ({{ chargingPileInfo.shoptaskinfoslist.length }})</span>
                </div>

                <div class="interaction_list">
                  <swiper :modules="modules" :pagination="{ clickable: true }" :autoplay="autoplayOptions"
                    @slideChange="onSlideChange">
                    <swiper-slide class="interaction_item swiper-slide"
                      v-for="item, index in chargingPileInfo.shoptaskinfoslist" :key="item.id">
                      <img class="icon" src="@/assets/images/cockpit_images/interaction_icon.png" alt="">
                      <div class="number flex-center">任务{{ index + 1 }}</div>
                      <div class="address OnlyShowOne">
                        地点：{{ item.tasklocation }}
                      </div>
                      <div class="info">
                        任务：{{ item.taskdetails }}
                      </div>
                    </swiper-slide>
                  </swiper>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </dialogBox>
  </div>
</template>

<script setup>
import dialogBox from "./dialogBox.vue"

import 'swiper/swiper.min.css'
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';

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
  dialogShopDetailsShow: {
    type: Boolean
  },

})


const autoplayOptions = {
  delay: 3000,
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}

const onSlideChange = (e) => {
  // swiper切换的时候执行的方法
  console.log('slide change', e.activeIndex)
}
const modules = [A11y, Autoplay]
const swiperShow = ref(false) //由于组件化的swiper的observer配置无效，所以用一个变量来控制swiper的视图刷新时机（正常情况下动态加载数据时，需要配置bserver=true否则loop会失效）

onMounted(() => {
  swiperShow.value = false;
  nextTick(() => {
    swiperShow.value = true;
  });
})

const closeDialog = () => {
  emits('update:dialogShopDetailsShow', false)
}

</script>

<style lang="scss" scoped>
.box {
  padding: 16px;
}

.left {

  width: 405px;
}

.right {
  flex: 1;
  .coupon_box {
    margin-left: 20px;
    margin-bottom: 20px;
    width: fit-content;
    max-width: 820px;

    .coupon_card {
      margin-right: 15px;
      width: 151px !important;
      height: 162px;
      background: url(@/assets/images/cockpit_images/bg_coupon.png) no-repeat 0 0;

      .time {
        margin-left: 16px;
        font-size: 14px;
        font-weight: 400;
        color: #184F68;
      }

      .info {
        font-size: 20px;
        font-weight: 500;
        color: #184F68;
        text-align: center;
        margin: 15px 0;
        font-weight: 500;

        .unit {
          font-size: 16px;
        }

        .name {
          width: 130px;
          height: 62px;
          line-height: 62px;
          padding: 0 10px;

        }
      }

      .coin {
        text-align: center;
        width: 130px;
        margin: 0 auto;
        padding: 8px 0;
        font-size: 15px;
        font-weight: 500;
        color: #008ED0;
        background: rgba($color: #11B4FF, $alpha: .1);
        border-radius: 19px;
      }
    }
  }

  .goods_box {
    margin-left: 20px;

    margin-right: 20px;
    max-width: 500px;
    width: fit-content;


    .goods_list {
      .goods_item {
        width: 150px !important;
        margin-right: 17px;

        .goods_img {
          width: 150px;
          height: 107px;
          border-radius: 10px;
        }

        .goods_name {
          height: 34px;
          margin: 5px 0 8px;
          font-size: 14px;
          color: #FFF;
          line-height: 20px;
        }

        .goods_price {
          font-size: 16px;
          color: #11B4FF;
        }
      }
    }
  }
}

.interaction_box {
  width: 313px;

  .interaction_list {
    .interaction_item {
      position: relative;
      width: 100%;
      height: 166px;
      background: rgba($color: #11B4FF, $alpha: .2);
      border-radius: 10px;

      .number {
        margin-top: 10px;
        width: 74px;
        height: 28px;
        font-size: 14px;
        color: #11B4FF;
        background: rgba(17, 180, 255, 0.1);
        border-radius: 0px 14px 14px 0px;
      }

      .icon {
        position: absolute;
        top: 10px;
        right: 28px;
        z-index: 0;
      }

      .address {
        margin: 18px 0 14px;
      }

      .address,
      .info {
        padding: 0 13px;
        font-size: 14px;
        color: #FFF;
        display: -webkit-box;
        -webkit-line-clamp: 3; //行数
        line-clamp: 3;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
      }

    }
  }
}


.point-img {
  width: 100% !important;
  height: 200px !important;
  margin: 0 auto;
  // padding: 0 10px;
  box-sizing: border-box;

  img {
    width: 100% !important;
    height: 200px !important;
    object-fit: cover;
  }
}

.title {
  position: relative;
  margin: 0 5px 10px;

  span {
    font-size: 16px;
  }
}

.popup-scope-rule {
  padding: 20px 0;
  color: #fff;

  .imgbox {
    padding: 0 16px;
    max-height: 300px;
    overflow: hidden;

    .desc-img {
      width: 100%;
    }
  }



  .basic-info {
    font-size: 14px;

    .item {
      padding: 5px;

      &:last-child {
        .info {
          display: -webkit-box;
          -webkit-line-clamp: 3; //行数
          line-clamp: 3;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
          white-space: normal
        }
      }

      .label {
        width: 80px;
        color: #999;
      }

      .info {
        flex: 1;

      }
    }


  }
}
</style>
