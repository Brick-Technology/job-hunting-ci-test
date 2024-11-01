<template>
    <div class="mapIcon">
        <el-row class="jobNameWrapper">
            <img class="logo" :src="platformLogo(item.jobPlatform)" alt="logo" />
            <el-text line-clamp="1"> {{ item.jobName }}</el-text>
        </el-row>
        <el-row>
            <el-text line-clamp="1">💵{{ item.jobSalaryMin }} - 💵{{
                item.jobSalaryMax
                }}</el-text>
        </el-row>
        <el-row>
            <el-text line-clamp="1">{{ item.jobCompanyName }}</el-text>
        </el-row>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { JobDTO } from "../../common/data/dto/jobDTO";
import dayjs from "dayjs";
import { useJob } from "../hook/job";

const { platformLogo } = useJob()

const props = defineProps({
    item: JobDTO,
});
const item = ref({});
item.value = props.item;

</script>
<style lang="css" scoped>
.mapIcon {
    width: 200px;
    background-color: lightgoldenrodyellow;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid yellowgreen;
}

.logo {
    width: 15px;
    height: 15px;
    margin-right: 2px;
}

.jobNameWrapper {
    flex-wrap: nowrap;
    align-items: center;
}
</style>
