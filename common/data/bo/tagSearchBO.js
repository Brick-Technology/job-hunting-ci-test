import { PageBO } from "./pageBO";

export class TagSearchBO extends PageBO {
    tagName;
    isPublic;
    orderByColumn;
    /**
     * ASC,DESC
     */
    orderBy;
}
