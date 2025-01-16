import dayjs from "dayjs";
import { Message } from "../../../common/api/message";
import { JobTagBatchAddOrUpdateBO } from "../../../common/data/bo/jobTagBatchAddOrUpdateBO";
import { JobTagBO } from "../../../common/data/bo/jobTagBO";
import { JobTagExportBO } from "../../../common/data/bo/jobTagExportBO";
import { JobTagNameStatisticBO } from "../../../common/data/bo/jobTagNameStatisticBO";
import { JobTagSearchBO } from "../../../common/data/bo/jobTagSearchBO";
import { JobTag } from "../../../common/data/domain/jobTag";
import { JobTagDTO } from "../../../common/data/dto/jobTagDTO";
import { JobTagNameStatisticDTO } from "../../../common/data/dto/jobTagNameStatisticDTO";
import { JobTagSearchDTO } from "../../../common/data/dto/jobTagSearchDTO";
import { JobTagStatisticDTO } from "../../../common/data/dto/jobTagStatisticDTO";
import { genIdFromText, genUniqueId, isBlank } from "../../../common/utils";
import { beginTransaction, commitTransaction, getAll, getDb, rollbackTransaction } from "../database";
import { postErrorMessage, postSuccessMessage } from "../util";
import { BaseService } from "./baseService";
import { _getByIds as _jobGetByIds } from "./jobService";
import { _addNotExistsTags, _searchWithTagInfo } from "./tagService";
const JOB_ID_COLUMN = "job_id";

const SERVICE_INSTANCE = new BaseService("job_tag", "id",
    () => {
        return new JobTag();
    },
    () => {
        return new JobTagSearchDTO();
    },
    (param) => {
        let whereCondition = "";
        return whereCondition;
    }
);

