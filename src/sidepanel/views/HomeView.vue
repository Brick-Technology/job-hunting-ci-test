<template>
  <el-row ref="statisticRef" v-loading="loading" class="statistic">
    <el-col :span="6">
      <el-statistic title="今天职位查看数" :value="todayBrowseDetailCount" />
    </el-col>
    <el-col :span="6">
      <el-statistic title="职位数" :value="totalJobCount" />
    </el-col>
    <el-col :span="6">
      <el-statistic title="公司数" :value="totalCompanyCount" />
    </el-col>
    <el-col :span="6">
      <el-statistic title="公司标签数" :value="totalTagCompanyCount" />
    </el-col>
  </el-row>
  <el-divider content-position="right" class="divider">
    <el-tooltip content="帮助">
      <Icon icon="ph:question" class="icon" @click="tourOpen = true" />
    </el-tooltip>
    <el-tour v-model="tourOpen">
      <el-tour-step :target="statisticRef?.$el" title="统计">
        <el-row>
          <el-text>显示职位，公司，公司标签的数量</el-text>
        </el-row>
      </el-tour-step>
      <el-tour-step :target="websiteRef" title="网站" placement="left">
        <el-row>
          <el-text>各类网站的快速导航</el-text>
        </el-row>
      </el-tour-step>
    </el-tour>
  </el-divider>
  <div class="content">
    <div class="middle">
      <StatisticView></StatisticView>
    </div>
    <div ref="websiteRef" class="right">
      <el-descriptions direction="vertical" :column="1" size="small" border>
        <el-descriptions-item label="招聘网站">
          <el-row v-for="(item, index) in jobWebsiteList">
            <img class="logo" :src="item.logo" alt="logo" />
            <el-link :key="index" type="primary" :href="item.url" target="_blank">{{ item.label }}</el-link>
          </el-row>
        </el-descriptions-item>
        <el-descriptions-item label="公司搜索">
          <el-row v-for="(item, index) in companyWebsiteList">
            <el-link :key="index" type="primary" :href="item.url" target="_blank">{{ item.label }}</el-link>
          </el-row>
        </el-descriptions-item>
        <el-descriptions-item label="公司信息查询">
          <el-row v-for="(item, index) in companyInfoWebsiteList">
            <el-link :key="index" type="primary" :href="item.url" target="_blank">{{ item.label }}</el-link>
          </el-row>
        </el-descriptions-item>
      </el-descriptions>

      <div class="latestBrowseTitle">最近查看</div>
      <el-scrollbar class="latestBrowseWrapper" ref="scrollbar">
        <div class="leftSub" ref="latestJobRef" v-loading="searchLoading">
          <el-timeline v-if="tableData.length > 0">
            <el-timeline-item v-for="(item, index) in tableData" :key="index"
              :timestamp="item.latestBrowseDetailDatetime" v-show="item.latestBrowseDetailDatetime">
              <div class="historyJobItem">
                <div class="jobItem">
                  <div class="jobItemName">
                    <el-link :href="item.jobUrl" target="_blank" type="primary">{{ item.jobName }}</el-link>
                  </div>
                  <div class="jobItemSalary">{{ item.jobSalaryMin }}-{{ item.jobSalaryMax }}</div>
                </div>
                <div>
                  <div>{{ item.jobCompanyName }}</div>
                  <div>{{ item.jobAddress }}</div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-text v-else>无</el-text>
        </div>
      </el-scrollbar>
      <div class="latestBrowseFooter">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100, 200, 500, 1000]" :small="small" :disabled="disabled" :background="background"
          layout="prev, pager, next" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>

  </div>
</template>
<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { wgs84ToGcj02 } from "@pansy/lnglat-transform";
import { useTransition } from "@vueuse/core";
import dayjs from "dayjs";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { computed, onMounted, onUnmounted, ref } from "vue";
import "vue-leaflet-markercluster/dist/style.css";
import { CompanyApi, JobApi } from "../../common/api/index.js";
import { UI_DEFAULT_PAGE_SIZE } from "../../common/config";
import { SearchJobBO } from "../../common/data/bo/searchJobBO";
globalThis.L = L;
import StatisticView from "./home/StatisticView.vue";

const todayBrowseDetailCountSource = ref(0);
const todayBrowseDetailCount = useTransition(todayBrowseDetailCountSource, {
  duration: 1000,
});
const totalJobCountSource = ref(0);
const totalJobCount = useTransition(totalJobCountSource, {
  duration: 1000,
});
const totalCompanyCountSource = ref(0);
const totalCompanyCount = useTransition(totalCompanyCountSource, {
  duration: 1000,
});
const totalTagCompanyCountSource = ref(0);
const totalTagCompanyCount = useTransition(totalTagCompanyCountSource, {
  duration: 1000,
});

const loading = ref(true);
const firstTimeLoading = ref(true);
let refreshIntervalId = null;

const datetimeFormat = computed(() => {
  return function (value: string) {
    return dayjs(value).isValid() ? dayjs(value).format("YYYY-MM-DD") : "-";
  };
});

onMounted(async () => {
  await refresh();
  await search();
  refreshIntervalId = setInterval(refresh, 10000);
});

