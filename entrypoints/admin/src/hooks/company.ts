import { CompanyData } from "../data/CompanyData";

export function useCompany() {

    const convertToCompanyDataList = (items: any[]): CompanyData[] => {
        let result = [];
        items.map((item) => {
            result.push(convertToCompanyData(item));
        });
        return result;
    };

    const convertToCompanyData = (item: any): CompanyData => {
        const {
            companyId,
            companyName,
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
            sourceUrl,
            tagNameArray,
            sourcePlatform,
            sourceRecordId,
            sourceRefreshDatetime,
            createDatetime,
            updateDatetime,
            companyTagList,
        } = item ?? {};
        return {
            id: companyId,
            name: companyName,
            companyTagList,
            url: sourceUrl,
            status: companyStatus,
            startDate: companyStartDate,
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
            sourcePlatform,
            sourceRecordId,
            sourceRefreshDatetime,
            createDatetime,
            updateDatetime,
        }
    }

    const sortFieldMap = {
        "startDate": "company_start_date",
        "updateDatetime": "update_datetime",
    }

    const convertSortField = (key: any) => {
        return sortFieldMap[key];
    }

    return { convertToCompanyDataList, convertToCompanyData, convertSortField }
}