export const JobTagService = {
    /**
     * 
     * @param {*} message 
     * @param {JobTagSearchBO} param 
     */
    jobTagSearch: async function (message, param) {
        try {
            let result = await _searchWithTagInfo({
                param,
                cerateResultDTOFunction: () => {
                    return new JobTagSearchDTO()
                },
                createResultItemDTOFunction: () => {
                    return new JobTagDTO();
                },
                genSqlSearchQueryFunction: () => {
                    let whereCondition = "";
                    if (param.tagIds && param.tagIds.length > 0) {
                        let ids = "'" + param.tagIds.join("','") + "'";
                        whereCondition +=
                            ` AND t1.tag_id IN (${ids})`;
                    }
                    if (param.tagNames && param.tagNames.length > 0) {
                        const tagIds = param.tagNames.map(item => { return genIdFromText(item) });
                        const ids = "'" + tagIds.join("','") + "'";
                        whereCondition +=
                            ` AND t1.tag_id IN (${ids})`;
                    }
                    if (param.tagIds && param.tagIds.length > 0) {
                        const ids = "'" + param.tagIds.join("','") + "'";
                        whereCondition +=
                            ` AND t1.tag_id IN (${ids})`;
                    }
                    if (whereCondition.startsWith(" AND")) {
                        whereCondition = whereCondition.replace("AND", "");
                        whereCondition = " WHERE " + whereCondition;
                    }
                    return `
                    SELECT t1.id AS id, t1.job_id AS jobId, t1.create_datetime AS createDatetime, MAX(t1.update_datetime) AS updateDatetime FROM job_tag AS t1  LEFT JOIN tag AS t2 ON t1.tag_id = t2.tag_id ${whereCondition} GROUP BY t1.job_id
                    `;
                },
                genSearchWhereConditionSqlFunction: () => {
                    let whereCondition = "";
                    if (param.startDatetimeForUpdate) {
                        whereCondition +=
                            " AND updateDatetime >= '" +
                            dayjs(param.startDatetimeForUpdate).format("YYYY-MM-DD HH:mm:ss") +
                            "'";
                    }
                    if (param.endDatetimeForUpdate) {
                        whereCondition +=
                            " AND updateDatetime < '" +
                            dayjs(param.endDatetimeForUpdate).format("YYYY-MM-DD HH:mm:ss") +
                            "'";
                    }
                    if (whereCondition.startsWith(" AND")) {
                        whereCondition = whereCondition.replace("AND", "");
                        whereCondition = " HAVING " + whereCondition;
                    }
                    return whereCondition;
                },
                idColumn: "jobId",
                getAllDTOByIdsFunction: async (ids) => {
                    return _getAllJobTagDTOByJobIds(ids);
                }
            });
            let items = result.items;
            if (items && items.length > 0) {
                let jobIds = [];
                let jobIdAndItemMap = new Map();
                items.forEach(item => {
                    jobIds.push(item.jobId);
                    jobIdAndItemMap.set(item.jobId, item);
                });
                let jobs = await _jobGetByIds(jobIds);
                if (jobs && jobs.length > 0) {
                    jobs.forEach(item => {
                        if (jobIdAndItemMap.has(item.jobId)) {
                            jobIdAndItemMap.get(item.jobId).job = item;
                        }
                    });
                }
            }
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(message, "[worker] jobTagSearch error : " + e.message);
        }
    },
    /**
     *
     * @param {Message} message
     * @param {string[]} param jobIds
     */
    jobTagDeleteByJobIds: async function (message, param) {
        SERVICE_INSTANCE.deleteByIds(message, param, JOB_ID_COLUMN);
    },
    /**
     * 
     * @param {Message} message 
     * @param {JobTagBO} param 
     */
    jobTagAddOrUpdate: async function (message, param) {
        try {
            await beginTransaction()
            await _addOrUpdateJobTag(param);
            await commitTransaction();
            postSuccessMessage(message, {});
        } catch (e) {
            await rollbackTransaction();
            postErrorMessage(
                message,
                "[worker] jobTagAddOrUpdate error : " + e.message
            );
        }
    },
    /**
     * 
     * @param {Message} message 
     * @param {JobTagBatchAddOrUpdateBO} param 
     */
    jobTagBatchAddOrUpdate: async function (message, param) {
        try {
            for (let i = 0; i < param.items.length; i++) {
                await _addOrUpdateJobTag(param.items[i], param.overrideUpdateDatetime);
            }
            postSuccessMessage(message, {});
        } catch (e) {
            await rollbackTransaction();
            postErrorMessage(
                message,
                "[worker] jobTagBatchAddOrUpdate error : " + e.message
            );
        }
    },
    /**
     * 
     * @param {Message} message 
     * @param {JobTagBatchAddOrUpdateBO} param 
     */
    jobTagBatchAddOrUpdateWithTransaction: async function (message, param) {
        try {
            await beginTransaction()
            for (let i = 0; i < param.items.length; i++) {
                await _addOrUpdateJobTag(param.items[i], param.overrideUpdateDatetime);
            }
            await commitTransaction();
            postSuccessMessage(message, {});
        } catch (e) {
            await rollbackTransaction();
            postErrorMessage(
                message,
                "[worker] batchAddOrUpdateJobTagWithTransaction error : " + e.message
            );
        }
    },
    /**
     *
     * @param {Message} message
     * @param {string} param jobId
     *
     * @returns JobTagDTO[]
     */
    jobTagGetAllDTOByJobId: async function (message, param) {
        try {
            postSuccessMessage(
                message,
                await _getAllJobTagDTOByJobId(param)
            );
        } catch (e) {
            postErrorMessage(message, "[worker] jobTagGetAllDTOByJobId error : " + e.message);
        }
    },
    /**
     *
     * @param {Message} message
     * @param {string[]} param ids
     *
     * @returns JobTagDTO[]
     */
    jobTagGetAllDTOByJobIds: async function (message, param) {
        try {
            postSuccessMessage(
                message,
                await _getAllJobTagDTOByJobIds(param)
            );
        } catch (e) {
            postErrorMessage(message, "[worker] jobTagGetAllDTOByJobIds error : " + e.message);
        }
    },

    /**
   *
   * @param {Message} message
   * @param {*} param
   *
   * @returns {JobTagStatisticDTO}
   */
    jobTagStatistic: async function (message, param) {
        try {
            let result = new JobTagStatisticDTO();
            let totalTagQueryResult = [];
            (await getDb()).exec({
                sql: `SELECT COUNT(*) AS count FROM tag`,
                rowMode: "object",
                resultRows: totalTagQueryResult,
            });
            let totalJobTagRecordQueryResult = [];
            (await getDb()).exec({
                sql: `SELECT COUNT(*) AS count FROM job_tag`,
                rowMode: "object",
                resultRows: totalJobTagRecordQueryResult,
            });
            let totalTagJobQueryResult = [];
            (await getDb()).exec({
                sql: `SELECT COUNT(DISTINCT job_id) AS count FROM job_tag`,
                rowMode: "object",
                resultRows: totalTagJobQueryResult,
            });
            result.totalTag = totalTagQueryResult[0].count;
            result.totalJobTagRecord = totalJobTagRecordQueryResult[0].count;
            result.totalTagJob = totalTagJobQueryResult[0].count;
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] jobTagStatistic error : " + e.message
            );
        }
    },
    /**
     *
     * @param {Message} message
     * @param {JobTagExportBO} param
     *
     * @returns JobTagExportDTO[]
     */
    jobTagExport: async function (message, param) {
        try {
            postSuccessMessage(
                message,
                await _jobTagExport(param)
            );
        } catch (e) {
            postErrorMessage(message, "[worker] jobTagExport error : " + e.message);
        }
    },
    /**
   *
   * @param {Message} message
   * @param {JobTagNameStatisticBO} param
   *
   * @returns {JobTagNameStatisticDTO}
   */
    jobTagNameStatistic: async function (message, param) {
        try {
            let limitStart = (param.pageNum - 1) * param.pageSize;
            let limitEnd = param.pageSize;
            let limit = " limit " + limitStart + "," + limitEnd;
            let result = new JobTagNameStatisticDTO();
            let sqlTagNameTotal = `SELECT tag_name AS name,COUNT(t1.job_id) AS count FROM job_tag t1 LEFT JOIN tag t2 ON t1.tag_id = t2.tag_id GROUP BY t1.tag_id ORDER BY count DESC ${limit}`;
            let totalTagNameTotalQueryResult = [];
            (await getDb()).exec({
                sql: sqlTagNameTotal,
                rowMode: "object",
                resultRows: totalTagNameTotalQueryResult,
            });
            let totalJobQueryResult = [];
            (await getDb()).exec({
                sql: `SELECT COUNT(*) total FROM (SELECT t1.job_id FROM job_tag  t1 GROUP BY t1.job_id) t1`,
                rowMode: "object",
                resultRows: totalJobQueryResult,
            });
            result.items = totalTagNameTotalQueryResult;
            result.total = totalJobQueryResult[0].total;
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] jobTagNameStatistic error : " + e.message
            );
        }
    },
};

