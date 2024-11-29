import { Button, Card, Divider, Flex, Popconfirm, PopconfirmProps, Typography } from "antd";
import { TaskData } from "../../data/TaskData";
const { Text } = Typography;
import { Icon } from "@iconify/react";
import { useTask } from "../../hooks/task";
import styles from "./TaskItemCard.module.css";
const { missionPlatformFormat, missionTypeFormat } = useTask();

export type TaskItemCardProps = {
    data: TaskData,
    onEdit: (data: TaskData) => void;
    onDelete: (data: TaskData) => void;
    onAccessUrl: (data: TaskData) => void;
    onPlay: (data: TaskData) => void;
    onShowDetailLogDetail: (data: TaskData) => void;
}

const TaskItemCard: React.FC<TaskItemCardProps> = ({ data, onEdit, onDelete, onAccessUrl, onPlay, onShowDetailLogDetail }) => {

    const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);

    const deleteConfirm: PopconfirmProps['onConfirm'] = async (e) => {
        try {
            setDeleteConfirmLoading(true);
            await onDelete(data);
        } finally {
            setDeleteConfirmLoading(false);
        }
    };

    const getStatusIcon = () => {
        if (data.taskRunData.status == "ready" || data.taskRunData.status == "playing") {
            return "material-symbols:play-arrow";
        } else if (data.taskRunData.status == "finished") {
            return "mdi:success-circle"
        } else {
            return "material-symbols:error";
        }
    }

    const getStatusLoading = () => {
        if (data.taskRunData.status == "playing") {
            return true;
        } else {
            return false;
        }
    }

    const getBackgroundColorByStatus = () => {
        if (data.taskRunData.status == "finished") {
            return "green";
        } else if (data.taskRunData.status == "error") {
            return "#ff4d4f";
        } else {
            return "none"
        }
    }
    return (
        <>
            <Card title={data.name ? data.name : ' '} extra={<><Flex align="center"><Button title="查看执行历史" shape="circle" icon={<Icon className={styles.menuButton} icon="material-symbols:history" />}>
            </Button></Flex></>}>
                <Flex vertical>
                    <Flex>
                        <Text>任务类型:</Text>
                        <Text>{missionTypeFormat(data.type)}</Text>
                    </Flex>
                    <Flex>
                        <Text>运行平台:</Text>
                        <Text>{missionPlatformFormat(data.platform)}</Text>
                    </Flex>
                </Flex>
                <Divider style={{ marginTop: "10px", marginBottom: "10px" }}></Divider>
                <Flex gap="middle" justify="space-between">
                    <Flex gap="small">
                        <Button title="编辑" onClick={() => {
                            onEdit(data);
                        }} shape="circle" icon={<Icon className={styles.menuButton} icon="mdi:edit" />}>
                        </Button>
                        <Popconfirm
                            title="删除任务"
                            description="确定删除该任务？"
                            onConfirm={deleteConfirm}
                            okText="是"
                            cancelText="否"
                            okButtonProps={{ loading: deleteConfirmLoading }}
                        >
                            <Button title="删除任务" danger shape="circle" icon={<Icon className={styles.menuButton} icon="mdi:delete" />}>
                            </Button>
                        </Popconfirm>
                        <Button title={`访问目标地址：${data.url}`} onClick={() => {
                            onAccessUrl(data);
                        }} type="primary" shape="circle" icon={<Icon className={styles.menuButton} icon="ion:open-outline" />}>
                        </Button>
                    </Flex>
                    <Flex gap="small">
                        {data.taskRunData.logDetail ?
                            <Button onClick={() => {
                                onShowDetailLogDetail(data);
                            }} title="显示日志" type="primary" shape="circle" icon={<Icon className={styles.menuButton} icon="pajamas:log" />}>
                            </Button>
                            : null}
                        <Button title="执行任务" loading={getStatusLoading()} onClick={() => {
                            onPlay(data);
                        }} style={{ backgroundColor: getBackgroundColorByStatus() }} type="primary" shape="circle" icon={<Icon className={styles.menuButton} icon={getStatusIcon()} />}>
                        </Button>
                    </Flex>
                </Flex>
            </Card>
        </>
    )
}

export default TaskItemCard;