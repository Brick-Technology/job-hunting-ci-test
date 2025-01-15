import dayjs from "dayjs";
import { Message } from "../../../common/api/message";
import { JobStatisticGroupByPublishDateBO, TYPE_ENUM_DAY, TYPE_ENUM_HOUR, TYPE_ENUM_MONTH, TYPE_ENUM_WEEK } from "../../../common/data/bo/jobStatisticGroupByPublishDateBO";
import { JobStatisticJobCompanyTagGroupByCompanyBO } from "../../../common/data/bo/jobStatisticJobCompanyTagGroupByCompanyBO";
import { JobStatisticJobCompanyTagGroupByPlatformBO } from "../../../common/data/bo/jobStatisticJobCompanyTagGroupByPlatformBO";
import { JobTagBO } from "../../../common/data/bo/jobTagBO";
import { SearchJobBO } from "../../../common/data/bo/searchJobBO";
import { Job } from "../../../common/data/domain/job";
import { JobDTO } from "../../../common/data/dto/jobDTO";
import { SearchJobDTO } from "../../../common/data/dto/searchJobDTO";
import { StatisticJobBrowseDTO } from "../../../common/data/dto/statisticJobBrowseDTO";
import { StatisticJobSearchGroupByAvgSalaryDTO } from "../../../common/data/dto/statisticJobSearchGroupByAvgSalaryDTO";
import { TAG_SOURCE_TYPE_PLATFORM } from "../../../common/index";
import { convertEmptyStringToNull, dateToStr, genIdFromText, isNotEmpty, toHump } from "../../../common/utils";
import { getDb, getOne, batchInsertOrReplace } from "../database";
import { postErrorMessage, postSuccessMessage } from "../util";
import { BaseService } from "./baseService";
import { _getCompanyDTOByIds } from "./companyService";
import { _getAllCompanyTagDTOByCompanyIds } from "./companyTagService";
import { _addOrUpdateJobTag, _getAllJobTagDTOByJobIds, _batchAddOrUpdateJobTag } from "./jobTagService";
import { JobBrowseHistory } from "../../../common/data/domain/jobBrowseHistory";

const JOB_VISIT_TYPE_SEARCH = "SEARCH";
const JOB_VISIT_TYPE_DETAIL = "DETAIL";

const SERVICE_INSTANCE = new BaseService("job", "job_id",
  () => {
    return new Job();
  },
  () => {
    return new SearchJobDTO();
  },
  null
);

