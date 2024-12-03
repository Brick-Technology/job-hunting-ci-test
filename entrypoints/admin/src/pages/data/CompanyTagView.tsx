import { CompanyApi, TagApi } from "@/common/api";
import { companyTagDataToExcelJSONArray } from "@/common/excel";
import { dateToStr } from "@/common/utils";
import {
  Col,
  DatePicker,
  Form,
  Input,
  Select,
  TableColumnsType,
  Tag,
  Typography, message
} from "antd";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import BasicTable from "../../components/BasicTable";
import { CompanyTagData } from "../../data/CompanyTagData";
import { useCompanyTag } from "../../hooks/companyTag";

const { RangePicker } = DatePicker;
const { Text } = Typography;
const { convertToCompanyTagDataList, convertSortField } = useCompanyTag();
dayjs.extend(duration)

const columns: TableColumnsType<CompanyTagData> = [
  {
    title: '公司全称',
    dataIndex: 'companyName',
    render: (value: string) => <Text>{value}</Text>,
    minWidth: 200,
  },
  {
    title: '标签',
    dataIndex: 'nameArray',
    render: (value: string[]) => {
      const result = [];
      value.map((item) => {
        result.push(
          <Tag key={item}>{item}</Tag>
        );
      })
      return result;
    },
    minWidth: 300,
  },
  {
    title: '标签数',
    dataIndex: 'nameArray',
    render: (value: string[]) => <Text>{value.length}</Text>,
    minWidth: 50,
  },
  {
    title: '更新时间',
    dataIndex: 'updateDatetime',
    render: (value: Date) => <Text title={dateToStr(value)}>{dateToStr(value, "YYYY-MM-DD")}</Text>,
    minWidth: 80,
    sorter: true,
  },
];

const fillSearchParam = (searchParam, values) => {
  const { name, tags } = values;
  searchParam.companyName = name;
  searchParam.tagNames = tags;
}

const CompanyTagView: React.FC = () => {

  const [messageApi, contextHolder] = message.useMessage();
  const [whitelist, setWhitelist] = useState([]);

  const searchFields = {
    common: [
      <Col span={8} key="name">
        <Form.Item
          name={`name`}
          label={`公司名`}
        >
          <Input placeholder="请输入公司名" />
        </Form.Item>
      </Col>,
      <Col span={8} key="tags">
        <Form.Item
          name={`tags`}
          label={`标签`}
        >
          <Select
            allowClear
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入公司标签"
            options={whitelist}
          />
        </Form.Item>
      </Col>,
    ]
  }

  useEffect(() => {
    const getWhitelist = async () => {
      let allTags = await TagApi.getAllTag();
      let tagItems = [];
      allTags.forEach((item) => {
        tagItems.push({ value: item.tagName, code: item.tagId });
      });
      setWhitelist(tagItems);
    };
    getWhitelist();
  }, []);

  return <>
    {contextHolder}
    <BasicTable searchProps={{
      columns,
      searchFields,
      fillSearchParam,
      convertSortField,
      search: async (searchParam) => {
        return CompanyApi.searchCompanyTag(searchParam);
      },
      convertToDataList: convertToCompanyTagDataList,
      rowKeyFunction: (record) => { return record.companyId },
    }}
      exportProps={{
        dataToExcelJSONArray: companyTagDataToExcelJSONArray,
        title: "公司标签"
      }}
    ></BasicTable>
  </>
}

export default CompanyTagView;