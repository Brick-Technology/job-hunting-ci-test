import { TagData } from "../data/TagData";

export function useTag() {

    const convertToDataList = (items: any[]): TagData[] => {
        let result = [];
        items.map((item) => {
            result.push(convertToData(item));
        });
        return result;
    };

    const convertToData = (item: any): TagData => {
        const {
            tagId,
            tagName,
            createDatetime,
            updateDatetime,
            isPublic,
        } = item ?? {};
        return {
            tagId,
            tagName,
            createDatetime,
            updateDatetime,
            isPublic,
        }
    }

    const sortFieldMap = {
        "createDatetime": "createDatetime",
        "updateDatetime": "updateDatetime",
    }

    const convertSortField = (key: any) => {
        return sortFieldMap[key];
    }

    return { convertToDataList, convertToData, convertSortField }
}