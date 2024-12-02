import { CompanyData } from "./CompanyData";

export type JobData = {
  id: string;
  name: string;
  url: string;
  salaryMin: number;
  salaryMax: number;
  salaryTotalMonth: number;
  company: CompanyData;
  jobTagList: { tagName: string }[];
  location: string,
  address: string;
  publishDatetime: Date;
  bossName: string;
  bossPosition: string;
  platform: string;
  desc: string;
  degree: string;
  demandYear: number,
  longitude: number;
  latitude: number;
  browseTime?: Date;
  createDatetime?: Date;
  browseCount:number;
  browseDetailCount:number;
};
