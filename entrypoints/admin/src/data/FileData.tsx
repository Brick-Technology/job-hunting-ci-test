export type FileData = {
    id: string;
    name: string;
    sha: string;
    encoding: string;
    content: string;
    size: number;
    type: string;
    createDatetime?: string;
    updateDatetime?: string;
    isDelete: boolean;
}