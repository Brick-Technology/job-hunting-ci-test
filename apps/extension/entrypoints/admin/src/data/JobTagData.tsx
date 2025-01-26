import { JobTagDTO } from "@/common/data/dto/jobTagDTO";

export type JobTagData = {
    id: string;
    jobId: string;
    name: string;
    platform: string;
    companyName: string;
    createDatetime: string;
    updateDatetime: string;
    nameArray: string[];
    idArray: string[];
    tagArray: JobTagDTO[];
}