<template>
    <el-tabs type="card" class="tabs">
        <el-tab-pane class="tab_panel" label="查看">
            <div class="content">
                <el-scrollbar ref="scrollbar" class="left" v-loading="searchLoading">
                    <div class="leftSub" ref="latestJobRef" v-loading="searchLoading">
                        <el-timeline v-if="tableData.length > 0">
                            <el-timeline-item v-for="(item, index) in tableData" :key="index"
                                :timestamp="item.latestBrowseDetailDatetime" v-show="item.latestBrowseDetailDatetime">
                                <JobItemCard :item="item" :key="item.jobId" @map-locate="onJobMapLocate(item)">
                                </JobItemCard>
                            </el-timeline-item>
                        </el-timeline>
                        <el-text v-else>无</el-text>
                    </div>
                </el-scrollbar>
                <div class="middle">
                    <div class="mapWrapper">
                        <l-map id="map" ref="map" v-model:zoom="zoom">
                            <l-tile-layer
                                url="http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
                                :subdomains="['1', '2', '3', '4']"></l-tile-layer>
                            <l-marker-cluster-group>
                                <l-marker v-for="(item, index) in tableData"
                                    :lat-lng="[item.jobLatitude, item.jobLongitude]">
                                    <l-popup ref="popups" :lat-lng="[item.jobLatitude, item.jobLongitude]">
                                        <MapJobDetail :key="item.jobId" :item="item"></MapJobDetail>
                                    </l-popup>
                                    <l-icon className="icon" :key="item.jobId">
                                        <MapJobIcon :key="item.jobId" :item="item"></MapJobIcon>
                                    </l-icon>
                                </l-marker>
                            </l-marker-cluster-group>
                        </l-map>
                    </div>
                </div>
            </div>
            <el-row>
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100, 200, 500, 1000]" :small="small" :disabled="disabled"
                    :background="background" layout="total, sizes, prev, pager, next" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </el-row>
        </el-tab-pane>
    </el-tabs>
</template>
<script lang="ts" setup>
import { wgs84ToGcj02 } from "@pansy/lnglat-transform";
import {
    LIcon,
    LMap,
    LMarker,
    LPopup,
    LTileLayer,
} from "@vue-leaflet/vue-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    computed,
    onMounted,
    ref
} from 'vue';
import { LMarkerClusterGroup } from "vue-leaflet-markercluster";
import "vue-leaflet-markercluster/dist/style.css";
import { JobApi } from "../../../common/api/index.js";
import { UI_DEFAULT_PAGE_SIZE } from "../../../common/config";
import { SearchJobBO } from "../../../common/data/bo/searchJobBO";
import JobItemCard from '../../components/JobItemCard.vue';
import MapJobDetail from "../../components/MapJobDetail.vue";
import MapJobIcon from "../../components/MapJobIcon.vue";
globalThis.L = L;

const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(UI_DEFAULT_PAGE_SIZE);
const total = ref(0);
const small = ref(false);
const background = ref(false);
const disabled = ref(false);
const scrollbar = ref();
const searchLoading = ref(false);
const map = ref();
const popups = ref([]);
const zoom = ref(10);

onMounted(async () => {
    await search();
    if (popups.value.length > 0) {
        map.value.leafletObject.fitBounds(popups.value.map((item) => item.latLng));
    } else {
        map.value.leafletObject.setView([39.906217, 116.3912757], 4);
    }
    if (popups.value && popups.value.length > 0) {
        let firstPopup = popups.value[0];
        firstPopup.leafletObject.openOn(map.value.leafletObject);
        //TODO clean the timeout
        setTimeout(() => {
            map.value.leafletObject.flyTo(firstPopup.latLng);
        }, 300);
    }
});

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

const idAndPopupIndexMap = computed(() => {
    let result = new Map();
    let filtered = tableData.value.filter(
        (item) => item.jobLatitude && item.jobLongitude
    );
    filtered.forEach((element, index) => {
        result.set(element.jobId, index);
    });
    return result;
});

const onJobMapLocate = (item) => {
    let popUpIndex = idAndPopupIndexMap.value.get(item.jobId);
    let popUpObject = popups.value[popUpIndex];
    popUpObject.leafletObject.openOn(map.value.leafletObject);
    map.value.leafletObject.flyTo(popUpObject.latLng, 14);
};

</script>
<style lang="scss" scoped>
.tabs {
    display: flex;
    flex-direction: column-reverse;
    height: 100%;
}

.tab_panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    width: 100%;
}

.content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.left {
    display: flex;
    overflow: auto;
    padding-right: 10px;
    scrollbar-width: thin;

}

.mapWrapper {
    flex: 1;
}

.middle {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-right: 10px;
}
</style>
<style lang="scss">
.el-tabs__content {
    display: flex;
    flex: 1;
    width: 100%
}
</style>