export const JobService = {
  /**
   *
   * @param {Message} message
   * @param {Job[]} param
   */
  batchAddOrUpdateJobBrowse: async function (message, param) {
    try {
      const now = new Date();
      (await getDb()).exec({
        sql: "BEGIN TRANSACTION",
      });
      batchInsertOrUpdateJobAndBrowseHistory(param, now);
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
        "[worker] batchAddOrUpdateJobBrowse error : " + e.message
      );
    }
  },

  /**
   *
   * @param {Message} message
   * @param {Job[]} param
   */
  batchAddOrUpdateJob: async function (message, param) {
    try {
      const now = new Date();
      for (let i = 0; i < param.length; i++) {
        await _insertOrUpdateJob(param[i], now);
      }
      await _batchInsertJobTag(param);
      postSuccessMessage(message, {});
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] batchAddOrUpdateJob error : " + e.message
      );
    }
  },
  /**
     *
     * @param {Message} message
     * @param {Job[]} param
     */
  batchAddOrUpdateJobWithTransaction: async function (message, param) {
    try {
      const now = new Date();
      (await getDb()).exec({
        sql: "BEGIN TRANSACTION",
      });
      for (let i = 0; i < param.length; i++) {
        await _insertOrUpdateJob(param[i], now);
      }
      await _batchInsertJobTag(param);
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
        "[worker] batchAddOrUpdateJobWithTransaction error : " + e.message
      );
    }
  },
  /**
   *
   * @param {Message} message
   * @param {Job} param
   */
  addOrUpdateJobBrowse: async function (message, param) {
    try {
      const now = new Date();
      (await getDb()).exec({
        sql: "BEGIN TRANSACTION",
      });
      insertOrUpdateJobAndBrowseHistory(param, now);
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
        "[worker] addOrUpdateJobBrowse error : " + e.message
      );
    }
  },

  /**
   *
   * @param {Message} message
   * @param {string} param jobId
   */
  addJobBrowseDetailHistory: async function (message, param) {
    try {
      const now = new Date();
      await addJobBrowseHistory(param, now, JOB_VISIT_TYPE_DETAIL);
      postSuccessMessage(message, {});
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] addJobBrowseDetailHistory error : " + e.message
      );
    }
  },

  /**
   *
   * @param {*} message
   * @param {string[]} param
   *
   * @returns JobDTO[]
   */
  getJobBrowseInfoByIds: async function (message, param) {
    try {
      let ids = "'" + param.join("','") + "'";
      let searchCountMap = await getJobBrowseHistoryCountMap(
        ids,
        JOB_VISIT_TYPE_SEARCH
      );
      let detailCountMap = await getJobBrowseHistoryCountMap(
        ids,
        JOB_VISIT_TYPE_DETAIL
      );
      let tempResultMap = new Map();
      const SQL_QUERY_JOB =
        "SELECT job_id,job_platform,job_url,job_name,job_company_name,job_location_name,job_address,job_longitude,job_latitude,job_description,job_degree_name,job_year,job_salary_min,job_salary_max,job_salary_total_month,job_first_publish_datetime,boss_name,boss_company_name,boss_position,create_datetime,update_datetime,is_full_company_name,skill_tag,welfare_tag FROM job WHERE job_id in (" +
        ids +
        ")";
      let rows = [];
      (await getDb()).exec({
        sql: SQL_QUERY_JOB,
        rowMode: "object",
        resultRows: rows,
      });
      for (let i = 0; i < rows.length; i++) {
        let item = rows[i];
        let resultItem = new JobDTO();
        let keys = Object.keys(item);
        for (let n = 0; n < keys.length; n++) {
          let key = keys[n];
          resultItem[toHump(key)] = item[key];
        }
        tempResultMap.set(resultItem.jobId, resultItem);
      }
      let result = [];
      for (let j = 0; j < param.length; j++) {
        let jobId = param[j];
        let target = tempResultMap.get(jobId);
        if (target) {
          target.browseCount = searchCountMap.get(jobId);
          target.browseDetailCount = detailCountMap.get(jobId);
        }
        result.push(target);
      }
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] getJobBrowseInfoByIds error : " + e.message
      );
    }
  },

  /**
   *
   * @param {Message} message
   * @param {SearchJobBO} param
   *
   * @returns SearchJobDTO
   */
  searchJob: async function (message, param) {
    try {
      let result = new SearchJobDTO();
      let sqlQuery = "";
      let whereCondition = genJobSearchWhereConditionSql(param);
      let orderBy =
        " ORDER BY " +
        param.orderByColumn +
        " " +
        param.orderBy +
        " NULLS LAST";
      let limitStart = (param.pageNum - 1) * param.pageSize;
      let limitEnd = param.pageSize;
      let limit = " limit " + limitStart + "," + limitEnd;
      sqlQuery += genSqlJobSearchQuery(param);
      sqlQuery += whereCondition;
      let sqlQueryCountSubSql = sqlQuery;
      sqlQuery += orderBy;
      sqlQuery += limit;
      let items = [];
      let total = 0;
      let queryRows = [];
      (await getDb()).exec({
        sql: sqlQuery,
        rowMode: "object",
        resultRows: queryRows,
      });
      await _fillSearchResultExtraInfo(items, queryRows);
      //count
      let sqlCount = `SELECT COUNT(*) AS total from (${sqlQueryCountSubSql}) AS t1`;
      let queryCountRows = [];
      (await getDb()).exec({
        sql: sqlCount,
        rowMode: "object",
        resultRows: queryCountRows,
      });
      total = queryCountRows[0].total;

      result.items = items;
      result.total = total;
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(message, "[worker] searchJob error : " + e.message);
    }
  },
  /**
   *
   * @param {Message} message
   * @param {string} param url
   *
   * @returns Job
   */
  getJobByDetailUrl: async function (message, param) {
    try {
      postSuccessMessage(
        message,
        await getOne(SQL_JOB_BY_JOB_URL, [param], new Job())
      );
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] getJobByDetailUrl error : " + e.message
      );
    }
  },

  /**
   *
   * @param {Message} message
   * @param {SearchJobBO} param
   *
   * @returns StatisticJobSearchGroupByAvgSalaryDTO
   */
  statisticJobSearchGroupByAvgSalary: async function (message, param) {
    try {
      let result = new StatisticJobSearchGroupByAvgSalaryDTO();
      let resultSqlQuery = SQL_GROUP_BY_COUNT_AVG_SALARY.replace(
        "#{injectSql}",
        genSqlJobSearchQuery(param) + genJobSearchWhereConditionSql(param)
      );
      let queryRows = [];
      (await getDb()).exec({
        sql: resultSqlQuery,
        rowMode: "object",
        resultRows: queryRows,
      });
      for (let i = 0; i < queryRows.length; i++) {
        let item = queryRows[i];
        result[item.levels] = item.total;
      }
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] statisticJobSearchGroupByAvgSalary error : " + e.message
      );
    }
  },

  /**
   *
   * @param {Message} message
   * @param {*} param
   *
   * @returns {StatisticJobBrowseDTO}
   */
  statisticJobBrowse: async function (message, param) {
    try {
      let result = new StatisticJobBrowseDTO();
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
      const SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TODAY =
        "SELECT COUNT(*) AS count FROM job_browse_history WHERE job_visit_datetime >= $startDatetime AND job_visit_datetime < $endDatetime AND job_visit_type = $visitType";
      let browseCountToday = [];
      (await getDb()).exec({
        sql: SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TODAY,
        rowMode: "object",
        resultRows: browseCountToday,
        bind: {
          $startDatetime: todayStart,
          $endDatetime: todayEnd,
          $visitType: JOB_VISIT_TYPE_SEARCH
        },
      });
      let browseCountYesterday = [];
      (await getDb()).exec({
        sql: SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TODAY,
        rowMode: "object",
        resultRows: browseCountYesterday,
        bind: {
          $startDatetime: yesterdayStart,
          $endDatetime: yesterdayEnd,
          $visitType: JOB_VISIT_TYPE_SEARCH
        },
      });
      let browseCountDetailToday = [];
      (await getDb()).exec({
        sql: SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TODAY,
        rowMode: "object",
        resultRows: browseCountDetailToday,
        bind: {
          $startDatetime: todayStart,
          $endDatetime: todayEnd,
          $visitType: JOB_VISIT_TYPE_DETAIL
        },
      });
      let browseCountDetailYesterday = [];
      (await getDb()).exec({
        sql: SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TODAY,
        rowMode: "object",
        resultRows: browseCountDetailYesterday,
        bind: {
          $startDatetime: yesterdayStart,
          $endDatetime: yesterdayEnd,
          $visitType: JOB_VISIT_TYPE_DETAIL
        },
      });
      const SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TOTAL =
        "SELECT COUNT(*) AS count FROM job_browse_history WHERE job_visit_type = $visitType";
      let browseTotalCount = [];
      (await getDb()).exec({
        sql: SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TOTAL,
        rowMode: "object",
        resultRows: browseTotalCount,
        bind: {
          $visitType: JOB_VISIT_TYPE_SEARCH
        },
      });
      let browseTotalDetailCount = [];
      (await getDb()).exec({
        sql: SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TOTAL,
        rowMode: "object",
        resultRows: browseTotalDetailCount,
        bind: {
          $visitType: JOB_VISIT_TYPE_DETAIL
        },
      });
      const SQL_QUERY_JOB_TODAY_COUNT = "SELECT COUNT(*) AS count FROM job WHERE create_datetime >= $startDatetime AND create_datetime < $endDatetime;";
      let jobTodayCount = [];
      (await getDb()).exec({
        sql: SQL_QUERY_JOB_TODAY_COUNT,
        rowMode: "object",
        resultRows: jobTodayCount,
        bind: {
          $startDatetime: todayStart,
          $endDatetime: todayEnd,
        }
      });
      let jobYesterdayCount = [];
      (await getDb()).exec({
        sql: SQL_QUERY_JOB_TODAY_COUNT,
        rowMode: "object",
        resultRows: jobYesterdayCount,
        bind: {
          $startDatetime: yesterdayStart,
          $endDatetime: yesterdayEnd,
        }
      });
      const SQL_QUERY_JOB_COUNT_TOTAL = "SELECT COUNT(*) AS count FROM job;";
      let jobTotalCount = [];
      (await getDb()).exec({
        sql: SQL_QUERY_JOB_COUNT_TOTAL,
        rowMode: "object",
        resultRows: jobTotalCount,
      });
      result.todayBrowseCount = browseCountToday[0].count;
      result.yesterdayBrowseCount = browseCountYesterday[0].count;
      result.totalBrowseCount = browseTotalCount[0].count;
      result.todayBrowseDetailCount = browseCountDetailToday[0].count;
      result.yesterdayBrowseDetailCount = browseCountDetailYesterday[0].count;
      result.totalBrowseDetailCount = browseTotalDetailCount[0].count;
      result.todayJob = jobTodayCount[0].count;
      result.yesterdayJob = jobYesterdayCount[0].count;
      result.totalJob = jobTotalCount[0].count;
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] statisticJobBrowse error : " + e.message
      );
    }
  },
  /**
   *
   * @param {Message} message
   * @param {string[]} param id
   */
  jobGetByIds: async function (message, param) {
    SERVICE_INSTANCE.getByIds(message, param);
  },

  /**
     *
     * @param {Message} message
     * @param {JobStatisticGroupByPublishDateBO} param
     */
  jobStatisticGroupByPublishDate: async function (message, param) {
    try {
      let sql = `SELECT STRFTIME('${convertEnum(param.type)}', job_first_publish_datetime) AS name,COUNT(*) AS total FROM job WHERE job_first_publish_datetime NOT NULL GROUP BY name;`;
      let result = await jobStatistic({ sql });
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] jobStatisticGroupByPublishDate error : " + e.message
      );
    }
  },

  /**
   *
   * @param {Message} message
   * @param {*} param
   */
  jobStatisticGroupByPlatform: async function (message, param) {
    try {
      let sql = `SELECT job_platform AS name,COUNT(*) AS total FROM job GROUP BY name;`;
      let result = await jobStatistic({ sql });
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] jobStatisticGroupByPlatform error : " + e.message
      );
    }
  },

  /**
   *
   * @param {Message} message
   * @param {JobStatisticJobCompanyTagGroupByPlatformBO} param
   */
  jobStatisticJobCompanyTagGroupByPlatform: async function (message, param) {
    try {
      let whereCondition = "";
      if (isNotEmpty(param.tagName)) {
        whereCondition += ` AND tag_id = '${genIdFromText(param.tagName)}'`;
      }
      if (whereCondition.startsWith(" AND")) {
        whereCondition = whereCondition.replace("AND", "");
        whereCondition = " WHERE " + whereCondition;
      }
      let sql = `select t1.job_platform AS name, COUNT(*) AS count from job t1 LEFT JOIN company_tag t2 ON t1.job_company_name = t2.company_name ${whereCondition} GROUP BY t1.job_platform ORDER BY count DESC`;
      let result = await jobStatistic({ sql });
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] jobStatisticJobTagGroupByPlatform error : " + e.message
      );
    }
  },
  /**
   *
   * @param {Message} message
   * @param {JobStatisticJobCompanyTagGroupByCompanyBO} param
   */
  jobStatisticJobCompanyTagGroupByCompany: async function (message, param) {
    try {
      let limitStart = (param.pageNum - 1) * param.pageSize;
      let limitEnd = param.pageSize;
      let limit = " limit " + limitStart + "," + limitEnd;
      let whereCondition = "";
      if (isNotEmpty(param.tagName)) {
        whereCondition += ` AND tag_id = '${genIdFromText(param.tagName)}'`;
      }
      if (whereCondition.startsWith(" AND")) {
        whereCondition = whereCondition.replace("AND", "");
        whereCondition = " WHERE " + whereCondition;
      }
      let sql = `SELECT t1.job_company_name AS name, COUNT(*) AS count from job t1 LEFT JOIN company_tag t2 ON t1.job_company_name = t2.company_name ${whereCondition} GROUP BY t1.job_company_name ORDER BY count DESC ${limit}`;
      let items = await jobStatistic({ sql });
      let countRows = [];
      (await getDb()).exec({
        sql: `SELECT COUNT(*) AS count from job t1 LEFT JOIN company_tag t2 ON t1.job_company_name = t2.company_name ${whereCondition}`,
        rowMode: "object",
        resultRows: countRows
      });
      postSuccessMessage(message, { items, total: countRows[0].count });
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] jobStatisticJobCompanyTagGroupByCompany error : " + e.message
      );
    }
  },
};

