import { CompanyBO } from "./data/bo/companyBO";
import { CompanyTagBO } from "./data/bo/companyTagBO";
import { JobTagBO } from "./data/bo/jobTagBO";
import { Job } from "./data/domain/job";
import { convertDateStringToDateObject, genIdFromText } from "./utils";

const HEADER_VERSION_PREFIX = "__VERSION_";

export const validImportData = (data, allVersionValidArray) => {
    let dataVersion = 0;
    //查找数据文件版本，找不到则按初版处理
    if (data.length > 0) {
        let headerRowArray = data[0];
        for (let i = 0; i < headerRowArray.length; i++) {
            let header = headerRowArray[i];
            if (header.startsWith(HEADER_VERSION_PREFIX)) {
                let numberString = header.replaceAll(HEADER_VERSION_PREFIX, "");
                let number = Number.parseInt(numberString);
                if (Number.isInteger(number)) {
                    dataVersion = number;
                    break;
                }
            }
        }
    }
    //如果超过当前程序版本所支持的数据版本，则按初版处理
    if (dataVersion > allVersionValidArray.length) {
        dataVersion = 0;
    }
    let validArray = allVersionValidArray[dataVersion];
    let colCount = 0;
    let lackColumnMap = new Map();
    for (let i = 0; i < validArray.length; i++) {
        lackColumnMap.set(validArray[i], null);
    }
    if (data.length > 0) {
        let headerRowArray = data[0];
        for (let i = 0; i < headerRowArray.length; i++) {
            let header = headerRowArray[i];
            if (lackColumnMap.has(header)) {
                colCount++;
                lackColumnMap.delete(header);
            }
        }
    }
    return { validResult: colCount == validArray.length, lackColumn: lackColumnMap.keys().toArray() };
}

const fillDataVersion = (obj, header) => {
    obj[`${HEADER_VERSION_PREFIX}${header.length - 1}`] = null;
}

export const JOB_FILE_HEADER = [
    [
        "职位自编号",
        "发布平台",
        "职位访问地址",
        "职位",
        "公司",
        "公司是否为全称",
        "地区",
        "地址",
        "经度",
        "纬度",
        "职位描述",
        "学历",
        "所需经验",
        "最低薪资",
        "最高薪资",
        "首次发布时间",
        "招聘人",
        "招聘公司",
        "招聘者职位",
        "首次扫描日期",
        "记录更新日期",
    ],
    [
        "职位自编号",
        "发布平台",
        "职位访问地址",
        "职位",
        "公司",
        "公司是否为全称",
        "地区",
        "地址",
        "经度",
        "纬度",
        "职位描述",
        "学历",
        "所需经验",
        "技能",
        "福利",
        "最低薪资",
        "最高薪资",
        "首次发布时间",
        "招聘人",
        "招聘公司",
        "招聘者职位",
        "首次扫描日期",
        "记录更新日期",
    ]
];

export const jobDataToExcelJSONArray = (list) => {
    let result = [];
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let obj = {
            职位自编号: item.jobId,
            发布平台: item.jobPlatform,
            职位访问地址: item.jobUrl,
            职位: item.jobName,
            公司: item.jobCompanyName,
            公司是否为全称: item.isFullCompanyName,
            地区: item.jobLocationName,
            地址: item.jobAddress,
            经度: item.jobLongitude,
            纬度: item.jobLatitude,
            职位描述: item.jobDescription,
            学历: item.jobDegreeName,
            所需经验: item.jobYear,
            技能: item.skillTag,
            福利: item.welfareTag,
            最低薪资: item.jobSalaryMin,
            最高薪资: item.jobSalaryMax,
            几薪: item.jobSalaryTotalMonth,
            首次发布时间: item.jobFirstPublishDatetime,
            招聘人: item.bossName,
            招聘公司: item.bossCompanyName,
            招聘者职位: item.bossPosition,
            首次扫描日期: item.createDatetime,
            记录更新日期: item.updateDatetime,
        };
        fillDataVersion(obj, JOB_FILE_HEADER);
        result.push(obj);
    }
    return result;
}

