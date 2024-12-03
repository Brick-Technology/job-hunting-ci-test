import { CompanyApi } from "@/common/api";
import { companyDataToExcelJSONArray } from "@/common/excel";
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
import CompanyItemTable from "../../components/CompanyItemTable";
import { JobData } from "../../data/JobData";
import { useCompany } from "../../hooks/company";

const { RangePicker } = DatePicker;
const { Text } = Typography;
const { convertToCompanyDataList, convertSortField } = useCompany();
dayjs.extend(duration)

const columns: TableColumnsType<JobData> = [
  {
    title: '公司全称',
    dataIndex: 'name',
    render: (value: string) => <Text>{value}</Text>,
    minWidth: 200,
  },
  {
    title: '公司经营状态',
    dataIndex: 'status',
    render: (value: string) => <Text>{value}</Text>,
    minWidth: 100,
  },
  {
    title: '所属行业',
    dataIndex: 'industry',
    render: (value: string) => <Text>{value}</Text>,
    minWidth: 150,
  },
  {
    title: '成立时间',
    dataIndex: 'startDate',
    render: (value: Date) => <Text title={dateToStr(value)}>{dateToStr(value, "YYYY-MM-DD")}</Text>,
    minWidth: 120,
    sorter: true,
  },
  {
    title: '地址',
    dataIndex: 'address',
    render: (value: string) => <Text>{value}</Text>,
    minWidth: 100,
  },
  {
    title: '社保人数',
    dataIndex: 'insuranceNum',
    render: (value: string) => <Text>{value}</Text>,
    minWidth: 80,
  },
  {
    title: '统一社会信用代码',
    dataIndex: 'unifiedCode',
    render: (text: string) => <Text>{text}</Text>,
    minWidth: 160,
  },
  {
    title: '法人',
    dataIndex: 'legalPerson',
    render: (value: string) => <Text>{value}</Text>,
    minWidth: 70,
  },
  {
    title: '更新时间',
    dataIndex: 'updateDatetime',
    render: (value: Date) => <Text title={dateToStr(value)}>{dateToStr(value, "YYYY-MM-DD")}</Text>,
    minWidth: 80,
    sorter: true,
  },
];

const searchFields =
{
  common: [<Col span={8} key="name">
    <Form.Item
      name={`name`}
      label={`公司名`}
    >
      <Input placeholder="请输入公司名" />
    </Form.Item>
  </Col>,
  <Col span={8} key="startDate">
    <Form.Item
      name={`startDate`}
      label={`成立时间`}
    >
      <RangePicker />
    </Form.Item>
  </Col>,],
}

const fillSearchParam = (searchParam, values) => {
  const { name, startDate } = values;
  searchParam.companyName = name;
  if (startDate && startDate.length > 0) {
    searchParam.startDateStartDatetime = startDate[0];
    searchParam.startDateEndDatetime = startDate[1];
  } else {
    searchParam.startDateStartDatetime = null;
    searchParam.startDateEndDatetime = null;
  }

}

const CompanyView: React.FC = () => {

  const [messageApi, contextHolder] = message.useMessage();

  return <>
    {contextHolder}
    <BasicTable searchProps={{
      columns,
      searchFields,
      fillSearchParam,
      convertSortField,
      search: async (searchParam) => {
        return CompanyApi.searchCompany(searchParam);
      },
      convertToDataList: convertToCompanyDataList,
    }}
      expandedRowRender={(record) => {
        return <CompanyItemTable data={record}></CompanyItemTable>
      }}
      exportProps={{
        dataToExcelJSONArray: companyDataToExcelJSONArray,
        title: "公司"
      }}
    ></BasicTable>
  </>
}

export default CompanyView;