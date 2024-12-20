import { create } from 'zustand';
interface ApiState {
    core: {
        rateLimitLimit: number;
        rateLimitRemaining: number;
        rateLimitReset: Date;
        rateLimitUsed: number;
    },
    graphql: {
        rateLimitLimit: number;
        rateLimitRemaining: number;
        rateLimitReset: Date;
        rateLimitUsed: number;
    }
    update: (key: string, value: {
        rateLimitLimit: number,
        rateLimitRemaining: number,
        rateLimitReset: Date,
        rateLimitUsed: number
    }) => void;
}

const useApiStore = create<ApiState>()((set) => {
    return {
        core: {},
        graphql: {},
        update: (key: string, value: {
            rateLimitLimit:number,
            rateLimitRemaining:number,
            rateLimitReset:Date,
            rateLimitUsed:number,
        }) => {
            let obj = {};
            obj[key] = value;
            set(() => (obj));
        },
    }
})

export default useApiStore;