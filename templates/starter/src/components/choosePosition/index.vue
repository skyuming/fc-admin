<template>
    <el-dialog width="70%" :model-value="show" title="获取经纬度" @close="closeDialogForm" destroy-on-close>
        <div class="mapBox">
            <div ref="mapContainer" class="map"></div>
            <div class="search_box">
                <el-input v-model="keyword" placeholder="搜索地点" clearable @input="searchPlace" />
                <div class="map_search" v-if="searchResults.length > 0">
                    <div v-for="(result, index) in searchResults" :key="index" class="search-item"
                        @click="selectSearchResult(result)">
                        {{ result.name }}
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="jingweidu">
                <div class="flex-center">
                    <span style="flex-shrink: 0;">经度：</span>
                    <el-input size="large" v-model="clickMapPosition.lng" disabled />
                    <span style="flex-shrink: 0;margin-left: 10px;">纬度：</span>
                    <el-input size="large" v-model="clickMapPosition.lat" disabled />
                </div>
                <el-button type="primary" @click="savePosition">确定位置</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup>
import { reactive, ref, watch, onMounted, onUnmounted, nextTick } from "vue";



const emits = defineEmits(['update:show', 'savePosition'])
const props = defineProps({
    show: {
        type: Boolean
    },
    centerPosition: {  // 地图中心点
        type: Object,
        default: () => {
            return {
                lng: 120.218582,
                lat: 30.214394
            }
        }
    },
    defaultPosition: {  // 默认点位
        type: Object,
        default: () => {
            return {
                lng: 0,
                lat: 0
            }
        }
    }
})

const mapContainer = ref()
const map = ref()
const marker = ref()
const clickMapPosition = reactive({
    lng: 0,
    lat: 0
})
const keyword = ref('')
const searchResults = ref([])

// 监听props的defaultPosition变化并赋值给clickMapPosition
watch(() => props.defaultPosition, (val) => {
    console.log(val)
    clickMapPosition.lng = val.lng
    clickMapPosition.lat = val.lat
    if (marker.value) {
        marker.value.setPosition(new T.LngLat(val.lng, val.lat))
    }
}, { immediate: true, deep: true })

// 监听show变化，初始化或销毁地图
watch(() => props.show, (val) => {
    if (val) {
        nextTick(() => {
            initMap()
        })
    } else {
        destroyMap()
    }
})

// 初始化地图
const initMap = () => {
    if (!mapContainer.value) return
    // 初始化天地图
    map.value = new T.Map(mapContainer.value, {
        zoom: 13,
        center: new T.LngLat(props.centerPosition.lng, props.centerPosition.lat),
        scrollWheelZoom: true
    })

    // 添加地图点击事件
    map.value.addEventListener("click", getClick)

    // 创建标记点
    if (clickMapPosition.lng && clickMapPosition.lat) {
        console.log(
            clickMapPosition.lng,
            clickMapPosition.lat
        );

        addMarker(clickMapPosition.lng, clickMapPosition.lat)
    }
}

// 添加标记点
const addMarker = (lng, lat) => {
    if (!map.value) return

    // 移除旧标记
    if (marker.value) {
        map.value.removeOverLay(marker.value)
    }

    // 创建新标记
    marker.value = new T.Marker(new T.LngLat(lng, lat), {
        draggable: true
    })

    // 添加标记到地图
    map.value.addOverLay(marker.value)

    // 添加拖动事件
    marker.value.addEventListener("dragend", dragend)


}

// 销毁地图
const destroyMap = () => {
    if (map.value) {
        if (map.value.destroy) {
            map.value.destroy();
        }
        map.value = null
    }
    marker.value = null
}

// 点击地图获取位置
const getClick = (e) => {
    const lng = e.lnglat.lng
    const lat = e.lnglat.lat
    clickMapPosition.lng = lng
    clickMapPosition.lat = lat
    addMarker(lng, lat)
}

// 拖动标记点获取位置
const dragend = (e) => {
    const lng = e.lnglat.lng
    const lat = e.lnglat.lat
    clickMapPosition.lng = lng
    clickMapPosition.lat = lat
}

// 搜索地点
const searchPlace = () => {
    if (!keyword.value) {
        searchResults.value = []
        return
    }

    // 使用天地图的本地搜索服务
    const localSearch = new T.LocalSearch(
        map.value,
        {
            pageCapacity: 20,
            onSearchComplete: (result) => {

                if (result && result.getPois && result.getPois().length > 0) {
                    searchResults.value = []
                    const pois = result.getPois()
                    console.log(pois)
                    for (let i = 0; i < pois.length; i++) {
                        const item = pois[i]

                        searchResults.value.push({
                            name: item.name,
                            lng: item.lonlat.split(',')[0],
                            lat: item.lonlat.split(',')[1]
                        })
                    }
                } else {
                    searchResults.value = []
                }
            }
        })
    localSearch.search(keyword.value)
}

// 选择搜索结果
const selectSearchResult = (result) => {
    console.log(result)
    keyword.value = result.name
    clickMapPosition.lng = result.lng
    clickMapPosition.lat = result.lat
    addMarker(result.lng, result.lat)
    map.value.centerAndZoom(new T.LngLat(result.lng, result.lat));

    searchResults.value = []
}

// 确定位置
const savePosition = () => {
    emits('savePosition', clickMapPosition)
    closeDialogForm()
}

// 关闭弹窗
const closeDialogForm = () => {
    keyword.value = ''
    searchResults.value = []
    emits('update:show', false)
}

// 组件挂载后初始化地图
onMounted(() => {
    if (props.show) {
        initMap()
    }
})

// 组件卸载前销毁地图
onUnmounted(() => {
    destroyMap()
})
</script>
<style lang="scss" scoped>
.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}

.jingweidu {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mapBox {
    height: 500px;
    width: 100%;
    position: relative;

    .search_box {
        position: absolute;
        width: 25%;
        top: 10px;
        left: 10px;
        z-index: 1000;
        background: white;
        padding: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .map_search {
            width: 100%;
            max-height: 200px;
            overflow: auto;
            margin-top: 10px;
            border: 1px solid #e4e7ed;
            border-radius: 4px;

            .search-item {
                padding: 10px;
                cursor: pointer;
                transition: all 0.3s;

                &:hover {
                    background-color: #f5f7fa;
                }
            }
        }
    }

    .map {
        width: 100%;
        height: 100%;
        z-index: 1;
    }
}
</style>