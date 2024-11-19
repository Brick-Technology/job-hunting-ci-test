<template>
    <div>
        <div class="main">
            <div class="title">{{ props.title }}</div>
            <v-chart :loading="loading" autoresize :option="option" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { BarChart } from "echarts/charts";
import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { onMounted, ref, watch } from "vue";
import VChart from "vue-echarts";

use([
    CanvasRenderer,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    BarChart,
]);

const props = defineProps(["title"]);

const loading = ref(false);

const option = ref({
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            // Use axis to trigger tooltip
            type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
        }
    },
    legend: {},
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'value'
    },
    yAxis: {
        type: 'category',
        data: []
    },
    series: [

    ]
});

const model = defineModel()

onMounted(() => {
});

watch(model, async (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        render();
    }
}
)

const render = async () => {
    loading.value = true;
    let modelValue = model.value;
    if (modelValue) {
        let seriesArray = [];
        modelValue.seriesData.forEach(item => {
            seriesArray.push({
                name: item.name,
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                color:item.color,
                emphasis: {
                    focus: 'series'
                },
                data: item.data
            });
        });
        option.value.yAxis.data = modelValue.dateData;
        option.value.series = seriesArray;
        loading.value = false;
    }
}

</script>
<style lang="css" scoped>
.main {
    box-sizing: border-box;
    border: 1px solid #d0d7de;
    padding: 10px;
    border-radius: 5px;

    .title {
        font-size: 16px;
        font-weight: 600;
    }
}
</style>