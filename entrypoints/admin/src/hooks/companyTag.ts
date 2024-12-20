import { CompanyTagData } from "../data/CompanyTagData";

export function useCompanyTag() {

    const convertToCompanyTagDataList = (items: any[]): CompanyTagData[] => {
        let result = [];
        items.map((item) => {
            result.push(convertToCompanyTagData(item));
        });
        return result;
    };

    const convertToCompanyTagData = (item: any): CompanyTagData => {
        const {
            companyId,
            companyName,
            createDatetime,
            updateDatetime,
            tagIdArray,
            tagNameArray,
            tagArray,
        } = item ?? {};
        return {
            companyId,
            companyName,
            createDatetime,
            updateDatetime,
            nameArray: tagNameArray,
            idArray: tagIdArray,
            tagArray
        }
    }

    const sortFieldMap = {
        "updateDatetime": "updateDatetime",
    }

    const convertSortField = (key: any) => {
        return sortFieldMap[key];
    }

    return { convertToCompanyTagDataList, convertToCompanyTagData, convertSortField }
}