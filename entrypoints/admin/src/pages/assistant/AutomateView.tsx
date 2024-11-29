import { Icon } from "@iconify/react";
import { Button, Flex, Modal, Space, Switch, Tooltip } from "antd";

import styles from "./AutomateView.module.css";
import TaskEditView from "./automate/TaskEdit";
import { TaskData } from "../../data/TaskData";

import { errorLog } from "@/common/log";
import { MissionApi } from "@/common/api";
import { Mission } from "@/common/data/domain/mission";
import { MissionConfigJobPageDTO } from "@/common/data/dto/missionConfigJobPageDTO";

import { useTask } from "../../hooks/task";
import TaskItemCard from "../../components/task/TaskItemCard";

const { convertTaskList } = useTask();

interface AutomateProps {

}

const AutomateView: React.FC<AutomateProps> = (props) => {

    const [data, setData] = useState(Array<TaskData>);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<TaskData>();

    useEffect(() => {
        const search = async () => {
            let result = [];
            let query = await MissionApi.missionGetAll();
            query.forEach(item => {
                let targetItem = Object.assign({}, item);
                targetItem.missionConfig = JSON.parse(targetItem.missionConfig);
                result.push(targetItem);
            });
            setData(convertTaskList(result));
        }
        search();
    }, []);

    const onTaskModalOpen = () => {
        setIsTaskModalOpen(true);
    }

    const handleTaskModalCancel = () => {
        setIsTaskModalOpen(false);
    }

    const onTaskSave = async (data: TaskData) => {
        console.log(data)
        // confirmLoading.value = true;
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
            // dialogFormVisible.value = false;
            // reset();
            // search();
        } catch (e) {
            errorLog(e)
            // ElMessage({
            //     message: formAddMode.value ? '新增任务失败' : "编辑任务失败",
            //     type: 'error',
            // });
        }
        setIsTaskModalOpen(false);
    }

    return (
        <>
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
                        <Button type="primary" onClick={onTaskModalOpen}>
                            新增任务
                        </Button>
                    </Tooltip>
                    <Switch checkedChildren="开启排序" unCheckedChildren="关闭排序" defaultChecked={false} />
                </Flex>
                <Flex gap="small" wrap>
                    {data.map((item, index) => (
                        <TaskItemCard onEdit={(data) => {
                            setIsTaskModalOpen(true);
                            setEditItem(data);
                        }} key={`task_${index}`} data={item}></TaskItemCard>
                    ))}
                </Flex>
            </Space>
            <Modal
                title="新增任务"
                open={isTaskModalOpen}
                onCancel={handleTaskModalCancel}
                footer={null}
                style={{ maxWidth: "800px" }}
                width="80%"
            >
                <TaskEditView data={editItem} onSave={onTaskSave}></TaskEditView>
            </Modal>
        </>
    )
}

export default AutomateView;