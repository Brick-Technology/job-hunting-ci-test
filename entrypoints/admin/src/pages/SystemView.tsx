import { FileApi } from "@/common/api";
import { dbSchemaVersion, dbSize } from "@/common/api/common";
import { FileStatisticDTO } from "@/common/data/dto/fileStatisticDTO";
import { convertToAbbreviation } from "@/common/utils";
import { Icon } from "@iconify/react";
import {
    Card,
    Flex,
    Row,
    Typography, message
} from "antd";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import StatisticCard from "../components/StatisticCard";
import styles from "./SystemView.module.css";
const { Text } = Typography;
dayjs.extend(duration)


const SystemView: React.FC = () => {

    const [messageApi, contextHolder] = message.useMessage();
    const [databaseSize, setDatabaseSize] = useState();
    const [schemaVersion, setSchemaVersion] = useState();
    const [fileStatistic, setFileStatistic] = useState<FileStatisticDTO>({});


    useEffect(
        () => {
            const query = async () => {
                const databaseSize = (await dbSize()).total;
                setDatabaseSize(databaseSize);
                const schemaVersion = (await dbSchemaVersion()).version;
                setSchemaVersion(schemaVersion);
                let fileStatistic = await FileApi.fileStatistic();
                setFileStatistic(fileStatistic);
            }

            query();
        }, [

    ])

    const getUnit = (num) => {
        let unit = "";
        if (num < 1024) {
            unit = "";
        } else if (num < 1024 * 1024) {
            unit = "K";
        } else if (num < 1024 * 1024 * 1024) {
            unit = "M";
        } else if (num < 1024 * 1024 * 1024 * 1024) {
            unit = "G";
        } else {
            unit = "T";
        }
        return `${unit}B`;
    }

    const getNum = (num) => {
        if (num < 1024) {
            return num;
        } else if (num < 1024 * 1024) {
            return num / 1024;
        } else if (num < 1024 * 1024 * 1024) {
            return num / (1024 * 1024);
        } else if (num < 1024 * 1024 * 1024 * 1024) {
            return num / (1024 * 1024 * 1024);
        } else {
            return num / (1024 * 1024 * 1024 * 1024);
        }
    }

    return <>
        {contextHolder}
        <Flex vertical gap={5}>
            <Card title="数据库信息" bordered={false} size="small">
                <Row gutter={2}>
                    <StatisticCard
                        name={<Flex className={styles.title}><Icon icon="material-symbols:database" /><Text>数据库大小</Text></Flex>}
                        count={databaseSize != null ? getNum(databaseSize).toFixed(2) : "N/A"}
                        unit={databaseSize != null ? getUnit(databaseSize) : ""}
                    ></StatisticCard>
                    <StatisticCard
                        name={<Flex className={styles.title}><Icon icon="material-symbols:database" /><Text>数据库版本</Text></Flex>}
                        count={schemaVersion != null ? `V${schemaVersion}` : "N/A"}
                        unit={""}
                    ></StatisticCard>
                </Row>
            </Card>
            <Card title="历史文件信息" bordered={false} size="small">
                <Row gutter={2}>
                    <StatisticCard
                        name={<Flex className={styles.title}><Icon icon="mdi:file" /><Text>历史文件大小</Text></Flex>}
                        count={fileStatistic.mergeNotDeleteFileSizeTotal != null ? getNum(fileStatistic.mergeNotDeleteFileSizeTotal).toFixed(2) : "N/A"}
                        unit={fileStatistic.mergeNotDeleteFileSizeTotal != null ? getUnit(fileStatistic.mergeNotDeleteFileSizeTotal) : ""}
                        totalCount={fileStatistic.mergeFileSizeTotal != null ? getNum(fileStatistic.mergeFileSizeTotal).toFixed(2) : "N/A"}
                        totalCountUnit={fileStatistic.mergeFileSizeTotal != null ? getUnit(fileStatistic.mergeFileSizeTotal) : ""}
                    ></StatisticCard>
                    <StatisticCard
                        name={<Flex className={styles.title}><Icon icon="mdi:file" /><Text>历史文件个数</Text></Flex>}
                        count={fileStatistic.mergeNotDeleteFileCount != null ? convertToAbbreviation(fileStatistic.mergeNotDeleteFileCount) : "N/A"}
                        unit={`个`}
                        totalCount={fileStatistic.mergeFileCount != null ? convertToAbbreviation(fileStatistic.mergeFileCount) : "N/A"}
                        totalCountUnit={`个`}
                    ></StatisticCard>
                </Row>
            </Card>
        </Flex>
    </>
}

export default SystemView;