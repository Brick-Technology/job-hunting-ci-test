import { Message } from "../../common/api/message";
import { SearchTaskBO } from "../../common/data/bo/searchTaskBO";
import { SearchTaskDTO } from "../../common/data/dto/searchTaskDTO";
import { Task } from "../../common/data/domain/task";
import { BaseService } from "./baseService";
import dayjs from "dayjs";
import { TaskDTO } from "../../common/data/dto/taskDTO";
import {
    TASK_TYPE_COMPANY_DATA_DOWNLOAD, TASK_TYPE_COMPANY_TAG_DATA_DOWNLOAD, TASK_TYPE_JOB_DATA_DOWNLOAD,
    TASK_TYPE_JOB_DATA_UPLOAD, TASK_TYPE_COMPANY_DATA_UPLOAD, TASK_TYPE_COMPANY_TAG_DATA_UPLOAD,
    TASK_TYPE_JOB_DATA_MERGE, TASK_TYPE_COMPANY_DATA_MERGE, TASK_TYPE_COMPANY_TAG_DATA_MERGE
} from "../../common";
import { SERVICE_INSTANCE as taskDataDownloadService } from "./taskDataDownloadService";
import { SERVICE_INSTANCE as taskDataUploadService } from "./taskDataUploadService";
import { SERVICE_INSTANCE as taskDataMergeService } from "./taskDataMergeService";
import { StatisticTaskBO } from "../../common/data/bo/statisticTaskBO";
import { StatisticTaskDTO } from "../../common/data/dto/statisticTaskDTO";
import { postSuccessMessage, postErrorMessage } from "../util";
import { getDb } from "../database";
import { dateToStr } from "../../common/utils";
import { TaskStatisticBO } from "../../common/data/bo/taskStatisticBO";
import { ChartStackedDTO } from "../../common/data/dto/chartStackedDTO";

const SERVICE_INSTANCE = new BaseService("task", "id",
    () => {
        return new Task();
    },
    () => {
        return new SearchTaskDTO();
    },
    (param) => {
        let whereCondition = "";
        if (param.typeList && param.typeList.length > 0) {
            let arraySplitString = "'" + param.typeList.join("','") + "'";
            whereCondition +=
                ` AND type IN (${arraySplitString})`;
        }
        if (param.statusList && param.statusList.length > 0) {
            let arraySplitString = "'" + param.statusList.join("','") + "'";
            whereCondition +=
                ` AND status IN (${arraySplitString})`;
        }
        if (param.endRetryCount) {
            whereCondition += ` AND retry_count < ${param.endRetryCount}`;
        }
        if (param.startDatetimeForCreate) {
            whereCondition +=
                " AND create_datetime >= '" +
                dayjs(param.startDatetimeForCreate).format("YYYY-MM-DD HH:mm:ss") +
                "'";
        }
        if (param.endDatetimeForCreate) {
            whereCondition +=
                " AND create_datetime < '" +
                dayjs(param.endDatetimeForCreate).format("YYYY-MM-DD HH:mm:ss") +
                "'";
        }
        if (param.startDatetimeForUpdate) {
            whereCondition +=
                " AND update_datetime >= '" +
                dayjs(param.startDatetimeForUpdate).format("YYYY-MM-DD HH:mm:ss") +
                "'";
        }
        if (param.endDatetimeForUpdate) {
            whereCondition +=
                " AND update_datetime < '" +
                dayjs(param.endDatetimeForUpdate).format("YYYY-MM-DD HH:mm:ss") +
                "'";
        }
        return whereCondition;
    }
);

function createTypeAndObjectListMap(items) {
    let map = new Map();
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let type = item.type;
        if (!map.has(type)) {
            map.set(type, []);
        }
        map.get(type).push(item);
    }
    return map;
}

async function getDetailObjectList(typeAndObjectListMap) {
    let result = [];
    let typeList = Array.from(typeAndObjectListMap.keys());
    for (let i = 0; i < typeList.length; i++) {
        let type = typeList[i];
        let ids = typeAndObjectListMap.get(type).flatMap(item => item.dataId);
        if (isDownloadType(type)) {
            let items = await taskDataDownloadService._getByIds(ids);
            result.push(...items);
        } else if (isUploadType(type)) {
            let items = await taskDataUploadService._getByIds(ids);
            result.push(...items);
        } else if (isMergeType(type)) {
            let items = await taskDataMergeService._getByIds(ids);
            result.push(...items);
        } else {
            //skip
        }
    }
    return result;
}

function isDownloadType(type) {
    return type == TASK_TYPE_JOB_DATA_DOWNLOAD || type == TASK_TYPE_COMPANY_DATA_DOWNLOAD || type == TASK_TYPE_COMPANY_TAG_DATA_DOWNLOAD;
}

