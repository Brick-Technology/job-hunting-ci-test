import { postErrorMessage, postSuccessMessage } from "@/common/extension/background/util";
import { ConfigApi } from "../../../common/api";
import {
    BACKGROUND,
} from "../../../common/api/bridgeCommon";
import { KEY_GITHUB_USER } from "../../../common/config";
import { Config } from "../../../common/data/domain/config";
import { UserDTO } from "../../../common/data/dto/userDTO";


export const UserService = {
    /**
     * @param {*} message
     * @param {void} param 
     * 
     * @return UserDTO
     */
    userGet: async function (message, param) {
        try {
            postSuccessMessage(message, await getUser());
        } catch (e) {
            postErrorMessage(
                message,
                "[background] userGet error : " + e.message
            );
        }
    },
    /**
     * @param {*} message
     * @param {UserDTO} param userDTO
     */
    userSet: async function (message, param) {
        try {
            await setUser(param);
            postSuccessMessage(message, {});
        } catch (e) {
            postErrorMessage(
                message,
                "[background] userSet error : " + e.message
            );
        }
    },
};

/**
 * 
 * @param {OauthDTO} user 
 */
export async function setUser(user) {
    let config = new Config();
    config.key = KEY_GITHUB_USER;
    config.value = JSON.stringify(user);
    return ConfigApi.addOrUpdateConfig(config);
}

/**
 * 
 * @returns UserDTO
 */
export async function getUser() {
    let userDTO = new UserDTO();
    let config = await ConfigApi.getConfigByKey(KEY_GITHUB_USER);
    if (config) {
        let value = JSON.parse(config.value);
        if (value) {
            Object.assign(userDTO, value);
            return userDTO;
        }
    }
    return null;
}