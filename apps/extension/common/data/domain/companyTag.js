export class CompanyTag {
  /**
   * 编号
   */
  companyTagId;
  /**
   * 公司编号
   */
  companyId;
  /**
   * 公司名
   */
  companyName;
  /**
   * 标签编号
   */
  tagId;
  /**
   * 排列序号
   */
  seq;
  createDatetime;
  updateDatetime;
  /**
   * 来源类型,0:CUSTOM;1:PLATFORM
   */
  sourceType;
  /**
   * CUSTOM:null代表本地应用程序,【其他值】代表其他用户;PLATFORM:代表第三方平台;
   */
  source;
}