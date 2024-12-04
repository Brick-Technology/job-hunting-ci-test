import { ConfigApi } from "@/common/api";
import { CONFIG_KEY_DATA_SHARE_PLAN } from "@/common/config";
import { Config } from "@/common/data/domain/config";
import { DataSharePlanConfigDTO } from "@/common/data/dto/dataSharePlanConfigDTO";
import { create } from 'zustand';

interface DataSharePlanState {
    enable: boolean,
    init: () => Promise<void>,
    change: (enable: boolean) => Promise<void>,
}

const useDataSharePlanStore = create<DataSharePlanState>()((set) => {
    const _init = async () => {
        const configValue = await ConfigApi.getConfigByKey(CONFIG_KEY_DATA_SHARE_PLAN);
        if (configValue && configValue.value) {
            const config = JSON.parse(configValue.value);
            set(() => ({ enable: config.enable }));
        } else {
            set(() => ({ enable: false }));
        }
    }

    const _update = async (target: DataSharePlanConfigDTO) => {
        let config = await ConfigApi.getConfigByKey(CONFIG_KEY_DATA_SHARE_PLAN);
        if (!config) {
            config = new Config();
            config.key = CONFIG_KEY_DATA_SHARE_PLAN;
            config.value = JSON.stringify(target)
        } else {
            config.value = JSON.stringify(Object.assign(target, JSON.parse(config.value)));
        }
        await ConfigApi.addOrUpdateConfig(config);
    }

    return {
        enable: false,
        init: async () => {
            await _init();
        },
        change: async (enable: boolean) => {
            const target = new DataSharePlanConfigDTO();
            target.enable = enable;
            await _update(target);
            set(() => ({ enable }));
        },
    }
})

export default useDataSharePlanStore;