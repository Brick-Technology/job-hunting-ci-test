import { Button, Card, Divider, Flex, Typography } from "antd"
import { TaskData } from "../../data/TaskData"
const { Text } = Typography;

import { useTask } from "../../hooks/task";
import { Icon } from "@iconify/react";
import styles from "./TaskItemCard.module.css";

const { missionPlatformFormat, missionTypeFormat } = useTask();

export type TaskItemCardProps = {
    data: TaskData,
    onEdit: (data: TaskData) => void;
}

const TaskItemCard: React.FC<TaskItemCardProps> = ({ data, onEdit }) => {

    return (
        <>

            <Card title={data.name ? data.name : ' '} extra={<><Flex align="center"><Button shape="circle" icon={<Icon className={styles.menuButton} icon="material-symbols:history" />}>
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
                        <Button onClick={() => {
                            onEdit(data);
                        }} type="primary" shape="circle" icon={<Icon className={styles.menuButton} icon="mdi:edit" />}>
                        </Button>
                        <Button type="primary" shape="circle" icon={<Icon className={styles.menuButton} icon="mdi:delete" />}>
                        </Button>
                        <Button type="primary" shape="circle" icon={<Icon className={styles.menuButton} icon="ion:open-outline" />}>
                        </Button>
                    </Flex>
                    <Flex gap="small">
                        <Button type="primary" shape="circle" icon={<Icon className={styles.menuButton} icon="pajamas:log" />}>
                        </Button>
                        <Button type="primary" shape="circle" icon={<Icon className={styles.menuButton} icon="material-symbols:play-arrow" />}>
                        </Button>
                    </Flex>
                </Flex>
            </Card>
        </>
    )
}

export default TaskItemCard;