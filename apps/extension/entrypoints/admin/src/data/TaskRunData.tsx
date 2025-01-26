export type TaskRunData = {
    status: "ready" | "playing" | "finished" | "error",
    screenshotList: Array<string>,
    logDetail: { logList: Array<string>, count: number, startDatetime: Date, endDatetime: Date },
    reason:string,
};