const convertEnum = (value) => {
  if (TYPE_ENUM_MONTH == value) {
    return "%m";
  } else if (TYPE_ENUM_WEEK == value) {
    return "%w";
  } else if (TYPE_ENUM_DAY == value) {
    return "%d";
  } else if (TYPE_ENUM_HOUR == value) {
    return "%H";
  } else {
    throw `unknow type = ${value}`
  }
}

async function jobStatistic({ sql }) {
  let result = [];
  let resultRows = [];
  (await getDb()).exec({
    sql,
    rowMode: "object",
    resultRows
  });
  resultRows.forEach(item => {
    result.push(item);
  });
  return result;
}

export async function _getByIds(ids) {
  return SERVICE_INSTANCE._getByIds(ids);
}

async function getJobBrowseHistoryCountMap(ids, type) {
  let countMap = new Map();
  const SQL_QUERY_JOB_BOWSE_HISTORY_GROUP_COUNT = `SELECT job_id AS jobId ,count(*) AS total FROM job_browse_history WHERE job_id IN (
    ${ids}
    ) AND job_visit_type = '${type}'  GROUP BY job_id;`;
  let countRows = [];
  (await getDb()).exec({
    sql: SQL_QUERY_JOB_BOWSE_HISTORY_GROUP_COUNT,
    rowMode: "object",
    resultRows: countRows,
  });
  for (let i = 0; i < countRows.length; i++) {
    let item = countRows[i];
    countMap.set(item.jobId, item.total);
  }
  return countMap;
}

