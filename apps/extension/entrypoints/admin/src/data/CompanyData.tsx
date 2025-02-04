import { CompanyTagDTO } from "@/common/data/dto/companyTagDTO";
export type CompanyData = {
  id: string;
  name: string;
  companyTagList?: CompanyTagDTO[];
  url?: string;
  status: string;
  startDate: Date;
  industry: String;
  unifiedCode: string;
  taxNo: string;
  licenseNumber: string;
  legalPerson: string;
  webSite: string;
  insuranceNum: number;
  selfRisk: number;
  unionRisk: number;
  address: string;
  longitude: number;
  latitude: number;
  desc: string;
  sourcePlatform: string,
  sourceRecordId: string,
  sourceRefreshDatetime: Date,
  createDatetime: Date,
  updateDatetime: Date,
};
