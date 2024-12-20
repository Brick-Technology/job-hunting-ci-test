import { TAG_SOURCE_TYPE_CUSTOM } from "@/common";
export function useTag() {

    const convertToTagData = (items) => {
        let result = new Array;
        let tagIdAndSourceListMap = new Map();
        let tagIdAndItemMap = new Map();
        items.forEach(item => {
            const tagId = item.tagId;
            if (!tagIdAndSourceListMap.has(tagId)) {
                tagIdAndSourceListMap.set(tagId, []);
                tagIdAndItemMap.set(tagId, item);
            }
            tagIdAndSourceListMap.get(tagId).push({
                sourceType: item.sourceType,
                source: item.source,
                createDatetime: item.createDatetime,
                updateDatetime: item.updateDatetime,
            });
        });
        tagIdAndItemMap.forEach(value => {
            result.push({
                tagId: value.tagId,
                tagName: value.tagName,
                isPublic: value.isPublic,
                sourceList: tagIdAndSourceListMap.get(value.tagId),
                self: tagIdAndSourceListMap.get(value.tagId).filter(item => item.source == null && item.sourceType == TAG_SOURCE_TYPE_CUSTOM).length > 0
            });
        })
        return result;
    }

    return { convertToTagData }
}