import { computed } from 'vue'
import {
    PLATFORM_51JOB,
    PLATFORM_BOSS,
    PLATFORM_LAGOU,
    PLATFORM_LIEPIN,
    PLATFORM_ZHILIAN,
    PLATFORM_JOBSDB,
} from "../../common";

import { logo } from "../assets";

export function useJob() {

    const platformFormat = computed(() => {
        return function (value: string) {
            switch (value) {
                case PLATFORM_BOSS:
                    return "BOSS直聘";
                case PLATFORM_51JOB:
                    return "前程无忧";
                case PLATFORM_LAGOU:
                    return "拉钩网";
                case PLATFORM_LIEPIN:
                    return "猎聘网";
                case PLATFORM_ZHILIAN:
                    return "智联招聘";
                default:
                    return value;
            }
        };
    });

    const platformLogo = computed(() => {
        return function (value: string) {
            switch (value) {
                case PLATFORM_BOSS:
                    return logo.boss;
                case PLATFORM_51JOB:
                    return logo.job51;
                case PLATFORM_LAGOU:
                    return logo.lagou;
                case PLATFORM_LIEPIN:
                    return logo.liepin;
                case PLATFORM_ZHILIAN:
                    return logo.zhilian;
                case PLATFORM_JOBSDB:
                    return logo.jobsdb;
                default:
                    return "";
            }
        };
    });

    return { platformFormat,platformLogo }

}