onUnmounted(() => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
});

const refresh = async () => {
  if (firstTimeLoading.value) {
    loading.value = true;
    firstTimeLoading.value = false;
  }
  const statisticJobBrowseDTO = await JobApi.statisticJobBrowse();
  todayBrowseDetailCountSource.value =
    statisticJobBrowseDTO.todayBrowseDetailCount;
  totalJobCountSource.value = statisticJobBrowseDTO.totalJob;
  const statisticCompany = await CompanyApi.statisticCompany();
  totalCompanyCountSource.value = statisticCompany.totalCompany;
  const statisticCompanyTag = await CompanyApi.statisticCompanyTag();
  totalTagCompanyCountSource.value = statisticCompanyTag.totalTagCompany;
  loading.value = false;
};

const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(UI_DEFAULT_PAGE_SIZE);
const total = ref(0);
const small = ref(false);
const background = ref(false);
const disabled = ref(false);

const scrollbar = ref();

const searchLoading = ref(false);

const handleSizeChange = (val: number) => {
  search();
};

const handleCurrentChange = (val: number) => {
  search();
};

const search = async () => {
  searchLoading.value = true;
  let searchResult = await JobApi.searchJob(getSearchParam());
  tableData.value = searchResult.items;
  total.value = parseInt(searchResult.total);
  //地球坐标转火星坐标
  tableData.value.forEach((item) => {
    if (item.jobLongitude && item.jobLatitude) {
      let gcj02 = wgs84ToGcj02(item.jobLongitude, item.jobLatitude);
      item.jobLongitude = gcj02[0];
      item.jobLatitude = gcj02[1];
    }
  });
  scrollbar.value.setScrollTop(0);
  searchLoading.value = false;
};

function getSearchParam() {
  let searchParam = new SearchJobBO();
  searchParam.pageNum = currentPage.value;
  searchParam.pageSize = pageSize.value;
  searchParam.hasBrowseTime = true;
  searchParam.orderByColumn = "latestBrowseDetailDatetime";
  searchParam.orderBy = "DESC";
  return searchParam;
}

import { logo } from "../assets";

const jobWebsiteList = [
  { url: "https://www.zhipin.com/web/geek/job", label: "BOSS直聘", logo: logo.boss },
  { url: "https://we.51job.com/pc/search ", label: "前程无忧", logo: logo.job51 },
  { url: "https://sou.zhaopin.com/", label: "智联招聘", logo: logo.zhilian },
  { url: "https://www.lagou.com/wn/zhaopin", label: "拉钩网", logo: logo.lagou },
  { url: "https://www.liepin.com/zhaopin", label: "猎聘网", logo: logo.liepin },
  { url: "https://hk.jobsdb.com/", label: "Jobsdb-HK", logo: logo.jobsdb },
];

const companyWebsiteList = [
  { url: "https://aiqicha.baidu.com/s", label: "爱企查" },
];

const companyInfoWebsiteList = [
  { url: "https://beian.miit.gov.cn", label: "工信部" },
  { url: "https://www.creditchina.gov.cn", label: "信用中国" },
  {
    url: "https://www.gsxt.gov.cn/corp-query-homepage.html",
    label: "企业信用",
  },
  { url: "http://zxgk.court.gov.cn/zhzxgk/", label: "执行信息" },
  { url: "https://wenshu.court.gov.cn", label: "裁判文书" },
  { url: "https://xwqy.gsxt.gov.cn", label: "个体私营" },
];

const statisticRef = ref();
const latestJobRef = ref();
const websiteRef = ref();

const tourOpen = ref(false);
</script>

<style scoped>
.statistic {
  .el-col {
    text-align: center;
  }

  padding-top: 10px;
}

.divider {
  margin: 16px;
}

.icon {
  cursor: pointer;
  width: 24px;
  height: 24px;
}

.tagItem {
  margin: 2px;
}

.content {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
}

.left {
  display: flex;
  flex-direction: column;
  overflow: auto;
  scrollbar-width: thin;
  min-width: 200px;
}

.leftSub {
  padding: 10px;
}

.middle {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-right: 10px;
}

.right {
  min-width: 200px;
  max-width: 400px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.logo {
  width: 20px;
  height: 20px;
  padding: 5px;
}

.historyJobItem {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid yellowgreen;
  font-size: 12px;
  overflow-x: clip;
  width: 250px;
}

.jobItem {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.jobItemName {
  width: 150px;
}

.jobItemSalary {
  width: 70px;
  text-align: right;
}

.latestBrowseTitle {
  padding: 10px;
  border: 1px solid #f5f7fa;
  border-top: 0;
  border-bottom: 0;
}

.latestBrowseWrapper {
  flex: 1;
  border: 1px solid #f5f7fa;
  border-top: 0;
  border-bottom: 0;
  min-height: 300px;
}

.latestBrowse {
  display: flex;
  flex: 1;
  flex-direction: column;
  border: 1px solid #f5f7fa;
  border-top: 0;
}

.latestBrowseFooter {
  display: flex;
  justify-content: end;
  border: 1px solid #f5f7fa;
  border-top: 0;
}
</style>

<style lang="scss">
.el-timeline {
  padding: 0;
}
</style>