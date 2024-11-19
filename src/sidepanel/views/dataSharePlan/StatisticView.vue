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
import { onMounted, ref, reactive } from "vue";
import TaskDataCountChart from "../components/TaskDataCountChart.vue";
import { TaskApi } from "../../../common/api";
import dayjs from "dayjs";
import { genRangeDate } from "../../../common/utils";

const model = defineModel()

const chartUploadData = ref();
const chartDownloadData = ref();
const chartMergeData = ref();

const CHART_RANGE_DAY = 14;

const onClickSearch = async () => {
    refresh();
};

const reset = async () => {
    let now = dayjs().startOf('day');
    let startDate = dayjs(now.subtract(CHART_RANGE_DAY, "day")).toDate();
    let endDate = dayjs(now).toDate();
    form.datetimeRange[0] = startDate;
    form.datetimeRange[1] = endDate;
    refresh();
};

const form = reactive({
    datetimeRange: [],
})

onMounted(async () => {
    reset();
});

const refresh = async () => {
    let startDate = dayjs(form.datetimeRange[0]);
    let endDate = dayjs(form.datetimeRange[1]);
    chartUploadData.value = convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticUpload({ startDate, endDate }), convertNameFunction: convertUploadName });
    chartDownloadData.value = convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticDownload({ startDate, endDate }), convertNameFunction: null });
    chartMergeData.value = convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticMerge({ startDate, endDate }), convertNameFunction: null });
}

let UPLOAD_NAME_OBJECT = {
    "JOB_DATA_UPLOAD": "职位数据",
    "COMPANY_DATA_UPLOAD": "公司数据",
    "COMPANY_TAG_DATA_UPLOAD": "公司标签数据",
}

const convertUploadName = (name) => {
    return UPLOAD_NAME_OBJECT[name] ?? name;
}

const convertToChartData = ({ startDate, endDate, queryResult, convertNameFunction }) => {
    let rangeDate = genRangeDate(startDate, endDate);
    rangeDate.sort();
    let nameMap = new Map();
    queryResult.forEach(item => {
        if (!nameMap.has(item.name)) {
            nameMap.set(item.name, null);
        }
    });
    let seriesData = [];
    let nameArray = Array.from(nameMap.keys());
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
        seriesData.push({ "name": convertNameFunction ? convertNameFunction(name) : name, data });
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
}
</style>