function isUploadType(type) {
    return type == TASK_TYPE_JOB_DATA_UPLOAD || type == TASK_TYPE_COMPANY_DATA_UPLOAD || type == TASK_TYPE_COMPANY_TAG_DATA_UPLOAD;
}

function isMergeType(type) {
    return type == TASK_TYPE_JOB_DATA_MERGE || type == TASK_TYPE_COMPANY_DATA_MERGE || type == TASK_TYPE_COMPANY_TAG_DATA_MERGE;
}

export const TaskService = {
    /**
     * 
     * @param {Message} message 
     * @param {SearchTaskBO} param 
     * 
     * @returns SearchTaskDTO
     */
    searchTask: async function (message, param) {
        SERVICE_INSTANCE.search(message, param);
    },
    /**
     * 
     * @param {Message} message 
     * @param {SearchTaskBO} param 
     * 
     * @returns SearchTaskDTO
     */
    searchTaskWithDetail: async function (message, param) {
        SERVICE_INSTANCE.search(message, param, {
            detailInjectAsyncCallback: async (result) => {
                let targetItemList = [];
                let items = result.items;
                let typeAndObjectListMap = createTypeAndObjectListMap(items);
                let detailObjectList = await getDetailObjectList(typeAndObjectListMap);
                let dataIdAndDetailObjectMap = new Map();
                for (let i = 0; i < detailObjectList.length; i++) {
                    let item = detailObjectList[i];
                    dataIdAndDetailObjectMap.set(item.id, item);
                }
                for (let i = 0; i < items.length; i++) {
                    let targetItem = Object.assign(new TaskDTO(), items[i]);
                    targetItem.detail = dataIdAndDetailObjectMap.get(targetItem.dataId);
                    targetItemList.push(targetItem);
                }
                result.items = targetItemList;
                return result;
            }
        });
    },
    /**
     *
     * @param {Message} message
     * @param {Task} param
     */
    taskAddOrUpdate: async function (message, param) {
        SERVICE_INSTANCE.addOrUpdate(message, param);
    },
    /**
     *
     * @param {Message} message
     * @param {string} param id
     */
    taskDeleteById: async function (message, param) {
        SERVICE_INSTANCE.deleteById(message, param);
    },
    /**
     *
     * @param {Message} message
     * @param {string[]} param ids
     */
    taskDeleteByIds: async function (message, param) {
        SERVICE_INSTANCE.deleteByIds(message, param);
    },
    /**
     *
     * @param {Message} message
     * @param {StatisticTaskBO} param
     */
    statisticTask: async function (message, param) {
        try {
            let result = new StatisticTaskDTO();
            let startDatetime = dateToStr(param.startDatetime);
            let endDatetime = dateToStr(param.endDatetime);

            //upload total
            const uploadTotalSql = `SELECT IFNULL(SUM(t2.data_count),0) AS count FROM task AS t1 LEFT JOIN task_data_upload AS t2 ON t1.data_id = t2.id ${genDatetimeCondition({ datetimeColumn: "t1.update_datetime", startDatetime, endDatetime, otherConditionSql: ` AND t1.status = 'FINISHED' AND t1.type IN ('JOB_DATA_UPLOAD','COMPANY_DATA_UPLOAD','COMPANY_TAG_DATA_UPLOAD')` })}`;
            let uploadRecordTotalCount = [];
            (await getDb()).exec({
                sql: uploadTotalSql,
                rowMode: "object",
                resultRows: uploadRecordTotalCount,
            });
            result.uploadRecordTotalCount = uploadRecordTotalCount[0].count;

            //download total
            const downloadTotalSql = `SELECT IFNULL(COUNT(*),0) AS count FROM task ${genDatetimeCondition({ startDatetime, endDatetime, otherConditionSql: ` AND status = 'FINISHED' AND type IN ('JOB_DATA_DOWNLOAD','COMPANY_DATA_DOWNLOAD','COMPANY_TAG_DATA_DOWNLOAD')` })} `;
            let downloadFileTotalCount = [];
            (await getDb()).exec({
                sql: downloadTotalSql,
                rowMode: "object",
                resultRows: downloadFileTotalCount,
            });
            result.downloadFileTotalCount = downloadFileTotalCount[0].count;

            //merge total
            const mergeTotalSql = `SELECT IFNULL(SUM(data_count),0) AS count FROM task_data_merge ${genDatetimeCondition({ startDatetime, endDatetime })}`;
            let mergeRecordTotalCount = [];
            (await getDb()).exec({
                sql: mergeTotalSql,
                rowMode: "object",
                resultRows: mergeRecordTotalCount,
            });
            result.mergeRecordTotalCount = mergeRecordTotalCount[0].count;

            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] statisticTask error : " + e.message
            );
        }
    },
    /**
     *
     * @param {Message} message
     * @param {TaskStatisticBO} param
     */
    taskStatisticUpload: async function (message, param) {
        try {
            let startDatetime = dateToStr(param.startDatetime);
            let endDatetime = dateToStr(param.endDatetime);
            let sql = `SELECT t1.type AS name,STRFTIME('%Y-%m-%d', t2.update_datetime) AS datetime,IFNULL(SUM(data_count),0) AS total FROM task_data_upload AS t1 LEFT JOIN task AS t2 ON t1.id = t2.data_id WHERE t2.status = 'FINISHED' ${genDatetimeConditionOnJoin({ startDatetime, endDatetime, datetimeColumn: "t2.update_datetime" })} GROUP BY name,datetime,t1.type ORDER BY name,datetime ASC;`;
            let result = await taskStatistic({ sql });
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] taskStatisticUpload error : " + e.message
            );
        }
    },
    /**
     *
     * @param {Message} message
     * @param {TaskStatisticBO} param
     */
    taskStatisticDownload: async function (message, param) {
        try {
            let startDatetime = dateToStr(param.startDatetime);
            let endDatetime = dateToStr(param.endDatetime);
            let sql = `SELECT username AS name,STRFTIME('%Y-%m-%d', datetime) AS datetime,IFNULL(COUNT(*),0) AS total FROM task_data_download AS t1 LEFT JOIN task AS t2 ON t1.id = t2.data_id WHERE t2.status = 'FINISHED' ${genDatetimeConditionOnJoin({ startDatetime, endDatetime, datetimeColumn: "datetime" })} GROUP BY name,datetime ORDER BY name,datetime ASC;`;
            let result = await taskStatistic({ sql });
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] taskStatisticDownload error : " + e.message
            );
        }
    },
    /**
     *
     * @param {Message} message
     * @param {TaskStatisticBO} param
     */
    taskStatisticMerge: async function (message, param) {
        try {
            let startDatetime = dateToStr(param.startDatetime);
            let endDatetime = dateToStr(param.endDatetime);
            let sql = `SELECT username AS name,STRFTIME('%Y-%m-%d', datetime) AS datetime,IFNULL(SUM(data_count),0) AS total FROM task_data_merge ${genDatetimeCondition({ startDatetime, endDatetime, datetimeColumn: "datetime" })} GROUP BY name,datetime ORDER BY name,datetime ASC;`;
            let result = await taskStatistic({ sql });
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] taskStatisticMerge error : " + e.message
            );
        }
    },
    /**
     *
     * @param {Message} message
     * @param {TaskStatisticBO} param
     */
    taskStatisticStatus: async function (message, param) {
        try {
            let startDatetime = dateToStr(param.startDatetime);
            let endDatetime = dateToStr(param.endDatetime);
            let sql = `SELECT status AS name, STRFTIME('%Y-%m-%d', create_datetime) AS datetime,IFNULL(COUNT(status),0) AS total FROM task ${genDatetimeCondition({ startDatetime, endDatetime, datetimeColumn: "create_datetime" })} GROUP BY status,datetime ORDER BY name;`;
            let result = await taskStatistic({ sql });
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] taskStatisticMerge error : " + e.message
            );
        }
    },
};

