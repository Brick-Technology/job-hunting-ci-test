import { ChangeLog } from "./changelog";

const SQL_ALTER_TABLE_FILE_ADD_COLUMN_IS_DELETE = `
  ALTER TABLE file ADD COLUMN is_delete INTEGER DEFAULT 0
`;

export class ChangeLogV10 extends ChangeLog {
    getSqlList() {
        let sqlList = [
            SQL_ALTER_TABLE_FILE_ADD_COLUMN_IS_DELETE,
        ];
        return sqlList;
    }
}
