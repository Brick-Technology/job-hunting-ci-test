import dayjs from "dayjs";
import { Message } from "../../../common/api/message";
import { CompanyTagBO } from "../../../common/data/bo/companyTagBO";
import { CompanyTagBatchAddOrUpdateBO } from "../../../common/data/bo/companyTagBatchAddOrUpdateBO";
import { CompanyTagExportBO } from "../../../common/data/bo/companyTagExportBO";
import { SearchCompanyTagBO } from "../../../common/data/bo/searchCompanyTagBO";
import { CompanyTag } from "../../../common/data/domain/companyTag";
import { CompanyTagDTO } from "../../../common/data/dto/companyTagDTO";
import { SearchCompanyTagDTO } from "../../../common/data/dto/searchCompanyTagDTO";
import { StatisticCompanyTagDTO } from "../../../common/data/dto/statisticCompanyTagDTO";
import { genIdFromText, genUniqueId, isBlank } from "../../../common/utils";
import { getAll, getDb, getOne } from "../database";
import { postErrorMessage, postSuccessMessage } from "../util";
import { BaseService } from "./baseService";
import { _addNotExistsTags, _searchWithTagInfo } from "./tagService";

const COMPANY_ID_COLUMN = "company_id";

const SERVICE_INSTANCE = new BaseService("company_tag", "company_tag_id",
    () => {
        return new CompanyTag();
    },
    () => {
        return new SearchCompanyTagDTO();
    },
    (param) => {
        let whereCondition = "";
        return whereCondition;
    }
);

