import { Icon } from "@iconify/react";
import { Button, Flex, Modal, Space, Switch, Tooltip, message } from "antd";

import { TaskData } from "../../data/TaskData";
import styles from "./AutomateView.module.css";
import TaskEditView from "./automate/TaskEdit";

import { AutomateApi, MissionApi, MissionLogApi, SystemApi } from "@/common/api";
import { Mission } from "@/common/data/domain/mission";
import { MissionConfigJobPageDTO } from "@/common/data/dto/missionConfigJobPageDTO";
import { errorLog } from "@/common/log";

import { MISSION_STATUS_FAILURE, MISSION_STATUS_SUCCESS } from "@/common";
import { MissionLog } from "@/common/data/domain/missionLog";
import { MissionLogJobPageDetailDTO } from "@/common/data/dto/missionLogJobPageDetailDTO";
import MissionLogDetail from "../../components/task/MissionLogDetail";
import TaskItemCard from "../../components/task/TaskItemCard";
import { useTask } from "../../hooks/task";

const { convertTaskList } = useTask();

const automateFetchJobItemData = async (item: TaskData) => {
    try {
        let result = await AutomateApi.automateFetchJobItemData({
            url: item.url,
            platform: item.platform,
            delay: (item.delay ?? 0) * 1000,
            delayRandomRange: (item.delayRange ?? 0) * 1000,
            maxPage: item.maxPage ?? null,
        });
        let missionLog = new MissionLog();
        missionLog.missionId = item.id;
        if (result.error) {
            missionLog.missionStatus = MISSION_STATUS_FAILURE;
            missionLog.missionStatusReason = result.error;
        } else {
            missionLog.missionStatus = MISSION_STATUS_SUCCESS;
        }
        let missionLogJobPageDetailDTO = new MissionLogJobPageDetailDTO();
        missionLogJobPageDetailDTO.logList = result.logList;
        missionLogJobPageDetailDTO.count = result.count;
        missionLogJobPageDetailDTO.startDatetime = result.startDatetime;
        missionLogJobPageDetailDTO.endDatetime = result.endDatetime;
        //TODO需要处理拼写错误的问题Detial -> Detail，包括数据库schema
        missionLog.missionLogDetial = JSON.stringify(missionLogJobPageDetailDTO);
        await MissionLogApi.missionLogAddOrUpdate(missionLog);
        result.screenshotList.forEach(element => {
            item.taskRunData.screenshotList = [];
            item.taskRunData.screenshotList.push(`data:image/jpeg;base64,${element}`)
        });
        item.taskRunData.logDetail = missionLogJobPageDetailDTO;
        item.taskRunData.reason = missionLog.missionStatusReason;
        if (result.error) {
            item.taskRunData.status = "error";
        } else {
            item.taskRunData.status = "finished";
        }
    } catch (e) {
        errorLog(e);
        item.taskRunData.status = "error";
    }
    return item;
}

interface AutomateProps {

}

