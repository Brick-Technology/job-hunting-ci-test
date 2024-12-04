import { TaskApi } from "@/common/api";
import { TASK_CHART_DEFAULT_RANGE_DAY } from "@/common/config";
import { useInterval } from 'ahooks';
import { Button, Card, Col, DatePicker, Flex, Form, Row, theme } from "antd";
import dayjs from "dayjs";
import { StackBarData } from "../../data/chart/StackBarData";
import { useDataSharePlan } from "../../hooks/dataSharePlan";
import styles from "./StatisticView.module.css";
import TaskDataCountChart from "./TaskDataCountChart";
const { RangePicker } = DatePicker;

import { CHARTS_LOOP_DELAY } from "@/common/config";

const now = dayjs().startOf('day');

const StatisticView: React.FC = () => {

    const [startDate, setStartDate] = useState<Date>(dayjs(now.subtract(TASK_CHART_DEFAULT_RANGE_DAY, "day")).toDate());
    const [endDate, setEndDate] = useState<Date>(dayjs(now).toDate());
    const [chartTaskStatus, setChartTaskStatus] = useState<StackBarData>();
    const [chartUploadData, setChartUploadData] = useState<StackBarData>();
    const [chartDownloadData, setChartDownloadData] = useState<StackBarData>();
    const [chartMergeData, setChartMergeData] = useState<StackBarData>();
    const { convertToChartData, convertStatusName, convertUploadName,
        STATUS_NAME_OBJECT, STATUS_COLOR_OBJECT, UPLOAD_NAME_OBJECT
    } = useDataSharePlan();
    const [form] = Form.useForm();
    const { token } = theme.useToken();
    const [refresh, setRefresh] = useState(false);

    const setDefaultDatetime = () => {
        const now = dayjs().startOf('day');
        setStartDate(dayjs(now.subtract(TASK_CHART_DEFAULT_RANGE_DAY, "day")).toDate());
        setEndDate(dayjs(now).toDate());
    }

    useEffect(() => {
        setDefaultDatetime();
    }, [])

    useEffect(() => {
        const search = async () => {
            if (startDate && endDate) {
                setChartTaskStatus(convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticStatus({ startDate, endDate }), convertNameFunction: convertStatusName, defaultNameArray: Object.keys(STATUS_NAME_OBJECT), defaultColorObject: STATUS_COLOR_OBJECT }));
                setChartUploadData(convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticUpload({ startDate, endDate }), convertNameFunction: convertUploadName, defaultNameArray: Object.keys(UPLOAD_NAME_OBJECT) }));
                setChartDownloadData(convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticDownload({ startDate, endDate }), convertNameFunction: null }));
                setChartMergeData(convertToChartData({ startDate, endDate, queryResult: await TaskApi.taskStatisticMerge({ startDate, endDate }), convertNameFunction: null }));
            }
        }
        search();
    }, [startDate, endDate, refresh])

    const onFinish = (values: any) => {
        if (values.datetime && values.datetime.length > 0) {
            setStartDate(values.datetime[0].toDate());
            setEndDate(values.datetime[1].toDate());
        } else {
            setDefaultDatetime();
        }
        setRefresh(!refresh);
    };

    useInterval(() => {
        setRefresh(!refresh);
    }, CHARTS_LOOP_DELAY);

    return <>
        <Form form={form} name="advanced_search" style={{
            maxWidth: 'none',
            background: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
            padding: 10,
        }} onFinish={onFinish}>
            <Flex gap={10}>
                <Flex key="">
                    <Form.Item
                        style={{ margin: 0 }}
                        name={`datetime`}
                        label={``}
                    >
                        <RangePicker defaultValue={[dayjs(startDate), dayjs(endDate)]} />
                    </Form.Item>
                </Flex>
                <Flex>
                    <Button type="primary" htmlType="submit">
                        查询
                    </Button>
                </Flex>
            </Flex>
        </Form>
        <Row>
            <Col key="chartMergeData" xs={{ flex: '100%' }}
                sm={{ flex: '50%' }}
                md={{ flex: '50%' }}
                lg={{ flex: '50%' }}
                xl={{ flex: '33%' }}
                xxl={{ flex: '24%' }}>
                {chartTaskStatus ? <Card className={styles.chart} title="任务执行" size="small" bordered={true} ><TaskDataCountChart data={chartTaskStatus} /></Card> : null}
            </Col>
            <Col key="chartMergeData" xs={{ flex: '100%' }}
                sm={{ flex: '50%' }}
                md={{ flex: '50%' }}
                lg={{ flex: '50%' }}
                xl={{ flex: '33%' }}
                xxl={{ flex: '24%' }}>
                {chartUploadData ? <Card className={styles.chart} title="数据上传" size="small" bordered={true} ><TaskDataCountChart data={chartUploadData} /></Card> : null}
            </Col>
            <Col key="chartMergeData" xs={{ flex: '100%' }}
                sm={{ flex: '50%' }}
                md={{ flex: '50%' }}
                lg={{ flex: '50%' }}
                xl={{ flex: '33%' }}
                xxl={{ flex: '24%' }}>
                {chartDownloadData ? <Card className={styles.chart} title="文件下载" size="small" bordered={true} ><TaskDataCountChart data={chartDownloadData} /></Card> : null}
            </Col>
            <Col key="chartMergeData" xs={{ flex: '100%' }}
                sm={{ flex: '50%' }}
                md={{ flex: '50%' }}
                lg={{ flex: '50%' }}
                xl={{ flex: '33%' }}
                xxl={{ flex: '24%' }}>
                {chartMergeData ? <Card className={styles.chart} title="数据合并" size="small" bordered={true} ><TaskDataCountChart data={chartMergeData} /></Card> : null}
            </Col>
        </Row>

    </>
}

export default StatisticView;