export const CompanyTagService = {
    /**
     *
     * @param {Message} message
     * @param {string} param id
     *
     * @returns CompanyTag
     */
    getCompanyTagById: async function (message, param) {
        try {
            postSuccessMessage(
                message,
                _getCompanyTagById(param)
            );
        } catch (e) {
            postErrorMessage(message, "[worker] getTagById error : " + e.message);
        }
    },
    /**
     *
     * @param {Message} message
     * @param {CompanyTag} param
     */
    addCompanyTag: async function (message, param) {
        try {
            await _addCompanyTag(param);
            postSuccessMessage(message, {});
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] addOrUpdateTag error : " + e.message
            );
        }
    },
    /**
     *
     * @param {Message} message
     * @param {string} param companyId
     */
    deleteCompanyTagByCompanyId: async function (message, param) {
        try {
            await _deleteCompanyTagByCompanyId(param);
            postSuccessMessage(message, {});
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] deleteCompanyTagByCompanyId error : " + e.message
            );
        }
    },
    /**
     *
     * @param {Message} message
     * @param {string[]} param companyIds
     */
    deleteCompanyTagByCompanyIds: async function (message, param) {
        try {
            if (param && param.length > 0) {
                await _deleteCompanyTagByCompanyIds(param);
                postSuccessMessage(message, {});
            } else {
                postErrorMessage(
                    message,
                    "[worker] deleteCompanyTagByCompanyIds error : companyIds is empty"
                );
            }
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] deleteCompanyTagByCompanyIds error : " + e.message
            );
        }
    },
    /**
     * 
     * @param {Message} message 
     * @param {CompanyTagBO} param 
     */
    addOrUpdateCompanyTag: async function (message, param) {
        try {
            (await getDb()).exec({
                sql: "BEGIN TRANSACTION",
            });
            await _addOrUpdateCompanyTag(param);
            (await getDb()).exec({
                sql: "COMMIT",
            });
            postSuccessMessage(message, {});
        } catch (e) {
            (await getDb()).exec({
                sql: "ROLLBACK TRANSACTION",
            });
            postErrorMessage(
                message,
                "[worker] addOrUpdateCompanyTag error : " + e.message
            );
        }
    },
    /**
     * 
     * @param {Message} message 
     * @param {CompanyTagBatchAddOrUpdateBO} param 
     */
    batchAddOrUpdateCompanyTag: async function (message, param) {
        try {
            await _batchAddOrUpdateCompanyTag(param.items, param.overrideUpdateDatetime);
            postSuccessMessage(message, {});
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] batchAddOrUpdateCompanyTag error : " + e.message
            );
        }
    },
    /**
     * 
     * @param {Message} message 
     * @param {CompanyTagBatchAddOrUpdateBO} param 
     */
    batchAddOrUpdateCompanyTagWithTransaction: async function (message, param) {
        try {
            (await getDb()).exec({
                sql: "BEGIN TRANSACTION",
            });
            await _batchAddOrUpdateCompanyTag(param.items, param.overrideUpdateDatetime);
            (await getDb()).exec({
                sql: "COMMIT",
            });
            postSuccessMessage(message, {});
        } catch (e) {
            (await getDb()).exec({
                sql: "ROLLBACK TRANSACTION",
            });
            postErrorMessage(
                message,
                "[worker] batchAddOrUpdateCompanyTagWithTransaction error : " + e.message
            );
        }
    },
    /**
     *
     * @param {Message} message
     * @param {string} param companyId
     *
     * @returns CompanyTagDTO[]
     */
    getAllCompanyTagDTOByCompanyId: async function (message, param) {
        try {
            postSuccessMessage(
                message,
                await _getAllCompanyTagDTOByCompanyId(param)
            );
        } catch (e) {
            postErrorMessage(message, "[worker] getAllCompanyTagDTOByCompanyId error : " + e.message);
        }
    },
    /**
     *
     * @param {Message} message
     * @param {string[]} param ids
     *
     * @returns CompanyTagDTO[]
     */
    getAllCompanyTagDTOByCompanyIds: async function (message, param) {
        try {
            postSuccessMessage(
                message,
                await _getAllCompanyTagDTOByCompanyIds(param)
            );
        } catch (e) {
            postErrorMessage(message, "[worker] getAllCompanyTagDTOByCompanyIds error : " + e.message);
        }
    },
    /**
     * 
     * @param {Message} message 
     * @param {SearchCompanyTagBO} param 
     * 
     * @returns SearchCompanyTagDTO
     */
    searchCompanyTag: async function (message, param) {
        try {
            let result = await _searchWithTagInfo({
                param,
                cerateResultDTOFunction: () => {
                    return new SearchCompanyTagDTO()
                },
                createResultItemDTOFunction: () => {
                    return new CompanyTagDTO();
                },
                genSqlSearchQueryFunction: () => {
                    let whereCondition = "";
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
                    SELECT t1.company_tag_id AS companyTagId, t1.company_id AS companyId, t1.company_name AS companyName,t1.create_datetime AS createDatetime, MAX(t1.update_datetime) AS updateDatetime FROM company_tag AS t1  LEFT JOIN tag AS t2 ON t1.tag_id = t2.tag_id ${whereCondition}  GROUP BY t1.company_id
                    `
                },
                genSearchWhereConditionSqlFunction: () => {
                    let whereCondition = "";
                    if (param.companyName) {
                        whereCondition +=
                            " AND companyName LIKE '%" + param.companyName + "%' ";
                    }
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
                idColumn: "companyId",
                getAllDTOByIdsFunction: async (ids) => {
                    return _getAllCompanyTagDTOByCompanyIds(ids);
                }
            });
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(message, "[worker] searchCompanyTag error : " + e.message);
        }
    },
    /**
   *
   * @param {Message} message
   * @param {*} param
   *
   * @returns {StatisticCompanyTagDTO}
   */
    statisticCompanyTag: async function (message, param) {
        try {
            let result = new StatisticCompanyTagDTO();
            let now = dayjs();
            let todayStart = now.startOf("day").format("YYYY-MM-DD HH:mm:ss");
            let todayEnd = now
                .startOf("day")
                .add(1, "day")
                .format("YYYY-MM-DD HH:mm:ss");
            let yesterdayStart = now
                .startOf("day")
                .add(2, "day")
                .format("YYYY-MM-DD HH:mm:ss");
            let yesterdayEnd = now
                .startOf("day")
                .add(1, "day")
                .format("YYYY-MM-DD HH:mm:ss");
            let totalTagQueryResult = [];
            (await getDb()).exec({
                sql: `SELECT COUNT(*) AS count FROM tag`,
                rowMode: "object",
                resultRows: totalTagQueryResult,
            });
            const tagQuerySql = `SELECT COUNT(*) AS count FROM tag WHERE create_datetime >= $startDatetime AND create_datetime < $endDatetime`;
            let todayTagQueryResult = [];
            (await getDb()).exec({
                sql: tagQuerySql,
                rowMode: "object",
                resultRows: todayTagQueryResult,
                bind: {
                    $startDatetime: todayStart,
                    $endDatetime: todayEnd,
                },
            });
            let yesterdayTagQueryResult = [];
            (await getDb()).exec({
                sql: tagQuerySql,
                rowMode: "object",
                resultRows: yesterdayTagQueryResult,
                bind: {
                    $startDatetime: yesterdayStart,
                    $endDatetime: yesterdayEnd,
                },
            });
            let totalCompanyTagRecordQueryResult = [];
            (await getDb()).exec({
                sql: `SELECT COUNT(*) AS count FROM company_tag`,
                rowMode: "object",
                resultRows: totalCompanyTagRecordQueryResult,
            });
            const tagCompanyQuerySql = `SELECT COUNT(DISTINCT company_id) AS count FROM company_tag WHERE create_datetime >= $startDatetime AND create_datetime < $endDatetime;`;
            let todayTagCompanyQueryResult = [];
            (await getDb()).exec({
                sql: tagCompanyQuerySql,
                rowMode: "object",
                resultRows: todayTagCompanyQueryResult,
                bind: {
                    $startDatetime: todayStart,
                    $endDatetime: todayEnd,
                },
            });
            let yesterdayTagCompanyQueryResult = [];
            (await getDb()).exec({
                sql: tagCompanyQuerySql,
                rowMode: "object",
                resultRows: yesterdayTagCompanyQueryResult,
                bind: {
                    $startDatetime: yesterdayStart,
                    $endDatetime: yesterdayEnd,
                },
            });
            let totalTagCompanyQueryResult = [];
            (await getDb()).exec({
                sql: `SELECT COUNT(DISTINCT company_id) AS count FROM company_tag`,
                rowMode: "object",
                resultRows: totalTagCompanyQueryResult,
            });
            result.todayTag = todayTagQueryResult[0].count;
            result.yesterdayTag = yesterdayTagQueryResult[0].count;
            result.totalTag = totalTagQueryResult[0].count;
            result.totalCompanyTagRecord = totalCompanyTagRecordQueryResult[0].count;
            result.todayTagCompany = todayTagCompanyQueryResult[0].count;
            result.yesterdayTagCompany = yesterdayTagCompanyQueryResult[0].count;
            result.totalTagCompany = totalTagCompanyQueryResult[0].count;
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] statisticCompanyTag error : " + e.message
            );
        }
    },
    /**
     *
     * @param {Message} message
     * @param {CompanyTagExportBO} param
     *
     * @returns CompanyTagExportDTO[]
     */
    companyTagExport: async function (message, param) {
        try {
            postSuccessMessage(
                message,
                await _companyTagExport(param)
            );
        } catch (e) {
            postErrorMessage(message, "[worker] companyTagExport error : " + e.message);
        }
    },
};

/**
 * 
 * @param {CompanyTagExportBO} param 
 */
async function _companyTagExport(param) {
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
    if (param.companyIds) {
        let idsString = "'" + param.companyIds.join("','") + "'";
        joinCondition +=
            ` AND t1.company_id in (${idsString})`;
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
    let sqlQuery = `SELECT t1.company_id AS companyId,t1.company_name AS companyName,GROUP_CONCAT(t2.tag_name) AS tagNameArray,MAX(t1.update_datetime) AS updateDatetime FROM company_tag AS t1 LEFT JOIN tag AS t2 ON t1.tag_id = t2.tag_id ${joinCondition} WHERE t1.source_type = 0 ${whereCondition} GROUP BY t1.company_id ORDER BY t1.seq ASC;`;
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
 * @param {CompanyTagBO[]} companyTagBOs 
 */
async function _batchAddOrUpdateCompanyTag(companyTagBOs, overrideUpdateDatetime) {
    let allTags = [];
    companyTagBOs.map(item => { return item.tags }).forEach(items => {
        allTags.push(...items);
    })
    await _addNotExistsTags(allTags);
    let sourceTypeSourceAndIdsMap = new Map();
    let sourceTypeSourceAndSourceTypeMap = new Map();
    let sourceTypeSourceAndSourceMap = new Map();
    for (let i = 0; i < companyTagBOs.length; i++) {
        let item = companyTagBOs[i];
        let key = item.sourceType + "_" + item.source;
        if (!sourceTypeSourceAndIdsMap.has(key)) {
            sourceTypeSourceAndIdsMap.set(key, []);
            sourceTypeSourceAndSourceTypeMap.set(key, item.sourceType);
            sourceTypeSourceAndSourceMap.set(key, item.source);
        }
        sourceTypeSourceAndIdsMap.get(key).push(genIdFromText(item.companyName));
    }
    sourceTypeSourceAndIdsMap.forEach(async (value, key, map) => {
        let ids = sourceTypeSourceAndIdsMap.get(key);
        let sourceType = sourceTypeSourceAndSourceTypeMap.get(key);
        let source = sourceTypeSourceAndSourceMap.get(key);
        await SERVICE_INSTANCE._deleteByIds(ids, COMPANY_ID_COLUMN, { otherCondition: `source_type=${sourceType} AND ${source ? "source = '" + source + "'" : "source IS NULL"}` });
    });
    let companyTags = [];
    for (let i = 0; i < companyTagBOs.length; i++) {
        let item = companyTagBOs[i];
        let companyName = item.companyName;
        let companyId = genIdFromText(companyName);
        for (let i = 0; i < item.tags.length; i++) {
            let tagName = item.tags[i];
            let tagId = genIdFromText(tagName);
            let companyTag = new CompanyTag();
            companyTag.companyTagId = genUniqueId();
            companyTag.companyId = companyId;
            companyTag.companyName = companyName;
            companyTag.tagId = tagId;
            companyTag.seq = i;
            companyTag.sourceType = item.sourceType;
            companyTag.source = item.source;
            companyTag.updateDatetime = item.updateDatetime;
            companyTags.push(companyTag);
        }
    }
    await SERVICE_INSTANCE._batchAddOrUpdate(companyTags, { overrideUpdateDatetime });
}

/**
 * 
 * @param {CompanyTagBO} param 
 */
async function _addOrUpdateCompanyTag(param, overrideUpdateDatetime) {
    await _addNotExistsTags(param.tags);
    let companyName = param.companyName;
    let companyId = genIdFromText(companyName);
    await SERVICE_INSTANCE._deleteById(companyId, COMPANY_ID_COLUMN, { otherCondition: `source_type=${param.sourceType} AND ${param.source ? "source = '" + param.source + "'" : "source IS NULL"}` });
    for (let i = 0; i < param.tags.length; i++) {
        let tagName = param.tags[i];
        let tagId = genIdFromText(tagName);
        let companyTag = new CompanyTag();
        companyTag.companyTagId = genUniqueId();
        companyTag.companyId = companyId;
        companyTag.companyName = companyName;
        companyTag.tagId = tagId;
        companyTag.seq = i;
        companyTag.sourceType = param.sourceType;
        companyTag.source = param.source;
        companyTag.updateDatetime = param.updateDatetime;
        await SERVICE_INSTANCE._addOrUpdate(companyTag, { overrideUpdateDatetime });
    }
}

/**
 * 
 * @param {string} param id
 */
export async function _getCompanyTagById(param) {
    return getOne(SQL_SELECT_BY_ID, [param], new CompanyTag());
}

/**
 * 
 * @param {string} param id
 * 
 * @return CompanyTagDTO[]
 */
export async function _getAllCompanyTagDTOByCompanyId(param) {
    return getAll(SQL_SELECT_DTO_BY_COMPANY_ID, [param], new CompanyTagDTO());
}

/**
 * 
 * @param {string[]} param ids
 * 
 * @return CompanyTagDTO[]
 */
export async function _getAllCompanyTagDTOByCompanyIds(param) {
    let sqlSelectDTOByCompanyIds = genSqlSelectDTOByCompanyIds(param);
    return await getAll(sqlSelectDTOByCompanyIds, [], new CompanyTagDTO());
}

/**
 * 
 * @param {string} param companyId
 */
export async function _deleteCompanyTagByCompanyId(param) {
    (await getDb()).exec({
        sql: SQL_DELETE_BY_COMPANY_ID,
        bind: [param],
    });
}

/**
 * 
 * @param {string[]} param companyIds
 */
export async function _deleteCompanyTagByCompanyIds(param) {
    (await getDb()).exec({
        sql: getSqlDeleteByCompanyIds(param),
    });
}

const SQL_SELECT = `SELECT company_tag_id, company_id, company_name,tag_id,seq ,create_datetime, update_datetime,source_type,source FROM company_tag`;
const SQL_SELECT_BY_ID = `${SQL_SELECT} WHERE company_tag_id = ?`;
const SQL_DELETE_BY_COMPANY_ID = `
DELETE FROM company_tag WHERE company_id = ?
`;

const getSqlDeleteByCompanyIds = (ids) => {
    let idsString = "'" + ids.join("','") + "'";
    return `
        DELETE FROM company_tag WHERE company_id in (${idsString})
    `;
}

const SQL_SELECT_DTO_BY_COMPANY_ID = `
SELECT t1.company_tag_id, t1.company_id, t1.company_name,t1.tag_id, t2.tag_name,t1.seq ,t1.create_datetime, t1.update_datetime,t1.source_type,t1.source,t2.is_public FROM company_tag AS t1  LEFT JOIN tag AS t2 ON t1.tag_id = t2.tag_id where company_id = ? ORDER BY t1.seq ASC;
`;

function genSqlSelectDTOByCompanyIds(ids) {
    let idsString = "'" + ids.join("','") + "'";
    return `
    SELECT t1.company_tag_id, t1.company_id, t1.company_name,t1.tag_id, t2.tag_name,t1.seq ,t1.create_datetime, t1.update_datetime,t1.source_type,t1.source,t2.is_public FROM company_tag AS t1  LEFT JOIN tag AS t2 ON t1.tag_id = t2.tag_id where company_id in (${idsString}) ORDER BY t1.seq ASC;
    `;
}