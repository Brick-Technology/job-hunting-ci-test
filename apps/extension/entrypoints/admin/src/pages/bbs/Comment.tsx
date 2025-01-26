import { convertTimeOffsetToHumanReadable } from "@/common/utils";
import { Avatar, Card, Flex, Typography } from "antd";
import Link from "antd/es/typography/Link";
import { CommentData } from "../../data/CommentData";
const { Text } = Typography;


export type CommentProps = {
    data: CommentData;
};
const Comment: React.FC<CommentProps> = ({ data }) => {

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
        >
            <div dangerouslySetInnerHTML={
                { __html: bodyHTML }
            }></div>
        </Card>
    </>
}
export default Comment;
