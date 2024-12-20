import { TAG_SOURCE_TYPE_CUSTOM } from "../../index";
export class CompanyTagBO{
    companyName;
    tags;
    sourceType = TAG_SOURCE_TYPE_CUSTOM;
    source = null;
    updateDatetime;
}