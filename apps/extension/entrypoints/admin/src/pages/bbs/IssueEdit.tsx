import { Button, Flex, Form, FormProps, Input, Space, Spin } from "antd";
import SubmitButton from "../../components/SubmitButton";
import { IssueEditData } from "../../data/IssueEditData";
import MarkdownEditor from '@uiw/react-markdown-editor';

export type IssueEditProps = {
    data: IssueEditData;
    onSave: (data: IssueEditData) => void;
};
const IssueEdit: React.FC<IssueEditProps> = ({ data, onSave }) => {

    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [markdown, setMarkdown] = useState("");

    const onSaveHandle: FormProps<IssueEditData>["onFinish"] = async (values) => {
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
                    name="id"
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
export default IssueEdit;
