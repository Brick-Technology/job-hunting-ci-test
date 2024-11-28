import {
    PLATFORM_51JOB,
    PLATFORM_BOSS,
    PLATFORM_LAGOU,
    PLATFORM_LIEPIN,
    PLATFORM_ZHILIAN,
    PLATFORM_JOBSDB,
} from "@/common";

import { logo } from "../assets";
import { JobData } from "../data/JobData";
import dayjs from "dayjs";

export function useJob() {

    const convertToJobDataList = (item: any[]): JobData[] => {
        let result = [];
        item.map((item) => {
            result.push(convertToJobData(item));
        });
        return result;
    };

    const convertToJobData = (item: any): JobData => {
        const {
            companyStatus,
            companyStartDate,
            companyIndustry,
            companyUnifiedCode,
            companyTaxNo,
            companyLicenseNumber,
            companyLegalPerson,
            companyWebSite,
            companyInsuranceNum,
            companySelfRisk,
            companyUnionRisk,
            companyAddress,
            companyLongitude,
            companyLatitude,
            companyDesc,
        } = item.companyDTO ?? {};

        return {
            id: item.jobId,
            name: item.jobName,
            url: item.jobUrl,
            salaryMin: item.jobSalaryMin,
            salaryMax: item.jobSalaryMax,
            company: {
                name: item.jobCompanyName,
                companyTagList: item.companyTagDTOList,
                url: item.companyDTO?.sourceUrl,
                status: companyStatus,
                startDate: dayjs(companyStartDate).toDate(),
                industry: companyIndustry,
                unifiedCode: companyUnifiedCode,
                taxNo: companyTaxNo,
                licenseNumber: companyLicenseNumber,
                legalPerson: companyLegalPerson,
                webSite: companyWebSite,
                insuranceNum: companyInsuranceNum,
                selfRisk: companySelfRisk,
                unionRisk: companyUnionRisk,
                address: companyAddress,
                longitude: companyLongitude,
                latitude: companyLatitude,
                desc: companyDesc,
            },
            jobTagList: item.jobTagDTOList,
            address: item.jobAddress,
            publishDatetime: item.jobFirstPublishDatetime,
            bossName: item.bossName,
            bossPosition: item.bossPosition,
            platform: item.jobPlatform,
            desc: item.jobDescription,
            degree: item.jobDegreeName,
            longitude: item.jobLongitude,
            latitude: item.jobLatitude,
            browseTime: item.latestBrowseDetailDatetime,
        };
    };

    const platformFormat = (value: string) => {
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

    const platformLogo = (value: string) => {
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

    return { platformFormat, platformLogo, convertToJobDataList, convertToJobData }

}