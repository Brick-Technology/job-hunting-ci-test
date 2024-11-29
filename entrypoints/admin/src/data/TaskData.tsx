import { TaskRunData } from "./TaskRunData";

export type TaskData = {
    id?: string,
    name: string,
    type: string,
    platform: string,
    url: string,
    delay?: number,
    delayRange?: number,
    maxPage?: number,
    taskRunData:TaskRunData,
};