/**
 * 
 * @param {JobTagExportBO} param 
 */
async function _jobTagExport(param) {
    let joinCondition = "";
    if (param.startDatetimeForUpdate) {
        joinCondition +=
            " AND t1.update_datetime >= '" +
            dayjs(param.startDatetimeForUpdate).format("YYYY-MM-DD HH:mm:ss") +
            "'";
    }
    if (param.endDatetimeForUpdate) {
        joinCondition +=
            " AND t1.update_datetime < '" +
            dayjs(param.endDatetimeForUpdate).format("YYYY-MM-DD HH:mm:ss") +
            "'";
    }
    if (param.jobIds) {
        let idsString = "'" + param.jobIds.join("','") + "'";
        joinCondition +=
            ` AND t1.job_id in (${idsString})`;
    }
    let whereCondition = "";
    if (param.source != null) {
        if (isBlank(param.source)) {
            whereCondition +=
                `AND t1.source IS NULL`
        } else {
            whereCondition +=
                `AND t1.source = '${param.source}'`
        }
    }
    if (param.isPublic != null) {
        whereCondition += ` AND t2.is_public = ${param.isPublic}`
    }
    let sqlQuery = `SELECT t1.job_id AS jobId,GROUP_CONCAT(t2.tag_name) AS tagNameArray,MAX(t1.update_datetime) AS updateDatetime FROM job_tag AS t1 LEFT JOIN tag AS t2 ON t1.tag_id = t2.tag_id ${joinCondition} WHERE t1.source_type = 0 ${whereCondition} GROUP BY t1.job_id ORDER BY t1.seq ASC;`;
    let queryRows = [];
    (await getDb()).exec({
        sql: sqlQuery,
        rowMode: "object",
        resultRows: queryRows,
    });
    return queryRows;
}

/**
 * 
 * @param {JobTagBO} param 
 */
