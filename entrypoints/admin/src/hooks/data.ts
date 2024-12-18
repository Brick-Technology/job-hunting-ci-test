import { CompanyApi, JobApi } from "@/common/api";
import { JobTagExportBO } from "@/common/data/bo/jobTagExportBO";
import { SearchCompanyBO } from "@/common/data/bo/searchCompanyBO";
import { SearchCompanyTagBO } from "@/common/data/bo/searchCompanyTagBO";
import { SearchJobBO } from "@/common/data/bo/searchJobBO";
import {
    COMPANY_FILE_HEADER, COMPANY_TAG_FILE_HEADER,
    companyDataToExcelJSONArray, companyExcelDataToObjectArray,
    companyTagDataToExcelJSONArray, companyTagExcelDataToObjectArray,
    JOB_FILE_HEADER,
    JOB_TAG_FILE_HEADER,
    jobDataToExcelJSONArray, jobExcelDataToObjectArray,
    jobTagDataToExcelJSONArray, jobTagExcelDataToObjectArray
} from "@/common/excel";
import {
    getMergeDataListForCompany, getMergeDataListForCompanyTag,
    getMergeDataListForJob, getMergeDataListForJobTag
} from "@/common/service/dataSyncService";
export function useData() {

    //10 million
    const MAX_RECORD_COUNT = 10000000;

    const getJobDataToExcelJsonArray = async () => {
        let searchParam = new SearchJobBO();
        searchParam.pageNum = 1;
        searchParam.pageSize = MAX_RECORD_COUNT;
        searchParam.orderByColumn = "updateDatetime";
        searchParam.orderBy = "DESC";
        let data = await JobApi.searchJob(searchParam);
        let list = data.items;
        let result = jobDataToExcelJSONArray(list);
        return result;
    }

    const saveJobData = async (data) => {
        let jobList = jobExcelDataToObjectArray(data);
        let targetList = await getMergeDataListForJob(jobList, "jobId", async (ids) => {
            return JobApi.jobGetByIds(ids);
        });
        await JobApi.batchAddOrUpdateJobWithTransaction(targetList);
        return targetList;
    }

    const getCompanyDataToExcelJsonArray = async () => {
        let searchParam = new SearchCompanyBO();
        searchParam.pageNum = 1;
        searchParam.pageSize = MAX_RECORD_COUNT;
        searchParam.orderByColumn = "updateDatetime";
        searchParam.orderBy = "DESC";
        let data = await CompanyApi.searchCompany(searchParam);
        let list = data.items;
        let result = companyDataToExcelJSONArray(list);
        return result;
    }

    const saveCompanyData = async (data) => {
        let companyBOList = companyExcelDataToObjectArray(data);
        let targetList = await getMergeDataListForCompany(companyBOList, "companyId", async (ids) => {
            return CompanyApi.companyGetByIds(ids);
        });
        await CompanyApi.batchAddOrUpdateCompanyWithTransaction(targetList);
        return targetList;
    }

    const getCompanyTagDataToExcelJsonArray = async () => {
        let searchParam = new SearchCompanyTagBO();
        searchParam.pageNum = 1;
        searchParam.pageSize = MAX_RECORD_COUNT;
        searchParam.orderByColumn = "updateDatetime";
        searchParam.orderBy = "DESC";
        let data = await CompanyApi.searchCompanyTag(searchParam);
        let list = data.items;
        let result = companyTagDataToExcelJSONArray(list);
        return result;
    }

    const saveCompanyTagData = async (data) => {
        let companyTagBOList = companyTagExcelDataToObjectArray(data);
        let targetList = await getMergeDataListForCompanyTag(companyTagBOList, async (ids) => {
            return await CompanyApi.getAllCompanyTagDTOByCompanyIds(ids);
        })
        await CompanyApi.batchAddOrUpdateCompanyTagWithTransaction(targetList);
        return targetList;
    }

    const getJobTagDataToExcelJsonArray = async () => {
        let searchParam = new JobTagExportBO();
        searchParam.source = "";
        let list = await JobApi.jobTagExport(searchParam);
        let result = jobTagDataToExcelJSONArray(list);
        return result;
    }

    const saveJobTagData = async (data) => {
        let result = jobTagExcelDataToObjectArray(data);
        let targetList = await getMergeDataListForJobTag(result, "jobId", async (ids) => {
            let searchParam = new JobTagExportBO();
            searchParam.source = "";
            searchParam.jobIds = ids;
            return await JobApi.jobTagExport(searchParam);
        })
        await JobApi.jobTagBatchAddOrUpdateWithTransaction(targetList);
        return targetList;
    }

    return {
        getJobDataToExcelJsonArray, saveJobData, getCompanyDataToExcelJsonArray,
        saveCompanyData, getCompanyTagDataToExcelJsonArray, saveCompanyTagData,
        getJobTagDataToExcelJsonArray, saveJobTagData,
        JOB_FILE_HEADER, COMPANY_FILE_HEADER, COMPANY_TAG_FILE_HEADER, JOB_TAG_FILE_HEADER,
    }
}