export const jobExcelDataToObjectArray = (data) => {
    let jobList = [];
    for (let i = 0; i < data.length; i++) {
        let dataItem = data[i];
        let item = new Job();
        item.jobId = dataItem['职位自编号'];
        item.jobPlatform = dataItem['发布平台'];
        item.jobUrl = dataItem['职位访问地址'];
        item.jobName = dataItem['职位'];
        item.jobCompanyName = dataItem['公司'];
        item.isFullCompanyName = dataItem['公司是否为全称'] ? true : false;
        item.jobLocationName = dataItem['地区'];
        item.jobAddress = dataItem['地址'];
        item.jobLongitude = dataItem['经度'];
        item.jobLatitude = dataItem['纬度'];
        item.jobDescription = dataItem['职位描述'];
        item.jobDegreeName = dataItem['学历'];
        item.jobYear = dataItem['所需经验'];
        item.skillTag = dataItem['技能'];
        item.welfareTag = dataItem['福利'];
        item.jobSalaryMin = dataItem['最低薪资'];
        item.jobSalaryMax = dataItem['最高薪资'];
        item.jobSalaryTotalMonth = dataItem['几薪'];
        item.jobFirstPublishDatetime = dataItem['首次发布时间'];
        item.bossName = dataItem['招聘人'];
        item.bossCompanyName = dataItem['招聘公司'];
        item.bossPosition = dataItem['招聘者职位'];
        item.createDatetime = dataItem['首次扫描日期'];
        item.updateDatetime = dataItem['记录更新日期'];
        jobList.push(item);
    }
    return jobList;
}

export const COMPANY_FILE_HEADER = [
    [
        "公司",
        "公司描述",
        "成立时间",
        "经营状态",
        "法人",
        "统一社会信用代码",
        "官网",
        "社保人数",
        "自身风险数",
        "关联风险数",
        "地址",
        "经营范围",
        "纳税人识别号",
        "所属行业",
        "工商注册号",
        "经度",
        "纬度",
        "数据来源地址",
        "数据来源平台",
        "数据来源记录编号",
        "数据来源更新时间",
    ], [
        "公司",
        "公司描述",
        "成立时间",
        "经营状态",
        "法人",
        "统一社会信用代码",
        "官网",
        "社保人数",
        "自身风险数",
        "关联风险数",
        "地址",
        "经营范围",
        "纳税人识别号",
        "所属行业",
        "工商注册号",
        "经度",
        "纬度",
        "数据来源地址",
        "数据来源平台",
        "数据来源记录编号",
        "数据来源更新时间",
        "记录创建日期",
        "记录更新日期",
    ]
];

export const companyDataToExcelJSONArray = (list) => {
    let result = [];
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let obj = {
            公司: item.companyName,
            公司描述: item.companyDesc,
            成立时间: item.companyStartDate,
            经营状态: item.companyStatus,
            法人: item.companyLegalPerson,
            统一社会信用代码: item.companyUnifiedCode,
            官网: item.companyWebSite,
            社保人数: item.companyInsuranceNum,
            自身风险数: item.companySelfRisk,
            关联风险数: item.companyUnionRisk,
            地址: item.companyAddress,
            经营范围: item.companyScope,
            纳税人识别号: item.companyTaxNo,
            所属行业: item.companyIndustry,
            工商注册号: item.companyLicenseNumber,
            经度: item.companyLongitude,
            纬度: item.companyLatitude,
            数据来源地址: item.sourceUrl,
            数据来源平台: item.sourcePlatform,
            数据来源记录编号: item.sourceRecordId,
            数据来源更新时间: item.sourceRefreshDatetime,
            记录创建日期: item.createDatetime,
            记录更新日期: item.updateDatetime,
        };
        fillDataVersion(obj, COMPANY_FILE_HEADER);
        result.push(obj);
    }
    return result;
}

