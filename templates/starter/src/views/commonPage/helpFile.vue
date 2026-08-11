<!-- 培训视频 -->
<template>
  <div class="page-con">
    <div v-for="group in videoList" :key="group.folder" class="group">
      <h2>{{ group.folder }}</h2>
          <el-button type="primary" v-for="name in group.videos" :key="name" link @click="download(group.folder, name)">{{ name }}</el-button>
    </div>

  </div>
</template>
<script lang="ts">
export default {
  name: "helpFile",
};
</script>

<script setup lang="ts">
const imgUrl = import.meta.env.VITE_IMGURL || ''
const videoList = [
  {
    folder: '管理端小程序',
    videos: ['场馆签到', '房屋管理', '活动签到', '礼品核销', '住户管理', '场馆预约', '达人活动', '达人审核', '达人文章', '动态审核', '督办', '二手好物', '互助审核', '话题审核', '拼单审核', '社群活动', '社群审核', '问题', '问题-受理并处理流转', '问题-添加事件', '住户审核']
  },
  {
    folder: '居民端小程序',
    videos: ['场馆预约', '创业服务', '达人活动-报名签到', '二手好物', '个人资料', '互助', '接待预约', '交通信息', '接待预约', '话题创建-发布动态', '邻里公约', '邻里圈（活动、话题）', '拼单', '社区通知', '社区信息', '社群', '社群活动-报名签到', '事项表决', '添加房屋', '问卷调查', '我的空间', '我的邻居', '物业报修', '物业评价', '消息', '应用聚合（办事指南、便民热线、网格在线）', '有礼兑换', '直通码']
  },
  {
    folder: 'PC管理后台',
    videos: ['工作待办', '居民端账号', '居民端房屋绑定历史', '管理端账号', '党组织', '党员信息', '历史住户', '人房档案', '房屋', '导入日志', '网格', '网格成员', '物业', '物业成员', '小区信息', '积分商城', '抽奖奖品库', '转盘抽奖', '调整用户社区积分', '调整用户社区积分自定义', '积分信用规则', '行为规则', '信用等级', '积分日志', '信用日志', '社区基本信息', '标签', '标签类别', '勋章', '勋章类别', '承诺管理', '应用类别', '应用', '栏目', '应用免审', '首页模块配置', '轮播图', '运营主体', '运营主体类别', '商家店铺', '基础配置', '居民端使用量统计', '事项表决', '问卷调查', '事件管理', '事件配置', '新闻公告', '意见反馈', '社区活动', '达人活动', '社群活动', '三方活动', '场馆预约', '邻里互助', '二手好物', '社群', '达人', '话题', '动态', '拼单', '菜品', '社区工作信息', '周边服务', '便民热线', '便民热线类别', '便民服务点', '社区工作人员门禁', '访客记录', '人员出入记录', '云看护', '物联引擎', '驾驶舱', '点位模板', '地图点位', '基本设置', '场景', '场景内容模块', '区域场景', '场景数据', '页面布局', '角色', '用户']
  }
]
const download = (folder: string, name: string) => {
  const a = document.createElement('a')
  a.href = `${imgUrl}video/${folder}/${name}.mp4`
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  a.click()
}


</script>

<style lang="scss" scoped>
.page-con{
  padding: 20px;
  max-width:1000px;
    :deep(.el-button) {
      margin-left: 12px;
      margin-bottom: 18px;
      font-size: 16px;
    }
}
</style>