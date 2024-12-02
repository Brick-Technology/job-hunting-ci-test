import { JobApi } from "@/common/api";
import { UI_DEFAULT_PAGE_SIZE } from "@/common/config";
import { SearchJobBO } from "@/common/data/bo/searchJobBO";
import { jobDataToExcelJSONArray } from "@/common/excel";
import { dateToStr } from "@/common/utils";
import { DownOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Flex, Form, GetProp,
  Input,
  Row,
  Space, Table, TableColumnsType, TablePaginationConfig,
  TableProps, Typography, message,
  theme
} from "antd";
import { SorterResult } from "antd/es/table/interface";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { utils, writeFileXLSX } from "xlsx";
import JobItemTable from "../../components/JobItemTable";
import { CompanyData } from "../../data/CompanyData";
import { JobData } from "../../data/JobData";
import { useJob } from "../../hooks/job";

const { RangePicker } = DatePicker;
const { Text } = Typography;
const { convertToJobDataList, platformFormat, convertSortField } = useJob();
dayjs.extend(duration)

const columns: TableColumnsType<JobData> = [
  {
    title: '名称',
    dataIndex: 'name',
    render: (text: string) => <Text>{text}</Text>,
    minWidth: 200,
  },
  {
    title: '公司',
    dataIndex: 'company',
    render: (value: CompanyData) => <Text>{value.name}</Text>,
    minWidth: 200,
  },
  {
    title: '发布时间',
    dataIndex: 'publishDatetime',
    render: (value: Date) => <Text title={dateToStr(value)}>{dateToStr(value, "YYYY-MM-DD")}</Text>,
    minWidth: 120,
    sorter: true,
  },
  {
    title: '地区',
    dataIndex: 'location',
    render: (text: string) => <Text>{text}</Text>,
    minWidth: 100,
  },
  {
    title: '最低薪资',
    dataIndex: 'salaryMin',
    render: (text: string) => <Text>{text}</Text>,
    minWidth: 120,
    sorter: true,
  },
  {
    title: '最高薪资',
    dataIndex: 'salaryMax',
    render: (text: string) => <Text>{text}</Text>,
    minWidth: 120,
    sorter: true,
  },
  {
    title: '几薪',
    dataIndex: 'salaryTotalMonth',
    render: (text: string) => <Text>{text}</Text>,
    minWidth: 80,
    sorter: true,
  },
  {
    title: '职位标签数',
    dataIndex: 'jobTagList',
    render: (value: { tagName: string }[]) => <Text>{value?.length}</Text>,
    minWidth: 100,
  },
  {
    title: '公司标签数',
    dataIndex: 'company',
    render: (value: CompanyData) => <Text>{value.companyTagList?.length}</Text>,
    minWidth: 100,
  },
  {
    title: '学历',
    dataIndex: 'degree',
    render: (text: string) => <Text>{text}</Text>,
    minWidth: 80,
    sorter: true,
  },
  {
    title: '招聘平台',
    dataIndex: 'platform',
    render: (text: string) => <Text>{platformFormat(text)}</Text>,
    minWidth: 100,
  },
  {
    title: '首次扫描时间',
    dataIndex: 'createDatetime',
    render: (value: Date) => <Text title={dateToStr(value)}>{dateToStr(value, "YYYY-MM-DD")}</Text>,
    minWidth: 120,
    sorter: true,
  },
  {
    title: '查看数',
    dataIndex: 'browseCount',
    render: (text: string) => <Text>{text}</Text>,
    minWidth: 80,
    sorter: true,
  },
  {
    title: '最近查看时间',
    dataIndex: 'browseTime',
    render: (value?: Date) => <Text title={dateToStr(value)}>{dateToStr(value, "YYYY-MM-DD")}</Text>,
    minWidth: 120,
    sorter: true,
  },
];

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<any>['field'];
  sortOrder?: SorterResult<any>['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

export type JobViewProps = {

}

const JobView: React.FC<JobViewProps> = ({ }) => {

  const [dataSource, setDataSource] = useState<JobData[]>();
  const [loading, setLoading] = useState(false);
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
  const [messageApi, contextHolder] = message.useMessage();
  const [searchParam, setSearchParam] = useState<SearchJobBO>({
    pageNum: 1,
    pageSize: UI_DEFAULT_PAGE_SIZE,
    orderByColumn: "update_datetime",
    orderBy: "DESC",
  });
  const [originalData, setOriginalData] = useState();
  const [exportLoading, setExportLoading] = useState(false);

  const handleTableChange: TableProps<JobData>['onChange'] = (pagination, filters, sorter) => {
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
      searchParam.orderByColumn = "update_datetime"
      searchParam.orderBy = "DESC";
    }
    setSearchParam(searchParam);
  };

  const fetchData = () => {
    (async () => {
      setLoading(true);
      let searchResult = await JobApi.searchJob(searchParam);
      setDataSource(convertToJobDataList(searchResult.items));
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

  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [expand, setExpand] = useState(false);

  const formStyle: React.CSSProperties = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 10,
  };

  const getFields = () => {
    const commonList = [
      <Col span={8} key="name">
        <Form.Item
          name={`name`}
          label={`名称`}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>
      </Col>,
      <Col span={8} key="companyName">
        <Form.Item
          name={`companyName`}
          label={`公司名`}
        >
          <Input placeholder="请输入公司名" />
        </Form.Item>
      </Col>,
      <Col span={8} key="location">
        <Form.Item
          name={`location`}
          label={`地区`}
        >
          <Input placeholder="请输入地区" />
        </Form.Item>
      </Col>,
    ];

    const expandList = [
      <Col span={8} key="address">
        <Form.Item
          name={`address`}
          label={`地址`}
        >
          <Input placeholder="请输入地址" />
        </Form.Item>
      </Col>,
      <Col span={8} key="createDatetime">
        <Form.Item
          name={`createDatetime`}
          label={`首次扫描时间`}
        >
          <RangePicker />
        </Form.Item>
      </Col>,
      <Col span={8} key="publishDatetime">
        <Form.Item
          name={`publishDatetime`}
          label={`发布时间`}
        >
          <RangePicker />
        </Form.Item>
      </Col>,
    ]

    return expand ? [...commonList, ...expandList] : [...commonList];
  };

  const onFinish = (values: any) => {
    const { name, location, address, companyName, createDatetime, publishDatetime } = values;
    tableParams.pagination.current = 1;
    searchParam.pageNum = 1;
    searchParam.jobName = name;
    searchParam.jobLocationName = location;
    searchParam.jobAddress = address;
    searchParam.jobCompanyName = companyName;
    if (createDatetime && createDatetime.length > 0) {
      searchParam.startDatetime = createDatetime[0];
      searchParam.endDatetime = createDatetime[1];
    } else {
      searchParam.startDatetime = null;
      searchParam.endDatetime = null;
    }
    if (publishDatetime && publishDatetime.length > 0) {
      searchParam.firstPublishStartDatetime = publishDatetime[0];
      searchParam.firstPublishEndDatetime = publishDatetime[1];
    } else {
      searchParam.firstPublishStartDatetime = null;
      searchParam.firstPublishEndDatetime = null;
    }
    setSearchParam(searchParam);
    setTableParams(tableParams);
    setRefresh(!refresh);
  };

  const exportData = () => {
    try {
      setExportLoading(true);
      let result = jobDataToExcelJSONArray(originalData);
      const ws = utils.json_to_sheet(result);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Data");
      writeFileXLSX(wb, `职位-${dayjs(new Date()).format("YYYYMMDDHHmmss")}` + ".xlsx");
    } finally {
      setExportLoading(false);
    }
  }

  return <>
    {contextHolder}
    <Flex vertical>
      <Space size="small" direction="vertical">
        <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish}>
          <Row gutter={24}>{getFields()}</Row>
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
              <a
                style={{ fontSize: 12 }}
                onClick={() => {
                  setExpand(!expand);
                }}
              >
                <DownOutlined rotate={expand ? 180 : 0} /> 折叠
              </a>
            </Space>
          </div>
        </Form>
        <Table<JobData>
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={loading}
          onChange={handleTableChange}
          size="small"
          expandable={{
            expandedRowRender: (record) => <>
              <JobItemTable data={record}></JobItemTable>
            </>,
          }}
        />
      </Space>
    </Flex>
  </>
}

export default JobView;