export const companyExcelDataToObjectArray = (data, datetime) => {
    let companyBOList = [];
    for (let i = 0; i < data.length; i++) {
        let dataItem = data[i];
        let item = new CompanyBO();
        item.companyId = genIdFromText(dataItem['公司']);
        item.companyName = dataItem['公司'];
        item.companyDesc = dataItem['公司描述'];
        item.companyStartDate = convertDateStringToDateObject(dataItem['成立时间']);
        item.companyStatus = dataItem['经营状态'];
        item.companyLegalPerson = dataItem['法人'];
        item.companyUnifiedCode = dataItem['统一社会信用代码'];
        item.companyWebSite = dataItem['官网'];
        item.companyInsuranceNum = dataItem['社保人数'];
        item.companySelfRisk = dataItem['自身风险数'];
        item.companyUnionRisk = dataItem['关联风险数'];
        item.companyAddress = dataItem['地址'];
        item.companyScope = dataItem['经营范围'];
        item.companyTaxNo = dataItem['纳税人识别号'];
        item.companyIndustry = dataItem['所属行业'];
        item.companyLicenseNumber = dataItem['工商注册号'];
        item.companyLongitude = dataItem['经度'];
        item.companyLatitude = dataItem['纬度'];
        item.sourceUrl = dataItem['数据来源地址'];
        item.sourcePlatform = dataItem['数据来源平台'];
        item.sourceRecordId = dataItem['数据来源记录编号'];
        item.sourceRefreshDatetime = convertDateStringToDateObject(dataItem['数据来源更新时间']);
        item.createDatetime = convertDateStringToDateObject(dataItem['记录创建日期']) ?? convertDateStringToDateObject(datetime);
        item.updateDatetime = convertDateStringToDateObject(dataItem['记录更新日期']) ?? convertDateStringToDateObject(datetime);
        companyBOList.push(item);
    }
    return companyBOList;
}

export const COMPANY_TAG_FILE_HEADER = [
    [
        "公司",
        "标签",
    ],
    [
        "公司",
        "标签",
        "记录更新日期",
    ]
];

export const companyTagDataToExcelJSONArrayForView = (list) => {
    let result = [];
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let obj = {
            公司: item.companyName,
            标签: Array.from(new Set(item.tagNameArray)).join(","),
            记录更新日期: item.updateDatetime,
        }
        fillDataVersion(obj, JOB_TAG_FILE_HEADER);
        result.push(obj);
    }
    return result;
}

export const companyTagDataToExcelJSONArray = (list) => {
    let result = [];
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let obj = {
            公司: item.companyName,
            标签: item.tagNameArray,
            记录更新日期: item.updateDatetime,
        };
        fillDataVersion(obj, COMPANY_TAG_FILE_HEADER);
        result.push(obj);
    }
    return result;
}

export const companyTagExcelDataToObjectArray = (data, datetime) => {
    let companyTagBOList = [];
    for (let i = 0; i < data.length; i++) {
        let dataItem = data[i];
        let item = new CompanyTagBO();
        item.companyName = dataItem['公司'];
        item.tags = dataItem['标签'].split(",");
        item.updateDatetime = convertDateStringToDateObject(dataItem['记录更新日期']) ?? convertDateStringToDateObject(datetime);
        companyTagBOList.push(item);
    }
    return companyTagBOList;
}

export const JOB_TAG_FILE_HEADER = [
    [
        "职位编号",
        "标签",
    ],
    [
        "职位编号",
        "标签",
        "记录更新日期",
    ],
];

export const jobTagDataToExcelJSONArrayForView = (list) => {
    let result = [];
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let obj = {
            职位编号: item.jobId,
            标签: Array.from(new Set(item.tagNameArray)).join(","),
            记录更新日期: item.updateDatetime,
        }
        fillDataVersion(obj, JOB_TAG_FILE_HEADER);
        result.push(obj);
    }
    return result;
}

export const jobTagDataToExcelJSONArray = (list) => {
    let result = [];
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let obj = {
            职位编号: item.jobId,
            标签: item.tagNameArray,
            记录更新日期: item.updateDatetime,
        }
        fillDataVersion(obj, JOB_TAG_FILE_HEADER);
        result.push(obj);
    }
    return result;
}

export const jobTagExcelDataToObjectArray = (data, datetime) => {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        let dataItem = data[i];
        let item = new JobTagBO();
        item.jobId = dataItem['职位编号'];
        item.tags = dataItem['标签'].split(",");
        item.updateDatetime = convertDateStringToDateObject(dataItem['记录更新日期']) ?? convertDateStringToDateObject(datetime);
        result.push(item);
    }
    return result;
}