async function taskStatistic({ sql }) {
    let result = [];
    let resultRows = [];
    (await getDb()).exec({
        sql,
        rowMode: "object",
        resultRows
    });
    resultRows.forEach(item => {
        result.push(Object.assign(new ChartStackedDTO(), item));
    });
    return result;
}

function genDatetimeConditionOnJoin({ startDatetime, endDatetime, otherConditionSql, datetimeColumn }) {
    let whereCondition = "";
    if (startDatetime) {
        whereCondition +=
            ` AND ${datetimeColumn ?? "update_datetime"} >= '` +
            dayjs(startDatetime).format("YYYY-MM-DD HH:mm:ss") +
            "'";
    }
    if (endDatetime) {
        whereCondition +=
            ` AND ${datetimeColumn ?? "update_datetime"} < '` +
            dayjs(endDatetime).format("YYYY-MM-DD HH:mm:ss") +
            "'";
    }
    if (otherConditionSql) {
        whereCondition += otherConditionSql;
    }
    return whereCondition;
}


function genDatetimeCondition({ startDatetime, endDatetime, otherConditionSql, datetimeColumn }) {
    let whereCondition = "";
    if (startDatetime) {
        whereCondition +=
            ` AND ${datetimeColumn ?? "update_datetime"} >= '` +
            dayjs(startDatetime).format("YYYY-MM-DD HH:mm:ss") +
            "'";
    }
    if (endDatetime) {
        whereCondition +=
            ` AND ${datetimeColumn ?? "update_datetime"} < '` +
            dayjs(endDatetime).format("YYYY-MM-DD HH:mm:ss") +
            "'";
    }
    if (otherConditionSql) {
        whereCondition += otherConditionSql;
    }
    if (whereCondition.startsWith(" AND")) {
        whereCondition = whereCondition.replace("AND", "");
        whereCondition = " WHERE " + whereCondition;
    }
    return whereCondition;
}
