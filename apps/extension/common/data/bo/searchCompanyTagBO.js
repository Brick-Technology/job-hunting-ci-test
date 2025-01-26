import { PageBO } from "./pageBO";

export class SearchCompanyTagBO extends PageBO {
  companyName;
  tagNames;
  tagIds;
  startDatetimeForUpdate;
  endDatetimeForUpdate;
  orderByColumn;
  /**
   * ASC,DESC
   */
  orderBy;
}
