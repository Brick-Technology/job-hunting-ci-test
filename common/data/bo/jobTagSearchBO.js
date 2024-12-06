import { PageBO } from "./pageBO";

export class JobTagSearchBO extends PageBO {
  tagIds;
  tagNames;
  startDatetimeForUpdate;
  endDatetimeForUpdate;
  orderByColumn;
  /**
   * ASC,DESC
   */
  orderBy;
}
