import { genRangeDate } from "@/common/utils";
import { SeriesData, StackBarData } from "../data/chart/StackBarData";

export function useDataSharePlan() {

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

    const convertStatusName = (name) => {
        return STATUS_NAME_OBJECT[name] ?? name;
    }

    const convertUploadName = (name) => {
        return UPLOAD_NAME_OBJECT[name] ?? name;
    }

    const convertToChartData = ({ startDate, endDate, queryResult, convertNameFunction = null, defaultNameArray = null, defaultColorObject = null }): StackBarData => {
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
        let seriesData: SeriesData[] = [];
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
        }
    }

    return {
        convertToChartData, convertUploadName, convertStatusName,
        STATUS_COLOR_OBJECT, STATUS_NAME_OBJECT, UPLOAD_NAME_OBJECT
    }

}