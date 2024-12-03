import { JobApi } from "@/common/api";
import { jobDataToExcelJSONArray } from "@/common/excel";
import { dateToStr } from "@/common/utils";
import {
  Col,
  DatePicker,
  Form,
  Input,
  TableColumnsType,
  Typography, message
} from "antd";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import BasicTable from "../../components/BasicTable";
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

const genFields = (expand: boolean): JSX.Element[] => {
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

const fillSearchParam = (searchParam, values) => {
  const { name, location, address, companyName, createDatetime, publishDatetime } = values;
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
}

const JobView: React.FC = () => {

  const [messageApi, contextHolder] = message.useMessage();

  return <>
    {contextHolder}
    <BasicTable searchProps={{
      columns,
      genFields,
      fillSearchParam,
      convertSortField,
      search: async (searchParam) => {
        return JobApi.searchJob(searchParam);
      },
      convertToDataList: convertToJobDataList,
    }}
      expandedRowRender={(record) => {
        return <JobItemTable data={record}></JobItemTable>
      }}
      exportProps={{
        dataToExcelJSONArray: jobDataToExcelJSONArray,
        title: "职位"
      }}
    ></BasicTable>
  </>
}

export default JobView;