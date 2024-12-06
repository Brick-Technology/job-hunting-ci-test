export type MissionLogData = {
    missionId: string;
    detail: MissionLogDetailData;
    id: string;
    status: string;
    reason?: string;
    createDatetime: Date;
    updateDatetime: Date;
};


export type MissionLogDetailData = {
    logList: Array<string>;
    count: number;
    startDatetime: Date;
    endDatetime: Date;
}