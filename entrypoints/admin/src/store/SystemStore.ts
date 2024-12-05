import { GithubApi } from "@/common/api/github";
import { dateToStr } from "@/common/utils";
import semver from "semver";
import { create } from 'zustand';
const version = __APP_VERSION__;

interface SystemState {
    versionObject: any,
    newVersion: boolean,
    latestVersion: string,
    latestVersionCreatedAt: string,
    latestChangelogContent: string,
    query: () => Promise<void>,
    downloadLatest: (value: any) => Promise<void>,
}

const useSystemStore = create<SystemState>()((set) => {

    const queryVersion = async () => {
        return await GithubApi.queryVersion();
    }

    const checkNewVersion = (versionObject) => {
        const latestVersion = versionObject.tag_name;
        return semver.gt(latestVersion, version);
    }

    const getLatestAssets = (versionObject) => {
        let assets = versionObject.assets;
        let chromeZipAssets = assets.filter(item => { return item.name.includes("chrome") && item.name.endsWith(".zip") });
        if (chromeZipAssets && chromeZipAssets.length > 0) {
            return chromeZipAssets[0];
        } else {
            return null;
        }
    }

    const downloadLatest = (versionObject) => {
        let assets = getLatestAssets(versionObject);
        let url = assets?.browser_download_url;
        if (url) {
            window.open(url);
        } else {
            throw "未找到安装文件";
        }
    }

    return {
        query: async () => {
            const versionObject = await queryVersion();
            set(() => ({
                versionObject,
                newVersion: checkNewVersion(versionObject),
                latestVersion: versionObject.tag_name,
                latestVersionCreatedAt: dateToStr(versionObject.created_at, "YYYY-MM-DD"),
                latestChangelogContent: versionObject.body,
            }));
        },
        downloadLatest,
    }
})

export default useSystemStore;