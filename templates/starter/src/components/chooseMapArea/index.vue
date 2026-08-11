<!-- 地图鼠标绘制线条：选择社区边界 https://blog.csdn.net/fuxin199207/article/details/121825940 -->
<template>
  <el-dialog width="70%" :model-value="show" title="选择社区边界" @close="closeDialog" destroy-on-close>
    <div class="mapBox">
      <div class="home">
        <!-- 地图容器 -->
        <div ref="containerRef" class="container"></div>

        <div class="btns">
          <el-button type="primary" @click="draw">开始选择社区边界</el-button>
          <el-button type="danger" @click="clear">清空社区边界</el-button><!--清空所有多边形-->
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer"> 
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
  
<script setup >
import { ref, watch, onUnmounted, nextTick } from 'vue';


const emits = defineEmits(['update:show', 'update:datalist', 'reloadTable'])
const props = defineProps({
  show: {
    type: Boolean
  },
  datalist: {
    type: Array,
    default: () => {
      return [];
    }
  }
});
// 监听props下show的变化
const watchShow = () => {
  if (props.show) {
    nextTick(() => {
      initMap()
    })
  }
}
watch(() => props.show, watchShow)

const map = ref()
const polygons = ref([])// 所有多边形
const polygonPaths = ref([])// 所有坐标
const containerRef = ref()
const centerPointLng = ref(120.218582) // 地图中心点
const centerPointLat = ref(30.214394) // 地图中心点
const drawingTool = ref() // 绘制工具

function initMap() {
  console.log(containerRef.value);

  if (!containerRef.value) return;
  // 初始化天地图
  map.value = new T.Map(containerRef.value, {
    zoom: 16,
    center: new T.LngLat(centerPointLng.value, centerPointLat.value),
    scrollWheelZoom: true
  });
  console.log(props.datalist);
  
  if (props.datalist.length > 0) {
    let points = []
    props.datalist.forEach((item) => {
      points.push(new T.LngLat(item.lng, item.lat))

    })
    const polygon = new T.Polygon(points, {
      strokeColor: "#5E87DB", // 边线颜色
      strokeWeight: 2, // 边线宽度
      strokeOpacity: 1, // 边线透明度
      fillColor: "#5E87DB", // 填充颜色
      fillOpacity: 0.2, // 填充透明度
    });
    map.value.addOverLay(polygon);
    polygons.value.push(polygon);
  }
}

function draw() {
  if (!map.value) return;
  clear()
  // 初始化天地图多边形绘制工具
  drawingTool.value = new T.PolygonTool(map.value, {
    strokeColor: "#5E87DB", // 边线颜色
    strokeWeight: 2, // 边线宽度
    strokeOpacity: 1, // 边线透明度
    fillColor: "#5E87DB", // 填充颜色
    fillOpacity: 0.2, // 填充透明度
    once: false // 是否只允许绘制一次
  });

  // 开始绘制
  drawingTool.value.open();

  // 监听绘制完成事件
  drawingTool.value.addEventListener("draw", (e) => {
    console.log(e);

    if (e.currentLnglats) {
      // 获取多边形的坐标
      const path = e.currentLnglats;
      const pathArray = [];
      for (let i = 0; i < path.length; i++) {
        pathArray.push({
          lng: path[i].lng,
          lat: path[i].lat
        });
      }

      // // 创建多边形对象并添加到地图
      // const polygon = new T.Polygon(path, {
      //   strokeColor: "#5E87DB",
      //   strokeWeight: 2,
      //   strokeOpacity: 1,
      //   fillColor: "#5E87DB",
      //   fillOpacity: 0.2
      // });
      // map.value.addOverLay(polygon);
      // polygons.value.push(polygon);
      polygonPaths.value.push(pathArray);

      // console.log('polygons=', polygons.value);
      console.log('polygonPaths=', polygonPaths.value);


    }
  });
}
function clear() {
  if (!map.value) return;
  map.value.clearOverLays();
  polygons.value = [];
  polygonPaths.value = [];
}

function handleSubmit() {
  console.log(polygonPaths.value);

  if (polygonPaths.value.length > 0) {
    emits('update:datalist', polygonPaths.value[0])
  }
  closeDialog()
}
function closeDialog() { // 关闭弹窗
  emits('update:show', false)
  clear()
}

// 组件卸载时销毁地图
onUnmounted(() => {
  if (map.value) {
    if (map.value.destroy) {
      map.value.destroy();
    }
    map.value = null;
  }
});
</script>
  
<style scoped lang="scss">
.container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
}

.btns {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
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
</style>  


