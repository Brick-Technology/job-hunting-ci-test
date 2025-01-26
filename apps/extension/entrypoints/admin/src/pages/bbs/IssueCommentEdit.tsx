import { Button, Flex, Form, FormProps, Input, Space, Spin } from "antd";
import SubmitButton from "../../components/SubmitButton";
import { IssueCommentEditData } from "../../data/IssueCommentEditData";
import MarkdownEditor from '@uiw/react-markdown-editor';

export type IssueCommentEditProps = {
    data: IssueCommentEditData;
    onSave: (data: IssueCommentEditData) => void;
};
const IssueCommentEdit: React.FC<IssueCommentEditProps> = ({ data, onSave }) => {

    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [markdown, setMarkdown] = useState("");

    const onSaveHandle: FormProps<IssueCommentEditData>["onFinish"] = async (values) => {
        try {
            setLoading(true);
            await onSave(values);
        } finally {
            setLoading(false);
        }
    };

    return <>
        <Spin
            spinning={loading}
            delay={100}
        >
            <Form
                name="basic"
                onFinish={onSaveHandle}
                autoComplete="off"
                requiredMark
                layout="vertical"
                initialValues={data}
            >
                <Form.Item
                    hidden
                    label="编号"
                    name="number"
                    rules={[{ required: true }]}
                >
                    <Input></Input>
                </Form.Item>
                <Form.Item
                    label="内容"
                    name="content"
                    rules={[{ required: true }]}
                >
                    <MarkdownEditor
                        value={markdown}
                        height="400px"
                        onChange={(value, viewUpdate) => setMarkdown(value)}
                    />
                </Form.Item>

                <Form.Item label={null}>
                    <Flex justify="end">
                        <Space>
                            <SubmitButton form={form}>保存</SubmitButton>
                        </Space>
                    </Flex>
                </Form.Item>
            </Form>
        </Spin>
    </>
}
export default IssueCommentEdit;
