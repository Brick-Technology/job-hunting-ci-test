import { convertTimeOffsetToHumanReadable } from "@/common/utils";
import { Avatar, Card, Empty, Flex, Pagination, Spin, Typography, message } from "antd";
import Link from "antd/es/typography/Link";
import { IssueData } from "../../data/IssueData";
const { Text } = Typography;
import { GithubApi, EXCEPTION } from "@/common/api/github";
import { CommentData, convertCommentList } from "../../data/CommentData";
import Comment from "./Comment";
const PAGE_SIZE = 10;

export type IssueCommentViewProps = {
    data: IssueData;
};
const IssueCommentView: React.FC<IssueCommentViewProps> = ({ data }) => {

    const { author, bodyHTML, createdAt, bodyUrl, number } = data;
    const { avatarUrl, login } = author;
    const [commentData, setCommentData] = useState<CommentData[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [refresh, setRefresh] = useState(false);
    const commentTitleRef = useRef();
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const search = async () => {
            //scroll to top
            scrollToTop();
            setLoading(true);
            try {
                let result = await GithubApi.listIssueComment(number, { pageSize: pageSize, pageNum: currentPage });
                setCommentData(convertCommentList(result.items))
                if (result.lastPageNum != null) {
                    setTotal(result.lastPageNum * pageSize);
                }
            } catch (e) {
                if (e == EXCEPTION.NO_LOGIN) {
                    messageApi.open({
                        type: 'warning',
                        content: `需要登录后查看`,
                    });
                } else {
                    messageApi.open({
                        type: 'error',
                        content: `查询失败`,
                    });
                }
            } finally {
                setLoading(false);
            }
        }
        search();
    }, [currentPage, pageSize, refresh])

    const scrollToTop = () => {
        commentTitleRef.current.scrollIntoView();
    }

    const onPageChange = (page: number, pageSize: number) => {
        if (page > currentPage) {
            setCurrentPage(currentPage + 1);
        } else {
            setCurrentPage(currentPage - 1);
        }
        setPageSize(pageSize)
    }

    return <>
        {contextHolder}
        <Flex vertical gap={10}>
            <Text type="warning">原讨论内容</Text>
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
            <Flex vertical gap={5}>
                <Text ref={commentTitleRef} type="secondary">评论</Text>
                <Spin spinning={loading}>
                    <Flex vertical gap={10}>
                        {commentData && commentData.length > 0 ?
                            commentData.map((item, index) => (
                                <Comment key={item.id} data={item}></Comment>
                            )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                        <Pagination simple current={currentPage} total={total} pageSize={PAGE_SIZE} onChange={onPageChange} />
                    </Flex>
                </Spin>
            </Flex>
        </Flex>
    </>
}
export default IssueCommentView;
