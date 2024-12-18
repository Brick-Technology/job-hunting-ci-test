import { JobTagDTO } from "@/common/data/dto/jobTagDTO";
import { JobTagData } from "../data/JobTagData";
import { TagData } from "../data/TagData";
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

    const convertToTagData = (items: JobTagDTO[]): TagData[] => {
        let result = new Array<TagData>;
        let tagIdAndSourceListMap = new Map();
        let tagIdAndItemMap = new Map();
        let tagIdAndSourceStringListMap = new Map();
        items.forEach(item => {
            const tagId = item.tagId;
            if (!tagIdAndSourceListMap.has(tagId)) {
                tagIdAndSourceListMap.set(tagId, []);
                tagIdAndItemMap.set(tagId, item);
                tagIdAndSourceStringListMap.set(tagId,[]);
            }
            tagIdAndSourceListMap.get(tagId).push({
                source: item.source,
                createDatetime: item.createDatetime,
                updateDatetime: item.updateDatetime,
            });
            tagIdAndSourceStringListMap.get(tagId).push(item.source);
        });
        tagIdAndItemMap.forEach(value => {
            result.push({
                tagId: value.tagId,
                tagName: value.tagName,
                isPublic: value.isPublic,
                sourceList: tagIdAndSourceListMap.get(value.tagId),
                self:tagIdAndSourceStringListMap.get(value.tagId).includes(null)
            });
        })
        return result;
    }

    const sortFieldMap = {
        "updateDatetime": "updateDatetime",
    }

    const convertSortField = (key: any) => {
        return sortFieldMap[key];
    }

    return { convertToJobTagDataList, convertToJobTagData, convertSortField, convertToTagData }
}