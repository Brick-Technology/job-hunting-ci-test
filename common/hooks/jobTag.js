export function useJobTag() {

    const convertToTagData = (items) => {
        let result = new Array;
        let tagIdAndSourceListMap = new Map();
        let tagIdAndItemMap = new Map();
        let tagIdAndSourceStringListMap = new Map();
        items.forEach(item => {
            const tagId = item.tagId;
            if (!tagIdAndSourceListMap.has(tagId)) {
                tagIdAndSourceListMap.set(tagId, []);
                tagIdAndItemMap.set(tagId, item);
                tagIdAndSourceStringListMap.set(tagId, []);
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
                self: tagIdAndSourceStringListMap.get(value.tagId).includes(null)
            });
        })
        return result;
    }

    return { convertToTagData }
}