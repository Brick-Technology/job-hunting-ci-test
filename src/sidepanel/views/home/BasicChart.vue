<template>
    <div>
        <div class="main">
            <div class="title">
                <Icon v-if="props.titleIcon" class="icon" :icon="props.titleIcon" />{{ props.title }}
            </div>
            <v-chart :loading="loading" autoresize :option="option" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { BarChart } from "echarts/charts";
import {
    DataZoomComponent,
    DataZoomSliderComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { onMounted, ref, watch } from "vue";
import VChart from "vue-echarts";
import { Icon } from "@iconify/vue";
import * as echarts from 'echarts';
import { convertToAbbreviation } from "../../../common/utils";

use([
    CanvasRenderer,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
    DataZoomSliderComponent,
    BarChart,
]);

const props = defineProps(["title", "titleIcon", "xTitleRotate"]);

const loading = ref(false);

const option = ref({
    xAxis: {
        type: 'category',
        data: [],
        axisLabel: { rotate: props.xTitleRotate ?? 0 }
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: function (value, index) {
                return convertToAbbreviation(value);
            }
        }
    },
    dataZoom: [
        {
            type: 'inside'
        }
    ],
    tooltip: {
        show: true,
    },
    series: [
        {
            data: [],
            type: 'bar',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 0.5, color: '#188df0' },
                    { offset: 1, color: '#188df0' }
                ])
            },

        },
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
        option.value.xAxis.data = modelValue.nameArray;
        option.value.series[0].data = modelValue.dataArray;
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
        display: flex;
        align-items: flex-end;
    }

    .icon {
        font-size: 25px;
        padding-right: 5px;
    }
}
</style>