import dayjs from "dayjs";
import { Message } from "../../../common/api/message";
import { SearchFileBO } from "../../../common/data/bo/searchFileBO";
import { File } from "../../../common/data/domain/file";
import { FileDTO } from "../../../common/data/dto/fileDTO";
import { SearchFileDTO } from "../../../common/data/dto/searchFileDTO";
import { getAll } from "../database";
import { postErrorMessage, postSuccessMessage } from "../util";
import { BaseService } from "./baseService";

const SERVICE_INSTANCE = new BaseService("file", "id",
    () => {
        return new File();
    },
    () => {
        return new SearchFileDTO();
    },
    (param) => {
        let whereCondition = "";
        if (param.id) {
            whereCondition += ` AND id LIKE '%${param.id}%'`;
        }
        if (param.name) {
            whereCondition += ` AND name LIKE '%${param.name}%'`;
        }
        if (param.isDelete != null) {
            whereCondition += ` AND is_delete = ${param.isDelete}`;
        }
        if (param.startDatetimeForCreate) {
            whereCondition +=
                " AND create_datetime >= '" +
                dayjs(param.startDatetimeForCreate).format("YYYY-MM-DD HH:mm:ss") +
                "'";
        }
        if (param.endDatetimeForCreate) {
            whereCondition +=
                " AND create_datetime < '" +
                dayjs(param.endDatetimeForCreate).format("YYYY-MM-DD HH:mm:ss") +
                "'";
        }
        if (param.startDatetimeForUpdate) {
            whereCondition +=
                " AND update_datetime >= '" +
                dayjs(param.startDatetimeForUpdate).format("YYYY-MM-DD HH:mm:ss") +
                "'";
        }
        if (param.endDatetimeForUpdate) {
            whereCondition +=
                " AND update_datetime < '" +
                dayjs(param.endDatetimeForUpdate).format("YYYY-MM-DD HH:mm:ss") +
                "'";
        }
        return whereCondition;
    }
);

export const FileService = {
    /**
     * 
     * @param {Message} message 
     * @param {SearchFileBO} param 
     * 
     * @returns SearchFileDTO
     */
    searchFile: async function (message, param) {
        SERVICE_INSTANCE.search(message, param);
    },
    /**
     *
     * @param {Message} message
     * @param {string} param id
     */
    fileGetById: async function (message, param) {
        SERVICE_INSTANCE.getById(message, param);
    },
    /**
     *
     * @param {Message} message
     * @param {File} param
     */
    fileAddOrUpdate: async function (message, param) {
        SERVICE_INSTANCE.addOrUpdate(message, param);
    },
    /**
     *
     * @param {Message} message
     * @param {string} param id
     */
    fileDeleteById: async function (message, param) {
        SERVICE_INSTANCE.deleteById(message, param);
    },
    /**
     *
     * @param {Message} message
     * @param {string[]} param ids
     */
    fileDeleteByIds: async function (message, param) {
        SERVICE_INSTANCE.deleteByIds(message, param);
    },
    /**
     *
     * @param {Message} message
     * @param {string[]} param ids
     */
    fileLogicDeleteByIds: async function (message, param) {
        SERVICE_INSTANCE.batchUpdate(message, {
            id: param,
            content: "",
            isDelete: 1,
        });
    },
    fileGetAllMergedNotDeleteFile: async function (message, param) {
        try {
            let sql = `SELECT t1.id AS id,t1.size AS size,t3.update_datetime AS updateDatetime from file t1 LEFT JOIN task_data_merge t2 ON t1.id = t2.data_id LEFT JOIN task t3 ON t2.id = t3.data_id WHERE t1.is_delete = 0 AND t3.status = 'FINISHED' ORDER BY t3.update_datetime DESC`
            const result = await getAll(sql, {}, new FileDTO());
            postSuccessMessage(message, result);
        } catch (e) {
            postErrorMessage(
                message,
                "[worker] fileGetAllMergedNotDeleteFile error : " + e.message
            );
        }
    }

};
