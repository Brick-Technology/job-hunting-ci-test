<template>
    <div class="main">
        <el-scrollbar>
            <el-row>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" :span="24">
                    <BasicChart title="职位发布时间分析(按月)" titleIcon="hugeicons:job-search" class="chart"
                        v-model="chartJobPublishByMonth" />
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" :span="24">
                    <BasicChart title="职位发布时间分析(按周)" titleIcon="hugeicons:job-search" class="chart"
                        v-model="chartJobPublishByWeek" />
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" :span="24">
                    <BasicChart title="职位发布时间分析(按日)" titleIcon="hugeicons:job-search" class="chart"
                        v-model="chartJobPublishByDay" />
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" :span="24">
                    <BasicChart title="职位发布时间分析(按小时)" titleIcon="hugeicons:job-search" class="chart"
                        v-model="chartJobPublishByHour" />
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" :span="24">
                    <BasicChart title="职位发布平台分析" titleIcon="hugeicons:job-search" class="chart" :xTitleRotate="45"
                        v-model="chartJobPublishByPlatform" />
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" :span="24">
                    <BasicChart title="公司成立年份分段分析" titleIcon="mdi:company" class="chart"
                        v-model="chartCompanyStartDate" />
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" :span="24">
                    <BasicChart title="公司社保人数分段分析" titleIcon="mdi:company" class="chart"
                        v-model="chartCompanyInsurance" />
                </el-col>
            </el-row>
        </el-scrollbar>
    </div>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { JobApi, CompanyApi } from "../../../common/api";
import { TASK_CHART_DEFAULT_RANGE_DAY } from "../../../common/config";
import { PLATFORM_BOSS, PLATFORM_51JOB, PLATFORM_ZHILIAN, PLATFORM_LAGOU, PLATFORM_LIEPIN, PLATFORM_JOBSDB } from "../../../common";
import BasicChart from "./BasicChart.vue";
import { JobStatisticGrouByPublishDateBO, TYPE_ENUM_MONTH, TYPE_ENUM_WEEK, TYPE_ENUM_DAY, TYPE_ENUM_HOUR } from "../../../common/data/bo/jobStatisticGrouByPublishDateBO";
import { useJob } from "../../hook/job";

const model = defineModel()

const chartJobPublishByMonth = ref();
const chartJobPublishByWeek = ref();
const chartJobPublishByDay = ref();
const chartJobPublishByHour = ref();
const chartJobPublishByPlatform = ref();
const chartCompanyStartDate = ref();
const chartCompanyInsurance = ref();

const onClickSearch = async () => {
    refresh();
};

const reset = async () => {
    let now = dayjs().startOf('day');
    let startDate = dayjs(now.subtract(TASK_CHART_DEFAULT_RANGE_DAY, "day")).toDate();
    let endDate = dayjs(now).toDate();
    form.datetimeRange[0] = startDate;
    form.datetimeRange[1] = endDate;
    refresh();
};

const form = reactive({
    datetimeRange: [],
})

let refreshIntervalId = null;

onMounted(async () => {
    reset();
    refreshIntervalId = setInterval(refresh, 5000);
});

onUnmounted(() => {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }
});

const genNumberArray = (start, count) => {
    let result = [];
    for (let i = start; i <= count; i++) {
        result.push(i.toString().padStart(2, '0'));
    }
    return result;
}

let MONTH_NAME_OBJECT = {
    "01": "一月",
    "02": "二月",
    "03": "三月",
    "04": "四月",
    "05": "五月",
    "06": "六月",
    "07": "七月",
    "08": "八月",
    "09": "九月",
    "10": "十月",
    "11": "十一月",
    "12": "十二月",
}

const MONTH_NAME_ARRAY = genNumberArray(1, 12);

const convertMonthName = (name) => {
    return MONTH_NAME_OBJECT[name] ?? name;
}

