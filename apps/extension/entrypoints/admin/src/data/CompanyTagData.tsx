import { CompanyTagDTO } from "@/common/data/dto/companyTagDTO";

export type CompanyTagData = {
    companyId: string;
    companyName: string;
    createDatetime: string;
    updateDatetime: string;
    nameArray: string[];
    idArray: string[];
    tagArray: CompanyTagDTO[]
}