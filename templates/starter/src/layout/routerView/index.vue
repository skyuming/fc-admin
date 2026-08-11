<template>
  <!-- <router-view >
    </router-view> -->
  <router-view v-slot="{ Component }">
    <keep-alive :include="tagsList">
      <component :is="formatComponentInstance(Component,route)"  :key="$route.fullPath"/>
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { useTagsViewStore, TagView } from "@/store/modules/tagsView";
import { useRoute } from "vue-router";
import { ComputedRef } from "vue";
const tagsViewStore = useTagsViewStore();
const route = useRoute();

const tagsList: ComputedRef<any[]> = computed(() => {
  if (tagsViewStore.visitedViews.length) {
    const list = tagsViewStore.visitedViews.map((item) => {
      return item.name
    })
    return list
  } else {
    return [];
  }
});
// 用来存已经创建的组件
const wrapperMap = new Map();
// 将router传个我们的组件重新换一个新的组件，原组件包里面
function formatComponentInstance(component:any, route:any) {
  let wrapper;
  if (component) {
    const wrapperName = route.path;
    if (wrapperMap.has(wrapperName)) {
      wrapper = wrapperMap.get(wrapperName);
    } else {
      wrapper = {
        name: wrapperName,
        render() {
          return h(component);
        },
      };
      wrapperMap.set(wrapperName, wrapper);
    }
    return h(wrapper);
  }
}

</script>