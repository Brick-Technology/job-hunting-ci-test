export type TagData = {
    tagId: string;
    tagName: string;
    createDatetime?: string;
    updateDatetime?: string;
    isPublic: number;
    sourceList?: {
        source: string,
        createDatetime?: string,
        updateDatetime?: string,
    }[];
    self?:boolean,
}