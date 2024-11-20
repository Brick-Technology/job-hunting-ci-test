<template>
  <el-row ref="statisticRef" v-loading="loading" class="statistic">
    <el-col :span="12">
      <el-statistic title="今天偏好职位发现数" :value="todayFaviousJobCount" />
    </el-col>
    <el-col :span="12">
      <el-statistic title="偏好职位总数" :value="totalFaviousJob" />
    </el-col>
  </el-row>
  <el-divider content-position="right" class="divider">
    <el-tooltip content="帮助">
      <Icon icon="ph:question" class="icon" @click="tourOpen = true" />
    </el-tooltip>
    <el-tour v-model="tourOpen">
      <el-tour-step :target="statisticRef?.$el" title="统计">
        <el-row>
          <el-text>统计偏好职位的数量</el-text>
        </el-row>
      </el-tour-step>
      <el-tour-step :target="favoriteMenuRef" title="职位偏好">
        <el-row>
          <el-text>设置职位偏好，查看感兴趣的职位</el-text>
        </el-row>
      </el-tour-step>
      <el-tour-step :target="automateMenuRef" title="自动化">
        <el-row>
          <el-text>运行自动化任务，如自动浏览职位搜索页</el-text>
        </el-row>
      </el-tour-step>
    </el-tour>
  </el-divider>
  <div class="content">
    <el-tabs tab-position="left" class="tabs" v-model="selectTabName">
      <el-tab-pane :name="TAB_ENUM_FAVORITE" class="tab_panel">
        <template #label>
          <div class="menuItem" ref="favoriteMenuRef">
            <span>职位偏好</span>
            <Icon icon="fluent-emoji-flat:red-heart" width="25" height="25" />
          </div>
        </template>
        <FavoriteJobView v-if="selectTabName == TAB_ENUM_FAVORITE" </FavoriteJobView>
      </el-tab-pane>
      <el-tab-pane :name="TAB_ENUM_HISTORY" class="tab_panel">
        <template #label>
          <div class="menuItem" ref="favoriteMenuRef">
            <span>浏览历史</span>
            <Icon icon="material-symbols:history" width="25" height="25" />
          </div>
        </template>
        <LatestBrowseJobView v-if="selectTabName == TAB_ENUM_HISTORY"></LatestBrowseJobView>
      </el-tab-pane>
      <el-tab-pane :name="TAB_ENUM_AUTOMATE" class="tab_panel">
        <template #label>
          <div class="menuItem" ref="automateMenuRef">
            <span>自动化</span>
            <Icon icon="tabler:robot" width="25" height="25" />
          </div>
        </template>
        <AutomateView v-if="selectTabName == TAB_ENUM_AUTOMATE"></AutomateView>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
  <script lang="ts" setup>
  import {
    onMounted,
    ref,
    onUnmounted,
  } from "vue";
  import FavoriteJobView from "./assistant/FavoriteJobView.vue";
  import AutomateView from "./assistant/AutomateView.vue";
  import { Icon } from "@iconify/vue";
  import { useTransition } from "@vueuse/core";
  import { AssistantApi } from "../../common/api/index";
  import LatestBrowseJobView from "./assistant/LatestBrowseJobView.vue";

  const TAB_ENUM_FAVORITE = "TAB_ENUM_FAVORITE";
  const TAB_ENUM_HISTORY = "TAB_ENUM_HISTORY";
  const TAB_ENUM_AUTOMATE = "TAB_ENUM_AUTOMATE";

  const selectTabName = ref(TAB_ENUM_FAVORITE);

  const loading = ref(false);
  const tourOpen = ref(false);

  const statisticRef = ref();
  const favoriteMenuRef = ref();
  const automateMenuRef = ref();

  const todayFaviousJobCountSource = ref(0);
  const todayFaviousJobCount = useTransition(todayFaviousJobCountSource, {
    duration: 1000,
  });
  const totalFaviousJobSource = ref(0);
  const totalFaviousJob = useTransition(totalFaviousJobSource, {
    duration: 1000,
  });

  let refreshIntervalId = null;

  onMounted(async () => {
    await refresh();
    refreshIntervalId = setInterval(refresh, 10000);
  })

  const refresh = async () => {
    loading.value = true;
    let result = await AssistantApi.assistantStatistic();
    todayFaviousJobCountSource.value = result.todayFaviousJobCount
    totalFaviousJobSource.value = result.totalFaviousJob
    loading.value = false;
  };

  onUnmounted(() => {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
    }
  });


</script>

  <style scoped>
  .statistic {
    .el-col {
      text-align: center;
    }

    padding-top: 10px;
  }

  .content {
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow: hidden;
    width: 100%;
  }

  .divider {
    margin: 16px;
  }

  .icon {
    cursor: pointer;
    width: 24px;
    height: 24px;
  }

  .tabs {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .tab_panel {
    height: 100%;
    width: 100%;
  }

  .menuItem {
    display: flex;
    align-items: center;
  }
</style>
