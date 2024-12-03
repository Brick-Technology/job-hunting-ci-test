import { UI_DEFAULT_PAGE_SIZE } from "@/common/config";
import { DownOutlined } from "@ant-design/icons";
import {
    Button,
    Flex, Form, GetProp,
    Row,
    Space, Table, TableColumnsType, TablePaginationConfig,
    TableProps,
    theme,
    Typography
} from "antd";
import { SorterResult } from "antd/es/table/interface";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { utils, writeFileXLSX } from "xlsx";
const { Text } = Typography;
dayjs.extend(duration)

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: SorterResult<any>['field'];
    sortOrder?: SorterResult<any>['order'];
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

export type BasicTableProps = {
    searchProps: {
        columns: TableColumnsType<any>,
        searchFields: {
            common: JSX.Element[]
            expand?: JSX.Element[]
        },
        fillSearchParam: (searchParam, values: any) => any,
        convertSortField: (key: any) => string,
        search: (searchParam) => Promise<any>,
        convertToDataList: (data: any) => any,
        rowKeyFunction?: (record) => string;
    },
    expandedRowRender?: (record) => JSX.Element,
    exportProps: {
        dataToExcelJSONArray: (originalData: any) => any,
        title: string,
    }
}

const BasicTable: React.FC<BasicTableProps> = ({ searchProps, expandedRowRender, exportProps }) => {

    const { columns, searchFields, fillSearchParam, convertSortField, search, convertToDataList, rowKeyFunction } = searchProps;
    const { dataToExcelJSONArray, title } = exportProps;

    const [dataSource, setDataSource] = useState<any>();
    const [originalData, setOriginalData] = useState();
    const [loading, setLoading] = useState(false);
    const [searchParam, setSearchParam] = useState<any>({
        pageNum: 1,
        pageSize: UI_DEFAULT_PAGE_SIZE,
        orderByColumn: "updateDatetime",
        orderBy: "DESC",
    });
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: UI_DEFAULT_PAGE_SIZE,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100, 200, 500, 1000],
            position: ["topRight", "bottomRight"],
            showTotal: (total) => `共 ${total} 条`,
        },
    });
    const [refresh, setRefresh] = useState(false);

    const [form] = Form.useForm();
    const { token } = theme.useToken();
    const [expand, setExpand] = useState(false);

    const [exportLoading, setExportLoading] = useState(false);

    const fetchData = () => {
        (async () => {
            setLoading(true);
            let searchResult = await search(searchParam);
            setDataSource(convertToDataList(searchResult.items));
            setOriginalData(searchResult.items);
            setLoading(false);
            tableParams.pagination.total = searchResult.total;
            setTableParams(tableParams);
        })();
    };

    useEffect(fetchData, [
        tableParams.pagination?.current,
        tableParams.pagination?.pageSize,
        tableParams?.sortOrder,
        tableParams?.sortField,
        JSON.stringify(tableParams.filters),
        refresh,
    ]);

    const handleTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
        searchParam.pageNum = pagination.current;
        searchParam.pageSize = pagination.pageSize;
        if (tableParams.sortField && tableParams.sortOrder) {
            searchParam.orderByColumn = convertSortField(tableParams.sortField);
            if (tableParams.sortOrder === "descend") {
                searchParam.orderBy = "DESC";
            } else {
                searchParam.orderBy = "ASC";
            }
        } else {
            searchParam.orderByColumn = "updateDatetime"
            searchParam.orderBy = "DESC";
        }
        setSearchParam(searchParam);
        setTableParams({
            pagination,
            filters,
            sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
            sortField: Array.isArray(sorter) ? undefined : sorter.field,
        });
        // `dataSource` is useless since `pageSize` changed
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setDataSource([]);
        }
    };

    const onFinish = (values: any) => {
        tableParams.pagination.current = 1;
        searchParam.pageNum = 1;
        fillSearchParam(searchParam, values);
        setSearchParam(searchParam);
        setTableParams(tableParams);
        setRefresh(!refresh);
    };

    const exportData = () => {
        try {
            setExportLoading(true);
            let result = dataToExcelJSONArray(originalData);
            const ws = utils.json_to_sheet(result);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Data");
            writeFileXLSX(wb, `${title}-${dayjs(new Date()).format("YYYYMMDDHHmmss")}` + ".xlsx");
        } finally {
            setExportLoading(false);
        }
    }

    const createSearchField = () => {
        if (searchFields.expand && expand) {
            return [...searchFields.common, ...searchFields.expand];
        } else {
            return [...searchFields.common];
        }
    }

    return <>
        <Flex vertical>
            <Space size="small" direction="vertical">
                <Form form={form} name="advanced_search" style={{
                    maxWidth: 'none',
                    background: token.colorFillAlter,
                    borderRadius: token.borderRadiusLG,
                    padding: 10,
                }} onFinish={onFinish}>
                    <Row gutter={24}>{createSearchField()}</Row>
                    <div style={{ textAlign: 'right' }}>
                        <Space size="small">
                            <Button type="dashed" loading={exportLoading} onClick={exportData}>
                                导出
                            </Button>
                            <Button type="primary" htmlType="submit">
                                查询
                            </Button>
                            <Button
                                onClick={() => {
                                    form.resetFields();
                                }}
                            >
                                清除
                            </Button>
                            {
                                searchFields.expand && searchFields.expand.length > 0 ? <a
                                    style={{ fontSize: 12 }}
                                    onClick={() => {
                                        setExpand(!expand);
                                    }}
                                >
                                    <DownOutlined rotate={expand ? 180 : 0} /> 折叠
                                </a> : null
                            }
                        </Space>
                    </div>
                </Form>
                <Table<any>
                    rowKey={rowKeyFunction ? (record) => {
                        return rowKeyFunction(record);
                    } : (record) => record.id}
                    columns={[...[{
                        title: '#',
                        render: (value: string, record, index) => <Text>{index + 1 + ((tableParams.pagination.current - 1) * tableParams.pagination.pageSize)}</Text>,
                        minWidth: 50,
                    }], ...columns]}
                    dataSource={dataSource}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    size="small"
                    expandable={{
                        expandedRowRender,
                    }}
                />
            </Space>
        </Flex>
    </>
}

export default BasicTable;