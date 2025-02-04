import { Avatar, Button, Card, Flex, Typography } from "antd";
import { IssueData } from "../../data/IssueData";
const { Text } = Typography;
import { convertTimeOffsetToHumanReadable } from "@/common/utils";
import Link from "antd/es/typography/Link";
import { CommentOutlined } from "@ant-design/icons";

export type IssueProps = {
    data: IssueData;
    onCommentOpen: (data: IssueData) => void;
};
const Issue: React.FC<IssueProps> = ({ data, onCommentOpen }) => {

    const { author, bodyHTML, createdAt, bodyUrl } = data;
    const { avatarUrl, login } = author;

    return <>
        <Card title={<Flex align="end" gap={5}>
            <Avatar alt={login} size="large" src={avatarUrl} />
            <Text>{login}</Text>
            <Text type="secondary">{convertTimeOffsetToHumanReadable(createdAt)}</Text>
        </Flex>}
            extra={
                <Link href={bodyUrl} target="_blank">来源</Link>
            }
            actions={[
                <Flex justify="center">
                    <Button onClick={() => {
                        onCommentOpen(data);
                    }} icon={<CommentOutlined key="comment" />}>查看评论</Button>
                </Flex>
            ]}
        >
            <div dangerouslySetInnerHTML={
                { __html: bodyHTML }
            }></div>
        </Card>
    </>
}
export default Issue;