let WEEK_NAME_OBJECT = {
    "0": "星期日",
    "1": "星期一",
    "2": "星期二",
    "3": "星期三",
    "4": "星期四",
    "5": "星期五",
    "6": "星期六",
}
let WEEK_NAME_ARRAY = ["1", "2", "3", "4", "5", "6", "0"];
const convertWeekName = (name) => {
    return WEEK_NAME_OBJECT[name] ?? name;
}

const DAY_NAME_ARRAY = genNumberArray(1, 31);
const HOUR_NAME_ARRAY = genNumberArray(0, 23);

const PLATFORM_NAME_ARRAY = [PLATFORM_BOSS, PLATFORM_51JOB, PLATFORM_ZHILIAN, PLATFORM_LAGOU, PLATFORM_LIEPIN, PLATFORM_JOBSDB];

const { platformFormat } = useJob();

const COMPANY_START_DATE_NAME_ARRAY = ["<1", "1-3", "3-5", "5-10", "10-20", ">20"];
const COMPANY_INSURANCE_NAME_ARRAY = ["-", "<10", "10-20", "20-50", "50-100", "100-500", "500-1000", ">1000"];
let COMPANY_INSURANCE_OBJECT = {
    "-": "?",
}
const convertCompanyInsuranceName = (name) => {
    return COMPANY_INSURANCE_OBJECT[name] ?? name;
}

const refresh = async () => {
    chartJobPublishByMonth.value = convertToChartData({ queryResult: await JobApi.jobStatisticGrouByPublishDate(new JobStatisticGrouByPublishDateBO(TYPE_ENUM_MONTH)), defaultNameArray: MONTH_NAME_ARRAY, convertNameFunction: convertMonthName });
    chartJobPublishByWeek.value = convertToChartData({ queryResult: await JobApi.jobStatisticGrouByPublishDate(new JobStatisticGrouByPublishDateBO(TYPE_ENUM_WEEK)), defaultNameArray: WEEK_NAME_ARRAY, convertNameFunction: convertWeekName });
    chartJobPublishByDay.value = convertToChartData({ queryResult: await JobApi.jobStatisticGrouByPublishDate(new JobStatisticGrouByPublishDateBO(TYPE_ENUM_DAY)), defaultNameArray: DAY_NAME_ARRAY });
    chartJobPublishByHour.value = convertToChartData({ queryResult: await JobApi.jobStatisticGrouByPublishDate(new JobStatisticGrouByPublishDateBO(TYPE_ENUM_HOUR)), defaultNameArray: HOUR_NAME_ARRAY });
    chartJobPublishByPlatform.value = convertToChartData({ queryResult: await JobApi.jobStatisticGrouByPlatform(), defaultNameArray: PLATFORM_NAME_ARRAY, convertNameFunction: platformFormat.value });

    chartCompanyStartDate.value = convertToChartData({ queryResult: await CompanyApi.companyStatisticGrouByStartDate(), defaultNameArray: COMPANY_START_DATE_NAME_ARRAY });
    chartCompanyInsurance.value = convertToChartData({ queryResult: await CompanyApi.companyStatisticGrouByInsurance(), defaultNameArray: COMPANY_INSURANCE_NAME_ARRAY, convertNameFunction: convertCompanyInsuranceName });
}

const convertToChartData = ({ queryResult, convertNameFunction, defaultNameArray }) => {
    let nameArray = [];
    let dataArray = [];
    let nameMap = new Map();
    if (defaultNameArray) {
        defaultNameArray.forEach(name => {
            nameMap.set(name, null);
            nameArray.push(name)
        });
    }
    queryResult.forEach(item => {
        if (!nameMap.has(item.name)) {
            nameArray.push(item.name)
        }
    });
    let convertNameArray = [];
    nameArray.forEach(name => {
        let filterItem = queryResult.filter(item => { return item.name == name });
        dataArray.push(filterItem.length > 0 ? filterItem[0].total : 0);
        if (convertNameFunction) {
            convertNameArray.push(convertNameFunction(name))
        } else {
            convertNameArray.push(name);
        }
    });
    return {
        nameArray: convertNameArray,
        dataArray,
    };
}

</script>
<style lang="css" scoped>
.chart {
    padding: 10px;
    height: 400px;
}
</style>