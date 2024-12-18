import { TAG_SOURCE_TYPE_CUSTOM } from "../../index";
export class JobTagBO {
    jobId;
    tags;
    sourceType = TAG_SOURCE_TYPE_CUSTOM;
    source = null;
    updateDatetime;
}