<template>
    <div class="main">
        <el-scrollbar>
            <el-row>
                <el-col>
                    <el-date-picker type="daterange" range-separator="到" start-placeholder="开始时间" end-placeholder="结束时间"
                        v-model="form.datetimeRange" clearable @change="onClickSearch" />
                    <el-button @click="reset">重置</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8" :span="24">
                    <TaskDataCountChart title="任务执行" class="chart" v-model="chartTaskStatus" />
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8" :span="24">
                    <TaskDataCountChart title="数据上传" class="chart" v-model="chartUploadData" />
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8" :span="24">
                    <TaskDataCountChart title="文件下载" class="chart" v-model="chartDownloadData" />
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8" :span="24">
                    <TaskDataCountChart title="数据合并" class="chart" v-model="chartMergeData" />
                </el-col>
            </el-row>
        </el-scrollbar>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, reactive, onUnmounted } from "vue";
import TaskDataCountChart from "../components/TaskDataCountChart.vue";
import { TaskApi } from "../../../common/api";
import dayjs from "dayjs";
import { genRangeDate } from "../../../common/utils";
import { TASK_CHART_DEFAULT_RANGE_DAY } from "../../../common/config";

const model = defineModel()

const chartUploadData = ref();
const chartDownloadData = ref();
const chartMergeData = ref();
const chartTaskStatus = ref();

let STATUS_NAME_OBJECT = {
    "READY": "准备",
    "RUNNING": "运行中",
    "FINISHED": "完成",
    "FINISHED_BUT_ERROR": "异常完成",
    "ERROR": "错误",
    "CANCEL": "取消",
}

let STATUS_COLOR_OBJECT = {
    "READY": "#73c0de",
    "RUNNING": "#5470c6",
    "FINISHED": "#91cc75",
    "FINISHED_BUT_ERROR": "#fac858",
    "ERROR": "#ee6666",
    "CANCEL": "#111111",
}

let UPLOAD_NAME_OBJECT = {
    "JOB_DATA_UPLOAD": "职位数据",
    "COMPANY_DATA_UPLOAD": "公司数据",
    "COMPANY_TAG_DATA_UPLOAD": "公司标签数据",
}

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

const refresh = async () => {
    let startDate = dayjs(form.datetimeRange[0]);
    let endDate = dayjs(form.datetimeRange[1]);
    chartTaskStatus.value = convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticStatus({ startDate, endDate }), convertNameFunction: convertStatusName, defaultNameArray: Object.keys(STATUS_NAME_OBJECT), defaultColorObject: STATUS_COLOR_OBJECT });
    chartUploadData.value = convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticUpload({ startDate, endDate }), convertNameFunction: convertUploadName, defaultNameArray: Object.keys(UPLOAD_NAME_OBJECT) });
    chartDownloadData.value = convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticDownload({ startDate, endDate }), convertNameFunction: null });
    chartMergeData.value = convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticMerge({ startDate, endDate }), convertNameFunction: null });
}

const convertStatusName = (name) => {
    return STATUS_NAME_OBJECT[name] ?? name;
}

const convertUploadName = (name) => {
    return UPLOAD_NAME_OBJECT[name] ?? name;
}

const convertToChartData = ({ startDate, endDate, queryResult, convertNameFunction, defaultNameArray, defaultColorObject }) => {
    let rangeDate = genRangeDate(startDate, endDate);
    rangeDate.sort();
    let nameArray = null;
    let nameMap = new Map();
    if (defaultNameArray) {
        defaultNameArray.forEach(name => {
            if (!nameMap.has(name)) {
                nameMap.set(name, null);
            }
        });
    }
    queryResult.forEach(item => {
        if (!nameMap.has(item.name)) {
            nameMap.set(item.name, null);
        }
    });
    nameArray = Array.from(nameMap.keys());
    let seriesData = [];
    let nameAndDateTotalMapMap = new Map();
    nameArray.forEach(name => {
        let map = new Map();
        let filterItem = queryResult.filter(item => { return item.name == name });
        filterItem.forEach(filterObj => {
            map.set(filterObj.datetime, filterObj.total);
        });
        nameAndDateTotalMapMap.set(name, map)
    });
    nameArray.forEach(name => {
        let data = [];
        let dateTotalMap = nameAndDateTotalMapMap.get(name);
        rangeDate.forEach(date => {
            data.push((dateTotalMap && dateTotalMap.has(date) ? dateTotalMap.get(date) : 0))
        });
        seriesData.push({ "name": convertNameFunction ? convertNameFunction(name) : name, data, color: defaultColorObject ? defaultColorObject[name] : null });
    });
    return {
        dateData: rangeDate,
        seriesData,
    };
}

</script>
<style lang="css" scoped>
.chart {
    padding: 10px;
    height: 400px;
}
</style>