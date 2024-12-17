import { Message } from "../../../common/api/message";
import { JobTagBO } from "../../../common/data/bo/jobTagBO";
import { JobTagSearchBO } from "../../../common/data/bo/jobTagSearchBO";
import { JobTag } from "../../../common/data/domain/jobTag";
import { JobTagDTO } from "../../../common/data/dto/jobTagDTO";
import { JobTagSearchDTO } from "../../../common/data/dto/jobTagSearchDTO";
import { JobTagStatisticDTO } from "../../../common/data/dto/jobTagStatisticDTO";
import { genIdFromText, genUniqueId } from "../../../common/utils";
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
                    SELECT t1.id AS id, t1.job_id AS jobId, t1.create_datetime AS createDatetime, t1.update_datetime AS updateDatetime FROM job_tag AS t1  LEFT JOIN tag AS t2 ON t1.tag_id = t2.tag_id ${whereCondition}  GROUP BY t1.job_id
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
     * @param {JobTagBO[]} param 
     */
    jobTagBatchAddOrUpdateWithTransaction: async function (message, param) {
        try {
            await beginTransaction()
            for (let i = 0; i < param.length; i++) {
                await _addOrUpdateJobTag(param[i]);
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
};

/**
 * 
 * @param {JobTagBO} param 
 */
export async function _addOrUpdateJobTag(param) {
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
        await SERVICE_INSTANCE._addOrUpdate(jobTag);
    }
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
