import { Message } from "../../../common/api/message";
import { genUniqueId, toHump } from "../../../common/utils";
import { batchDel, batchGet, batchUpdate, del, insert, one, search, searchCount, update, batchInsertOrReplace } from "../database";
import { postErrorMessage, postSuccessMessage } from "../util";

export class BaseService {
    constructor(tableName, tableIdColumn, entityClassCreateFunction, searchDTOCreateFunction, whereConditionFunction) {
        this.tableName = tableName;
        this.tableIdColumn = tableIdColumn;
        this.entityClassCreateFunction = entityClassCreateFunction;
        this.searchDTOCreateFunction = searchDTOCreateFunction;
        this.whereConditionFunction = whereConditionFunction;
    }

    async search(message, param, { detailInjectAsyncCallback } = { detailInjectAsyncCallback: null }) {
        try {
            let result = this.searchDTOCreateFunction();
            result.items = await search(this.entityClassCreateFunction(), this.tableName, param, this.whereConditionFunction);
            result.total = await searchCount(this.entityClassCreateFunction(), this.tableName, param, this.whereConditionFunction);
            if (detailInjectAsyncCallback) {
                result = await detailInjectAsyncCallback(result);
            }
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(message, `[worker] search error : ` + e.message);
        }
    }

    /**
     * 
     * @param {Message} message 
     * @param {string} param id
     */
    async getById(message, param) {
        try {
            postSuccessMessage(message, (await one(this.entityClassCreateFunction(), this.tableName, this.tableIdColumn, param)));
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] getById error : " + e.message
            );
        }
    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} param ids
     */
    async getByIds(message, param) {
        try {
            postSuccessMessage(message, (await this._getByIds(param)));
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] getByIds error : " + e.message
            );
        }
    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} param ids
     */
    async _getByIds(param) {
        return batchGet(this.entityClassCreateFunction(), this.tableName, this.tableIdColumn, param);
    }

    async addOrUpdate(message, param) {
        try {
            let result = await this._addOrUpdate(param);
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] addOrUpdate error : " + e.message
            );
        }
    }

    /**
     *
     * @param {Message} message
     * @param {string} id
     * @param {string} column 
     */
    async deleteById(message, id, column) {
        try {
            await _deleteById(this.tableName, column, id);
            postSuccessMessage(message, {});
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] deleteById error : " + e.message
            );
        }
    }

    /**
    * @param {string} id
    * @param {string} column 
    */
    async _deleteById(id, column, { otherCondition } = { otherCondition: null }) {
        return del(this.tableName, column ?? this.tableIdColumn, id, { otherCondition });
    }

    /**
     *
     * @param {Message} message
     * @param {string[]} ids
     * @param {string} column 
     */
    async deleteByIds(message, ids, column) {
        try {
            if (ids && ids.length > 0) {
                await this._deleteByIds(ids, column);
                postSuccessMessage(message, {});
            } else {
                postErrorMessage(
                    message,
                    "[worker] deleteByIds error : ids is empty"
                );
            }
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] deleteByIds error : " + e.message
            );
        }
    }

    /**
     * @param {string[]} ids
     * @param {string} column 
     */
    async _deleteByIds(ids, column, { otherCondition } = { otherCondition: null }) {
        return batchDel(this.tableName, column ?? this.tableIdColumn, ids, { otherCondition });
    }

    /**
     * @param {string[]} ids
     * @param {string} column 
     */
    async _updateByIds(ids, column, { otherCondition } = { otherCondition: null }) {
        return batchDel(this.tableName, column ?? this.tableIdColumn, ids, { otherCondition });
    }


    /**
     *
     * @param {Message} message
     * @param {*} param
     */
    async batchUpdate(message, param, column) {
        try {
            if (param.id && param.id.length > 0) {
                await this._batchUpdate(param, column);
                postSuccessMessage(message, {});
            } else {
                postErrorMessage(
                    message,
                    "[worker] batchUpdate error : ids is empty"
                );
            }
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] batchUpdate error : " + e.message
            );
        }
    }

    /**
     * 
     * @param {*} param 
     */
    async _batchUpdate(param, column, { overrideUpdateDatetime = false } = {}) {
        return batchUpdate(this.entityClassCreateFunction(), this.tableName, column ?? this.tableIdColumn, param, { overrideUpdateDatetime });
    }

    /**
     * 
     * @param {*} param 
     */
    async _addOrUpdate(param, { overrideUpdateDatetime = false } = {}) {
        let idKey = toHump(this.tableIdColumn);
        if (param[idKey] == null) {
            param[idKey] = genUniqueId();
        }
        await batchInsertOrReplace(this.entityClassCreateFunction(), this.tableName, [param], { overrideUpdateDatetime });
        return param;
    }

    /**
     * 
     * @param {[]} params
     */
    async _batchAddOrUpdate(params, { overrideUpdateDatetime = false, genIdFunction = null } = {}) {
        for (let i = 0; i < params.length; i++) {
            let item = params[i];
            let idKey = toHump(this.tableIdColumn);
            if (item[idKey] == null) {
                if (genIdFunction) {
                    item[idKey] = genIdFunction(item);
                } else {
                    item[idKey] = genUniqueId();
                }
            }
        }
        await batchInsertOrReplace(this.entityClassCreateFunction(), this.tableName, params, { overrideUpdateDatetime });
        return params;
    }
}

