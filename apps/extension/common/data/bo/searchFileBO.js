import { PageBO } from "./pageBO";

export class SearchFileBO extends PageBO {
    id;
    startDatetimeForCreate;
    endDatetimeForCreate;
    startDatetimeForUpdate;
    endDatetimeForUpdate;
    orderByColumn;
    /**
     * ASC,DESC
     */
    orderBy;
}