/**
 *
 * @param {SearchJobBO} param
 *
 * @returns string sql
 */
function genJobSearchWhereConditionSql(param) {
  let whereCondition = "";
  if (param.jobName) {
    whereCondition += " AND job_name LIKE '%" + param.jobName + "%' ";
  }
  if (param.jobCompanyName) {
    whereCondition +=
      " AND job_company_name LIKE '%" + param.jobCompanyName + "%' ";
  }
  if (param.jobLocationName) {
    whereCondition +=
      " AND job_location_name LIKE '%" + param.jobLocationName + "%' ";
  }
  if (param.jobAddress) {
    whereCondition += " AND job_address LIKE '%" + param.jobAddress + "%' ";
  }
  if (param.startDatetime) {
    whereCondition +=
      " AND create_datetime >= '" +
      dayjs(param.startDatetime).format("YYYY-MM-DD HH:mm:ss") +
      "'";
  }
  if (param.endDatetime) {
    whereCondition +=
      " AND create_datetime < '" +
      dayjs(param.endDatetime).format("YYYY-MM-DD HH:mm:ss") +
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
  if (param.firstPublishStartDatetime) {
    whereCondition +=
      " AND job_first_publish_datetime >= '" +
      dayjs(param.firstPublishStartDatetime).format("YYYY-MM-DD HH:mm:ss") +
      "'";
  }
  if (param.firstPublishEndDatetime) {
    whereCondition +=
      " AND job_first_publish_datetime < '" +
      dayjs(param.firstPublishEndDatetime).format("YYYY-MM-DD HH:mm:ss") +
      "'";
  }
  if (param.hasCoordinate) {
    whereCondition += ` AND job_longitude IS NOT NULL AND job_longitude <> '' AND  IS NOT NULL AND job_latitude <> ''`;
  }
  if (isNotEmpty(param.minLat) && isNotEmpty(param.maxLat)) {
    whereCondition += ` AND job_latitude >= ${param.minLat} AND job_latitude <= ${param.maxLat}`;
  }
  if (isNotEmpty(param.minLng) && isNotEmpty(param.maxLng)) {
    whereCondition += ` AND job_longitude >= ${param.minLng} AND job_longitude <= ${param.maxLng}`;
  }
  if (whereCondition.startsWith(" AND")) {
    whereCondition = whereCondition.replace("AND", "");
    whereCondition = " WHERE " + whereCondition;
  }
  return whereCondition;
}

async function batchInsertOrUpdateJobAndBrowseHistory(jobs, now) {
  for (let i = 0; i < jobs.length; i++) {
    let job = jobs[i];
    await _insertOrUpdateJob(job, now, { update: false });
  }
  await batchAddJobBrowseHistory(jobs, now, JOB_VISIT_TYPE_SEARCH);
  await _batchInsertJobTag(jobs);
}

async function insertOrUpdateJobAndBrowseHistory(param, now) {
  await _insertOrUpdateJob(param, now, { update: false });
  await _insertJobTag(param);
  await addJobBrowseHistory(param.jobId, now, JOB_VISIT_TYPE_SEARCH);
}

/**
 * 
 * @param {Job} param 
 */
async function _insertJobTag(param) {
  let entity = new JobTagBO();
  entity.jobId = param.jobId;
  entity.sourceType = TAG_SOURCE_TYPE_PLATFORM;
  entity.source = param.jobPlatform;
  const tags = [];
  if (param.skillTag) {
    tags.push(...param.skillTag.split(",").filter(item => isNotEmpty(item)))
  }
  if (param.welfareTag) {
    tags.push(...param.welfareTag.split(",").filter(item => isNotEmpty(item)))
  }
  entity.tags = tags;
  await _addOrUpdateJobTag(entity);
}

/**
 * 
 * @param {Job} param 
 */
async function _batchInsertJobTag(jobs) {
  let jobTags = [];
  for (let i = 0; i < jobs.length; i++) {
    let job = jobs[i];
    let entity = new JobTagBO();
    entity.jobId = job.jobId;
    entity.sourceType = TAG_SOURCE_TYPE_PLATFORM;
    entity.source = job.jobPlatform;
    let tags = [];
    if (job.skillTag) {
      tags.push(...job.skillTag.split(",").filter(item => isNotEmpty(item)))
    }
    if (job.welfareTag) {
      tags.push(...job.welfareTag.split(",").filter(item => isNotEmpty(item)))
    }
    entity.tags = tags;
    jobTags.push(entity);
  }
  await _batchAddOrUpdateJobTag(jobTags);
}

async function _insertOrUpdateJob(param, now, { update = true } = {}) {
  let rows = [];
  const SQL_JOB_BY_ID = `SELECT job_id,job_platform,job_url,job_name,job_company_name,job_location_name,job_address,job_longitude,job_latitude,job_description,job_degree_name,job_year,job_salary_min,job_salary_max,job_salary_total_month,job_first_publish_datetime,boss_name,boss_company_name,boss_position,create_datetime,update_datetime,is_full_company_name,skill_tag,welfare_tag FROM job WHERE job_id = ?`;
  (await getDb()).exec({
    sql: SQL_JOB_BY_ID,
    rowMode: "object",
    bind: [param.jobId],
    resultRows: rows,
  });
  if (rows.length > 0) {
    if (update) {
      if (!param.updateDatetime) {
        const SQL_UPDATE_JOB = `
    UPDATE job SET job_platform=$job_platform,job_url=$job_url,job_name=$job_name,job_company_name=$job_company_name,job_location_name=$job_location_name,job_address=$job_address,job_longitude=$job_longitude,job_latitude=$job_latitude,job_description=$job_description,job_degree_name=$job_degree_name,job_year=$job_year,job_salary_min=$job_salary_min,job_salary_max=$job_salary_max,job_salary_total_month=$job_salary_total_month,job_first_publish_datetime=$job_first_publish_datetime,boss_name=$boss_name,boss_company_name=$boss_company_name,boss_position=$boss_position,update_datetime=$update_datetime,is_full_company_name=$is_full_company_name,skill_tag=$skill_tag,welfare_tag=$welfare_tag WHERE job_id = $job_id;
  `;
        (await getDb()).exec({
          sql: SQL_UPDATE_JOB,
          bind: {
            $job_id: param.jobId,
            $job_platform: param.jobPlatform,
            $job_url: convertEmptyStringToNull(param.jobUrl),
            $job_name: convertEmptyStringToNull(param.jobName),
            $job_company_name: convertEmptyStringToNull(param.jobCompanyName),
            $job_location_name: convertEmptyStringToNull(param.jobLocationName),
            $job_address: convertEmptyStringToNull(param.jobAddress),
            $job_longitude: convertEmptyStringToNull(param.jobLongitude),
            $job_latitude: convertEmptyStringToNull(param.jobLatitude),
            $job_description: convertEmptyStringToNull(param.jobDescription),
            $job_degree_name: convertEmptyStringToNull(param.jobDegreeName),
            $job_year: convertEmptyStringToNull(param.jobYear),
            $job_salary_min: convertEmptyStringToNull(param.jobSalaryMin),
            $job_salary_max: convertEmptyStringToNull(param.jobSalaryMax),
            $job_salary_total_month: convertEmptyStringToNull(
              param.jobSalaryTotalMonth
            ),
            $job_first_publish_datetime: dateToStr(param.jobFirstPublishDatetime),
            $boss_name: convertEmptyStringToNull(param.bossName),
            $boss_company_name: convertEmptyStringToNull(param.bossCompanyName),
            $boss_position: convertEmptyStringToNull(param.bossPosition),
            $update_datetime: dayjs(now).format("YYYY-MM-DD HH:mm:ss"),
            $is_full_company_name: param.isFullCompanyName,
            $skill_tag: convertEmptyStringToNull(param.skillTag),
            $welfare_tag: convertEmptyStringToNull(param.welfareTag),
          },
        });
      } else {
        let previousRowCreateDatetime = dayjs(rows[0].create_datetime);
        let previousRowUpdateDatetime = dayjs(rows[0].update_datetime);
        let currentRowCreateDatetime = dayjs(param.createDatetime);
        let currentRowUpdateDatetime = dayjs(param.updateDatetime);
        if (currentRowUpdateDatetime.isAfter(previousRowUpdateDatetime)) {
          const SQL_UPDATE_JOB = `
          UPDATE job SET job_platform=$job_platform,job_url=$job_url,job_name=$job_name,job_company_name=$job_company_name,job_location_name=$job_location_name,job_address=$job_address,job_longitude=$job_longitude,job_latitude=$job_latitude,job_description=$job_description,job_degree_name=$job_degree_name,job_year=$job_year,job_salary_min=$job_salary_min,job_salary_max=$job_salary_max,job_salary_total_month=$job_salary_total_month,job_first_publish_datetime=$job_first_publish_datetime,boss_name=$boss_name,boss_company_name=$boss_company_name,boss_position=$boss_position,update_datetime=$update_datetime,is_full_company_name=$is_full_company_name,skill_tag=$skill_tag,welfare_tag=$welfare_tag WHERE job_id = $job_id;
        `;
          (await getDb()).exec({
            sql: SQL_UPDATE_JOB,
            bind: {
              $job_id: param.jobId,
              $job_platform: param.jobPlatform,
              $job_url: convertEmptyStringToNull(param.jobUrl),
              $job_name: convertEmptyStringToNull(param.jobName),
              $job_company_name: convertEmptyStringToNull(param.jobCompanyName),
              $job_location_name: convertEmptyStringToNull(param.jobLocationName),
              $job_address: convertEmptyStringToNull(param.jobAddress),
              $job_longitude: convertEmptyStringToNull(param.jobLongitude),
              $job_latitude: convertEmptyStringToNull(param.jobLatitude),
              $job_description: convertEmptyStringToNull(param.jobDescription),
              $job_degree_name: convertEmptyStringToNull(param.jobDegreeName),
              $job_year: convertEmptyStringToNull(param.jobYear),
              $job_salary_min: convertEmptyStringToNull(param.jobSalaryMin),
              $job_salary_max: convertEmptyStringToNull(param.jobSalaryMax),
              $job_salary_total_month: convertEmptyStringToNull(
                param.jobSalaryTotalMonth
              ),
              $job_first_publish_datetime: dateToStr(param.jobFirstPublishDatetime),
              $boss_name: convertEmptyStringToNull(param.bossName),
              $boss_company_name: convertEmptyStringToNull(param.bossCompanyName),
              $boss_position: convertEmptyStringToNull(param.bossPosition),
              $update_datetime: currentRowUpdateDatetime.format("YYYY-MM-DD HH:mm:ss"),
              $is_full_company_name: param.isFullCompanyName,
              $skill_tag: convertEmptyStringToNull(param.skillTag),
              $welfare_tag: convertEmptyStringToNull(param.welfareTag),
            },
          });
        }
        //获取职位最早出现的时间
        if (currentRowCreateDatetime.isBefore(previousRowCreateDatetime)) {
          const SQL_UPDATE_JOB = `
          UPDATE job SET create_datetime=$create_datetime WHERE job_id = $job_id;
        `;
          (await getDb()).exec({
            sql: SQL_UPDATE_JOB,
            bind: {
              $job_id: param.jobId,
              $create_datetime: currentRowCreateDatetime.format("YYYY-MM-DD HH:mm:ss"),
            },
          });
        }
      }
    }
  } else {
    const SQL_INSERT_JOB = `
    INSERT INTO job (job_id,job_platform,job_url,job_name,job_company_name,job_location_name,job_address,job_longitude,job_latitude,job_description,job_degree_name,job_year,job_salary_min,job_salary_max,job_salary_total_month,job_first_publish_datetime,boss_name,boss_company_name,boss_position,create_datetime,update_datetime,is_full_company_name,skill_tag,welfare_tag) VALUES ($job_id,$job_platform,$job_url,$job_name,$job_company_name,$job_location_name,$job_address,$job_longitude,$job_latitude,$job_description,$job_degree_name,$job_year,$job_salary_min,$job_salary_max,$job_salary_total_month,$job_first_publish_datetime,$boss_name,$boss_company_name,$boss_position,$create_datetime,$update_datetime,$is_full_company_name,$skill_tag,$welfare_tag)
  `;
    (await getDb()).exec({
      sql: SQL_INSERT_JOB,
      bind: {
        $job_id: param.jobId,
        $job_platform: param.jobPlatform,
        $job_url: convertEmptyStringToNull(param.jobUrl),
        $job_name: convertEmptyStringToNull(param.jobName),
        $job_company_name: convertEmptyStringToNull(param.jobCompanyName),
        $job_location_name: convertEmptyStringToNull(param.jobLocationName),
        $job_address: convertEmptyStringToNull(param.jobAddress),
        $job_longitude: convertEmptyStringToNull(param.jobLongitude),
        $job_latitude: convertEmptyStringToNull(param.jobLatitude),
        $job_description: convertEmptyStringToNull(param.jobDescription),
        $job_degree_name: convertEmptyStringToNull(param.jobDegreeName),
        $job_year: convertEmptyStringToNull(param.jobYear),
        $job_salary_min: convertEmptyStringToNull(param.jobSalaryMin),
        $job_salary_max: convertEmptyStringToNull(param.jobSalaryMax),
        $job_salary_total_month: convertEmptyStringToNull(
          param.jobSalaryTotalMonth
        ),
        $job_first_publish_datetime: dateToStr(param.jobFirstPublishDatetime),
        $boss_name: convertEmptyStringToNull(param.bossName),
        $boss_company_name: convertEmptyStringToNull(param.bossCompanyName),
        $boss_position: convertEmptyStringToNull(param.bossPosition),
        $create_datetime: dayjs(param.createDatetime ?? now).format("YYYY-MM-DD HH:mm:ss"),
        $update_datetime: dayjs(param.updateDatetime ?? now).format("YYYY-MM-DD HH:mm:ss"),
        $is_full_company_name: param.isFullCompanyName,
        $skill_tag: convertEmptyStringToNull(param.skillTag),
        $welfare_tag: convertEmptyStringToNull(param.welfareTag),
      },
    });
  }
}

async function batchAddJobBrowseHistory(jobs, date, type) {
  let items = [];
  let datetime = dayjs(date).format("YYYY-MM-DD HH:mm:ss");
  for (let i = 0; i < jobs.length; i++) {
    let job = jobs[i];
    items.push({
      jobId: job.jobId,
      jobVisitDatetime: datetime,
      jobVisitType: type,
    })
  }
  return await batchInsertOrReplace(new JobBrowseHistory(), "job_browse_history", items);
}

async function addJobBrowseHistory(jobId, date, type) {
  const SQL_INSERT_JOB_BROWSE_HISTORY = `
  INSERT INTO job_browse_history (job_id,job_visit_datetime,job_visit_type) VALUES ($job_id,$job_visit_datetime,$job_visit_type)
  `;
  return (await getDb()).exec({
    sql: SQL_INSERT_JOB_BROWSE_HISTORY,
    bind: {
      $job_id: jobId,
      $job_visit_datetime: dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
      $job_visit_type: type,
    },
  });
}

function genSqlJobSearchQuery(param) {
  let joinSql = null;
  if (param.hasBrowseTime) {
    joinSql = `RIGHT JOIN (SELECT job_id AS _jobId,COUNT(job_id) AS browseDetailCount,MAX(job_visit_datetime) AS latestBrowseDetailDatetime FROM JOB_BROWSE_HISTORY WHERE job_visit_type = 'DETAIL' GROUP BY job_id) AS t2 ON t1.job_id = t2._jobId AND t2.browseDetailCount > 0`
  } else {
    joinSql = `LEFT JOIN (SELECT job_id AS _jobId,COUNT(job_id) AS browseDetailCount,MAX(job_visit_datetime) AS latestBrowseDetailDatetime FROM JOB_BROWSE_HISTORY WHERE job_visit_type = 'DETAIL' GROUP BY job_id) AS t2 ON t1.job_id = t2._jobId`;
  }
  return `SELECT job_id AS jobId,job_platform AS jobPlatform,job_url AS jobUrl,job_name AS jobName,job_company_name AS jobCompanyName,job_location_name AS jobLocationName,job_address AS jobAddress,job_longitude AS jobLongitude,job_latitude AS jobLatitude,job_description AS jobDescription,job_degree_name AS jobDegreeName,job_year AS jobYear,job_salary_min AS jobSalaryMin,job_salary_max AS jobSalaryMax,job_salary_total_month AS jobSalaryTotalMonth,job_first_publish_datetime AS jobFirstPublishDatetime,boss_name AS bossName,boss_company_name AS bossCompanyName,boss_position AS bossPosition,create_datetime AS createDatetime,update_datetime AS updateDatetime,is_full_company_name AS isFullCompanyName,skill_tag AS skillTag,welfare_tag AS welfareTag,IFNULL(t2.browseDetailCount,0) AS browseDetailCount,t2.latestBrowseDetailDatetime AS latestBrowseDetailDatetime FROM job AS t1 ${joinSql}`;
}

const SQL_GROUP_BY_COUNT_AVG_SALARY = `
SELECT 
	t2.levels,
	COUNT(t2.levels) AS total
FROM
	(
	SELECT
		(CASE
			WHEN t1.avgsalary<3000 THEN '<3k'
			WHEN t1.avgsalary >= 3000
			AND t1.avgsalary<6000 THEN '3k-6k'
			WHEN t1.avgsalary >= 6000
			AND t1.avgsalary<9000 THEN '6k-9k'
			WHEN t1.avgsalary >= 9000
			AND t1.avgsalary<12000 THEN '9k-12k'
			WHEN t1.avgsalary >= 12000
			AND t1.avgsalary<15000 THEN '12k-15k'
			WHEN t1.avgsalary >= 15000
			AND t1.avgsalary<18000 THEN '15k-18k'
			WHEN t1.avgsalary >= 18000
			AND t1.avgsalary<21000 THEN '18k-21k'
			WHEN t1.avgsalary >= 21000
			AND t1.avgsalary<24000 THEN '21k-24k'
			ELSE '>24k'
		END) AS levels
	FROM
		(
		SELECT
			(t0.jobSalaryMin + t0.jobSalaryMax)/ 2 AS avgsalary
		FROM
			(#{injectSql}) AS t0
		where
			avgsalary > 0) AS t1
) AS t2
GROUP BY
	t2.levels;
`;
const SQL_JOB_BY_JOB_URL = `SELECT job_id,job_platform,job_url,job_name,job_company_name,job_location_name,job_address,job_longitude,job_latitude,job_description,job_degree_name,job_year,job_salary_min,job_salary_max,job_salary_total_month,job_first_publish_datetime,boss_name,boss_company_name,boss_position,create_datetime,update_datetime,is_full_company_name FROM job WHERE job_url = ?`;


export async function _fillSearchResultExtraInfo(items, queryRows) {
  let companyIds = [];
  let companyIdMap = new Map();
  let jobIds = [];
  let jobIdMap = new Map();
  for (let i = 0; i < queryRows.length; i++) {
    let item = queryRows[i];
    let resultItem = new JobDTO();
    let keys = Object.keys(item);
    for (let n = 0; n < keys.length; n++) {
      let key = keys[n];
      resultItem[key] = item[key];
    }
    items.push(item);
    companyIdMap.set(genIdFromText(item.jobCompanyName))
    jobIdMap.set(item.jobId);
  }
  companyIds.push(...Array.from(companyIdMap.keys()));
  jobIds.push(...Array.from(jobIdMap.keys()));
  let companyTagDTOList = await _getAllCompanyTagDTOByCompanyIds(companyIds);
  let companyIdAndCompanyTagListMap = new Map();
  companyTagDTOList.forEach(item => {
    let companyId = item.companyId;
    if (!companyIdAndCompanyTagListMap.has(companyId)) {
      companyIdAndCompanyTagListMap.set(companyId, []);
    }
    companyIdAndCompanyTagListMap.get(companyId).push(item);
  });
  let jobTagDTOList = await _getAllJobTagDTOByJobIds(jobIds);
  let jobIdAndJobTagListMap = new Map();
  jobTagDTOList.forEach(item => {
    let id = item.jobId;
    if (!jobIdAndJobTagListMap.has(id)) {
      jobIdAndJobTagListMap.set(id, []);
    }
    jobIdAndJobTagListMap.get(id).push(item);
  });
  let companyDTOList = await _getCompanyDTOByIds(companyIds);
  let companyIdAndCompanyDTOListMap = new Map();
  companyDTOList.forEach(item => {
    let companyId = item.companyId;
    if (!companyIdAndCompanyDTOListMap.has(companyId)) {
      companyIdAndCompanyDTOListMap.set(companyId, item);
    }
  });
  items.forEach(item => {
    item.companyTagDTOList = companyIdAndCompanyTagListMap.get(genIdFromText(item.jobCompanyName));
    item.jobTagDTOList = jobIdAndJobTagListMap.get(item.jobId);
    item.companyDTO = companyIdAndCompanyDTOListMap.get(genIdFromText(item.jobCompanyName));
    item.skillTagList = item.skillTag?.split(",") || [];
    item.welfareTagList = item.welfareTag?.split(",") || [];
  });
}