const AutomateView: React.FC<AutomateProps> = (props) => {

    const [refresh, setRefresh] = useState(false);
    const [data, setData] = useState(Array<TaskData>);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<TaskData>();
    const [isMissionLogDetailModalOpen, setIsMissionLogDetailModalOpen] = useState(false);
    const [missionLogDetail, setMissionLogDetail] = useState<TaskData>();
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const search = async () => {
            let result = [];
            let query = await MissionApi.missionGetAll();
            query.forEach(item => {
                let targetItem = Object.assign({}, item);
                targetItem.missionConfig = JSON.parse(targetItem.missionConfig);
                result.push(targetItem);
            });
            result = convertTaskList(result);
            result.forEach(item => {
                item.taskRunData = {};
                item.taskRunData.status = "ready";
            });
            setData(result);
        }
        search();
    }, [refresh]);

    const onTaskModalOpen = () => {
        setIsTaskModalOpen(true);
    }

    const handleTaskModalCancel = () => {
        setIsTaskModalOpen(false);
    }

    const onAddTask = () => {
        setEditItem(null);
        setIsTaskModalOpen(true);
    }

    const onTaskSave = async (data: TaskData) => {
        try {
            let mission = new Mission();
            mission.missionId = data.id;
            mission.missionName = data.name;
            mission.missionType = data.type;
            mission.missionPlatform = data.platform;
            let missionConfig = new MissionConfigJobPageDTO()
            missionConfig.url = data.url;
            missionConfig.delay = data.delay;
            missionConfig.delayRange = data.delayRange;
            missionConfig.maxPage = data.maxPage;
            mission.missionConfig = JSON.stringify(missionConfig);
            mission.seq = 0;
            await MissionApi.missionAddOrUpdate(mission)
            setIsTaskModalOpen(false);
            setRefresh(!refresh);
        } catch (e) {
            errorLog(e)
            messageApi.open({
                type: 'error',
                content: `${editItem ? "修改任务" : "新增任务"}失败`,
            });
        }
    }

    const onDeleteTask = async (data: TaskData) => {
        await MissionApi.missionDeleteById([data.id]);
        setRefresh(!refresh);
    }

    const onAccessUrl = (data: TaskData) => {
        SystemApi.systemTabCreate({ url: data.url, active: true })
    }

    const handleMissionLogDetailModalCancel = () => {
        setIsMissionLogDetailModalOpen(false);
    }

    return (
        <>
            {contextHolder}
            <Space direction="vertical">
                <Flex gap="small" align="center">
                    <Tooltip title="并发执行">
                        <Button type="primary" shape="circle" icon={<Icon className={styles.menuButton} icon="material-symbols:double-arrow" />}>
                        </Button>
                    </Tooltip>
                    <Tooltip title="顺序执行">
                        <Button type="primary" shape="circle" icon={<Icon className={styles.menuButton} icon="material-symbols:play-arrow" />}>
                        </Button>
                    </Tooltip>
                    <Tooltip title="新增任务">
                        <Button type="primary" onClick={onAddTask}>
                            新增任务
                        </Button>
                    </Tooltip>
                    <Switch checkedChildren="开启排序" unCheckedChildren="关闭排序" defaultChecked={false} />
                </Flex>
                <Flex gap="small" wrap>
                    {data.map((item, index) => (
                        <TaskItemCard
                            key={`task_${index}`} data={item}
                            onAccessUrl={onAccessUrl}
                            onEdit={(data) => {
                                setIsTaskModalOpen(true);
                                setEditItem(data);
                            }}
                            onDelete={onDeleteTask}
                            onPlay={async (item: TaskData) => {
                                let target = data.find((value) => value.id == item.id);
                                target.taskRunData.status = "playing";
                                setData(Object.assign([], data));
                                let newItem = await automateFetchJobItemData(item);
                                let index = data.findIndex((value) => value.id == newItem.id);
                                data[index] = newItem;
                                setData(Object.assign([], data));
                            }}
                            onShowDetailLogDetail={((item: TaskData) => {
                                setMissionLogDetail(item);
                                setIsMissionLogDetailModalOpen(true);
                            })}
                        ></TaskItemCard>
                    ))}
                </Flex>
            </Space>
            <Modal
                title={editItem ? "修改任务" : "新增任务"}
                open={isTaskModalOpen}
                onCancel={handleTaskModalCancel}
                footer={null}
                style={{ maxWidth: "800px" }}
                width="80%"
                destroyOnClose
            >
                <TaskEditView data={editItem} onSave={onTaskSave}></TaskEditView>
            </Modal>
            <Modal
                title="任务日志"
                open={isMissionLogDetailModalOpen}
                onCancel={handleMissionLogDetailModalCancel}
                footer={null}
                style={{ maxWidth: "800px" }}
                width="80%"
                destroyOnClose
            >
                <MissionLogDetail data={missionLogDetail}></MissionLogDetail>
            </Modal>
        </>
    )
}

export default AutomateView;