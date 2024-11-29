import { TaskData } from "../../data/TaskData";
import dayjs from "dayjs";
import { dateToStr } from "@/common/utils";
import { Carousel, Flex, Image } from "antd";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration)

const contentStyle: React.CSSProperties = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
};

export type MissionLogDetailProps = {
    data: TaskData;
}

const MissionLogDetail: React.FC<MissionLogDetailProps> = ({ data }) => {
    const { status, screenshotList, reason } = data.taskRunData;
    const { logList, count, startDatetime, endDatetime } = data.taskRunData.logDetail;
    return (<>
        <Flex vertical>
            <Flex>
                <Flex>任务时间：</Flex>
                <Flex>{dateToStr(startDatetime)} - {dateToStr(endDatetime)}</Flex>
            </Flex>
            <Flex>
                <Flex>运行结果：</Flex>
                <Flex>{status}</Flex>
            </Flex>
            <Flex>
                <Flex>错误原因：</Flex>
                <Flex>{reason}</Flex>
            </Flex>
            <Flex>
                <Flex>耗时：</Flex>
                <Flex>{
                    dayjs.duration(dayjs(endDatetime).diff(startDatetime)).minutes()
                }分{
                        dayjs.duration(dayjs(endDatetime).diff(startDatetime)).seconds()
                    }秒
                </Flex>
            </Flex>
            <Flex>
                <Flex>查看页数：</Flex>
                <Flex>{count - 1}页</Flex>
            </Flex>
            <Flex>
                <Image.PreviewGroup
                    items={screenshotList}
                >
                    <Image
                        width="100%"
                        height={300}
                        style={{ objectFit: "cover" }}
                        src={screenshotList[0]}
                    />
                </Image.PreviewGroup>
            </Flex>
            <Flex vertical>
                <Flex>日志({logList.length})：</Flex>
                <Flex vertical>
                    {logList.map((item, index) => (
                        <Flex>{item}</Flex>
                    ))}
                </Flex>
            </Flex>
        </Flex>

    </>)
}

export default MissionLogDetail;