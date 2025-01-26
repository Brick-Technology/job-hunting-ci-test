import { FallOutlined, RiseOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Space, Statistic, Typography } from "antd";
const { Text } = Typography;
type StatisticCardProps = {
    name: React.ReactNode;
    count: number;
    unit?: string;
    previousCount?: number;
    totalCount?: number;
    totalCountUnit?: string;
};
const StatisticCard: React.FC<StatisticCardProps> = (props) => {
    if (props.previousCount != null) {
        let color = null;
        let prefix = null;
        if (props.previousCount > props.count) {
            color = "#cf1322";
            prefix = <FallOutlined />;
        } else if (props.previousCount == props.count) {
            color = "#3f8600";
            prefix = null;
        } else {
            color = "#3fBB00";
            prefix = <RiseOutlined />;
        }
        return (
            <>
                <Col xs={12} sm={8} md={6} lg={6} xl={4} xxl={4}>
                    <Card style={{ margin: 10 }} bordered={false}>
                        <Statistic
                            title={props.name}
                            value={props.count}
                            valueStyle={{ color }}
                            prefix={prefix}
                            suffix={props.unit}
                        />
                        <Flex justify="end">
                            <Space>
                                <Text type="secondary">总计</Text>
                                <Text>{props.totalCount}</Text>
                                <Text>{props.unit}</Text>
                            </Space>
                        </Flex>
                    </Card>
                </Col>
            </>
        );
    } else {
        if (props.totalCount != null) {
            return <>
                <Col xs={12} sm={8} md={6} lg={6} xl={4} xxl={4}>
                    <Card style={{ margin: 10 }} bordered={false}>
                        <Statistic
                            title={props.name}
                            value={props.count}
                            valueStyle={{ color: "#3f8600" }}
                            suffix={props.unit}
                        />
                        <Flex justify="end">
                            <Space>
                                <Text type="secondary">总计</Text>
                                <Text>{props.totalCount}</Text>
                                <Text>{props.totalCountUnit}</Text>
                            </Space>
                        </Flex>
                    </Card>
                </Col>
            </>
        } else {
            return (
                <>
                    <Col xs={12} sm={8} md={6} lg={6} xl={4} xxl={4}>
                        <Card style={{ margin: 10 }} bordered={false}>
                            <Statistic
                                title={props.name}
                                value={props.count}
                                valueStyle={{ color: "#3f8600" }}
                                suffix={props.unit}
                            />
                        </Card>
                    </Col>
                </>
            );
        }
    }
};

export default StatisticCard;