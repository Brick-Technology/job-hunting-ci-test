import { ChangeLog } from "./changelog";

const SQL_ALTER_TABLE_JOB_ADD_COLUMN_SKILL_TAG = `
ALTER TABLE job ADD COLUMN skill_tag TEXT
`;

const SQL_ALTER_TABLE_JOB_ADD_COLUMN_WELFARE_TAG = `
  ALTER TABLE job ADD COLUMN welfare_tag TEXT
`;

export class ChangeLogV8 extends ChangeLog {
    getSqlList() {
        let sqlList = [SQL_ALTER_TABLE_JOB_ADD_COLUMN_SKILL_TAG, SQL_ALTER_TABLE_JOB_ADD_COLUMN_WELFARE_TAG];
        return sqlList;
    }
}
