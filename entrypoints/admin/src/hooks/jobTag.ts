import { useJobTag as _useJobTag } from "@/common/hooks/jobTag";
import { JobTagData } from "../data/JobTagData";

const { convertToTagData } = _useJobTag();
export function useJobTag() {

    const convertToJobTagDataList = (items: any[]): JobTagData[] => {
        let result = [];
        items.map((item) => {
            result.push(convertToJobTagData(item));
        });
        return result;
    };

    const convertToJobTagData = (item: any): JobTagData => {
        const {
            id,
            jobId,
            job,
            createDatetime,
            updateDatetime,
            tagIdArray,
            tagNameArray,
            tagArray,
        } = item ?? {};

        return {
            id,
            jobId,
            name: job ? job.jobName : "",
            platform: job ? job.jobPlatform : "",
            companyName: job ? job.jobCompanyName : "",
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

    return { convertToJobTagDataList, convertToJobTagData, convertSortField, convertToTagData }
}