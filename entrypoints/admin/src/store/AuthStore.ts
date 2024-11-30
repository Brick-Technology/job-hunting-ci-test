import { create } from 'zustand'
import { AuthApi, UserApi } from "@/common/api";

interface AuthState {
    auth: boolean,
    username: string,
    avatar: string,
    init: () => Promise<void>,
    login: () => Promise<void>,
    logout: () => Promise<void>,
}

const useAuthStore = create<AuthState>()((set) => {
    const _init = async () => {
        let oauthDTO = await AuthApi.authGetToken();
        if (oauthDTO) {
            set(() => ({ auth: true }));
            let userDTO = await UserApi.userGet();
            if (userDTO) {
                set(() => ({ username: userDTO.login, avatar: userDTO.avatarUrl }));
            }
        } else {
            set(() => ({ auth: false, username: null, avatar: null }));
        }
    }
    return {
        auth: false,
        init: async () => {
            await _init();
        },
        login: async () => {
            await AuthApi.authOauth2Login();
            await _init();
        },
        logout: async () => {
            await AuthApi.authSetToken(null);
            await UserApi.userSet(null);
            await _init();
        },
    }
})

export default useAuthStore;