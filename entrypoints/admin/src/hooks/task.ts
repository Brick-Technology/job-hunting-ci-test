import { TaskData } from "../data/TaskData";
import { MISSION_AUTO_BROWSE_JOB_SEARCH_PAGE, PLATFORM_51JOB, PLATFORM_BOSS, PLATFORM_ZHILIAN, PLATFORM_LAGOU, PLATFORM_LIEPIN } from "@/common"

export function useTask() {

    const convertTaskList = (items: any[]): Array<TaskData> => {
        let result = [];
        items.forEach(item => {
            result.push(convertTask(item));
        });
        return result;
    }

    const convertTask = (item: any): TaskData => {
        return {
            id: item.missionId,
            name: item.missionName,
            type: item.missionType,
            platform: item.missionPlatform,
            url: item?.missionConfig.url,
            delay: item?.missionConfig.delay,
            delayRange: item?.missionConfig.delayRange,
            maxPage: item?.missionConfig.maxPage,
        };
    }

    const missionPlatformFormat = (value: string) => {
        if (value == PLATFORM_51JOB) {
            return "前程无忧";
        } else if (value == PLATFORM_BOSS) {
            return "BOSS直聘";
        } else if (value == PLATFORM_ZHILIAN) {
            return "智联招聘";
        } else if (value == PLATFORM_LAGOU) {
            return "拉钩网";
        } else if (value == PLATFORM_LIEPIN) {
            return "猎聘网";
        } else {
            return value;
        }
    };

    const missionTypeFormat = (value: string) => {
        if (value == MISSION_AUTO_BROWSE_JOB_SEARCH_PAGE) {
            return "自动浏览职位搜索页";
        } else {
            return value;
        }
    };



    return { convertTask, convertTaskList, missionPlatformFormat, missionTypeFormat }
}