export async function _addOrUpdateJobTag(param, overrideUpdateDatetime) {
    await _addNotExistsTags(param.tags);
    let jobId = param.jobId;
    await SERVICE_INSTANCE._deleteById(param.jobId, JOB_ID_COLUMN, { otherCondition: `source_type=${param.sourceType} AND ${param.source ? "source = '" + param.source + "'" : "source IS NULL"}` });
    for (let i = 0; i < param.tags.length; i++) {
        let tagName = param.tags[i];
        let tagId = genIdFromText(tagName);
        let jobTag = new JobTag();
        jobTag.id = genUniqueId();
        jobTag.jobId = jobId;
        jobTag.tagId = tagId;
        jobTag.seq = i;
        jobTag.sourceType = param.sourceType;
        jobTag.source = param.source;
        jobTag.updateDatetime = param.updateDatetime;
        await SERVICE_INSTANCE._addOrUpdate(jobTag, { overrideUpdateDatetime });
    }
}

/**
 * 
 * @param {JobTagBO[]} jobTagBOs 
 */
export async function _batchAddOrUpdateJobTag(jobTagBOs, overrideUpdateDatetime) {
    let allTags = [];
    jobTagBOs.map(item => { return item.tags }).forEach(items => {
        allTags.push(...items);
    })
    await _addNotExistsTags(allTags);
    let sourceTypeSourceAndJobIdsMap = new Map();
    let sourceTypeSourceAndSourceTypeMap = new Map();
    let sourceTypeSourceAndSourceMap = new Map();
    for (let i = 0; i < jobTagBOs.length; i++) {
        let item = jobTagBOs[i];
        let key = item.sourceType + "_" + item.source;
        if (!sourceTypeSourceAndJobIdsMap.has(key)) {
            sourceTypeSourceAndJobIdsMap.set(key, []);
            sourceTypeSourceAndSourceTypeMap.set(key, item.sourceType);
            sourceTypeSourceAndSourceMap.set(key, item.source);
        }
        sourceTypeSourceAndJobIdsMap.get(key).push(item.jobId);
    }
    sourceTypeSourceAndJobIdsMap.forEach(async (value, key, map) => {
        let ids = sourceTypeSourceAndJobIdsMap.get(key);
        let sourceType = sourceTypeSourceAndSourceTypeMap.get(key);
        let source = sourceTypeSourceAndSourceMap.get(key);
        await SERVICE_INSTANCE._deleteByIds(ids, JOB_ID_COLUMN, { otherCondition: `source_type=${sourceType} AND ${source ? "source = '" + source + "'" : "source IS NULL"}` });
    });
    let jobTags = [];
    for (let i = 0; i < jobTagBOs.length; i++) {
        let item = jobTagBOs[i];
        let jobId = item.jobId;
        for (let i = 0; i < item.tags.length; i++) {
            let tagName = item.tags[i];
            let tagId = genIdFromText(tagName);
            let jobTag = new JobTag();
            jobTag.id = genUniqueId();
            jobTag.jobId = jobId;
            jobTag.tagId = tagId;
            jobTag.seq = i;
            jobTag.sourceType = item.sourceType;
            jobTag.source = item.source;
            jobTag.updateDatetime = item.updateDatetime;
            jobTags.push(jobTag);
        }
    }
    await SERVICE_INSTANCE._batchAddOrUpdate(jobTags, { overrideUpdateDatetime });
}

/**
 * 
 * @param {string} param id
 * 
 * @return JobTagDTO[]
 */
export async function _getAllJobTagDTOByJobId(param) {
    return getAll(SQL_SELECT_DTO_BY_JOB_ID, [param], new JobTagDTO());
}

/**
 * 
 * @param {string[]} param ids
 * 
 * @return JobTagDTO[]
 */
export async function _getAllJobTagDTOByJobIds(param) {
    let sql = genSqlSelectDTOByJobIds(param);
    return await getAll(sql, [], new JobTagDTO());
}

const SQL_SELECT_DTO_BY_JOB_ID = `
SELECT t1.id, t1.job_id, t1.tag_id, t2.tag_name,t1.seq ,t1.create_datetime, t1.update_datetime,t1.source_type,t1.source,t2.is_public FROM job_tag AS t1  LEFT JOIN tag AS t2 ON t1.tag_id = t2.tag_id where job_id = ? ORDER BY t1.seq ASC;
`;

function genSqlSelectDTOByJobIds(ids) {
    let idsString = "'" + ids.join("','") + "'";
    return `
    SELECT t1.id, t1.job_id, t1.tag_id, t2.tag_name,t1.seq ,t1.create_datetime, t1.update_datetime,t1.source_type,t1.source,t2.is_public FROM job_tag AS t1  LEFT JOIN tag AS t2 ON t1.tag_id = t2.tag_id where job_id in (${idsString}) ORDER BY t1.seq ASC;
    `;
}
