import { validImportData } from "@/common/excel";
import { Icon } from "@iconify/react";
import { Button, Flex, Input, Modal, Popconfirm, Spin, Typography, message } from "antd";
import dayjs from "dayjs";
import { read, utils, writeFileXLSX } from "xlsx";

const { Title, Text } = Typography;

export type DataBackupRestoreProps = {
    title: string,
    getExcelJsonArrayFunction: () => Promise<any>,
    fileHeader: string[],
    saveDataFunction: (data: any) => Promise<any>,
};

const DataBackupRestore: React.FC<DataBackupRestoreProps> = ({ title, getExcelJsonArrayFunction, fileHeader, saveDataFunction }) => {
    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();

    const [loading, setLoading] = useState(false);

    const onExport = async () => {
        setExportLoading(true);
        try {
            let result = await getExcelJsonArrayFunction();
            const ws = utils.json_to_sheet(result);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Data");
            writeFileXLSX(wb, dayjs(new Date()).format(`${title}-YYYYMMDDHHmmss`) + ".xlsx");
        } finally {
            setExportLoading(false);
        }
    }

    const handleFileImport = async (e) => {
        setFiles(e.target.files);
    };

    const confirmFileImport = async () => {
        if (files && files.length > 0) {
            setImportLoading(true);
            setLoading(true);
            setTimeout(() => {
                const reader = new FileReader();
                reader.readAsArrayBuffer(files[0]);
                reader.onload = async function (event) {
                    let arrayBuffer = event.target.result;
                    try {
                        let wb = read(arrayBuffer);
                        let validResultObject = validImportData(utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }), fileHeader);
                        if (!validResultObject.validResult) {
                            messageApi.error(`${title}文件校验失败，缺少数据列(${validResultObject.lackColumn.length}):${validResultObject.lackColumn.join(",")}`);
                            return;
                        }
                        const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 2 });
                        let targetList = await saveDataFunction(data);
                        setIsImportModalOpen(false);
                        messageApi.success(`导入${title}数据成功，共${targetList.length}条`)
                    } catch (e) {
                        messageApi.error(`导入${title}数据失败${e.message}`);
                    } finally {
                        setLoading(false);
                    }
                };
                reader.onerror = function (event) {
                    messageApi.error(`读取${title}文件失败`);
                };
            }, 0);
        } else {
            messageApi.info(`请选择有效的${title}文件`);
        }
    };

    const reloadExtension = async () => {
        chrome.runtime.reload();
    };

    return <>
        {contextHolder}
        <Spin spinning={loading} fullscreen />
        <Flex vertical gap={5}>
            <Text>{title}</Text>
            <Flex gap={5}>
                <Popconfirm
                    title="导出数据"
                    description="确认导出数据？"
                    onConfirm={onExport}
                    okText="是"
                    cancelText="否"
                >
                    <Button loading={exportLoading}><Icon icon="mdi:document" />全量{title}数据导出</Button>
                </Popconfirm>
                <Button onClick={() => {
                    setImportLoading(false);
                    setIsImportModalOpen(true);
                }}><Icon icon="mdi:file-document-box-plus" />{title}数据导入</Button>
            </Flex>
        </Flex>
        <Modal
            title={`${title}数据导入`}
            open={isImportModalOpen}
            onCancel={() => {
                setIsImportModalOpen(false);
            }}
            footer={null}
            style={{ maxWidth: "500px" }}
            width="80%"
            destroyOnClose
        >
            <Flex vertical gap={5}>
                <Text type="danger">注意：相同{title}的数据会被替换!!!</Text>
                <Text >请选择{title}备份文件</Text>
                <Flex vertical gap={10}>
                    <Input type="file" accept=".xlsx" onChange={handleFileImport}></Input>
                    <Flex justify="end">
                        <Button type="primary" onClick={confirmFileImport} loading={importLoading}>
                            确定
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Modal>
    </>
}
export default DataBackupRestore;
