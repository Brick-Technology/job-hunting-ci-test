import { CompanyData } from "./CompanyData";

export type JobData = {
  id: string;
  name: string;
  url: string;
  salaryMin: number;
  salaryMax: number;
  company: CompanyData;
  jobTagList: { tagName: string }[];
  address: string[];
  publishDatetime: Date;
  bossName: string;
  bossPosition: string;
  platform: string;
  desc: string;
  degree: string;
  longitude: number;
  latitude: number;
  browseTime?: Date;
  createDatetime?:Date;
};
