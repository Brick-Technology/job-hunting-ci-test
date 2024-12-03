import { JobApi, TagApi } from "@/common/api";
import { jobTagDataToExcelJSONArray } from "@/common/excel";
import { dateToStr } from "@/common/utils";
import {
  Col,
  Form,
  Select,
  TableColumnsType,
  Tag,
  Typography, message
} from "antd";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import BasicTable from "../../components/BasicTable";
import { JobTagData } from "../../data/JobTagData";
import { useJob } from "../../hooks/job";
import { useJobTag } from "../../hooks/jobTag";
const { platformFormat } = useJob();

const { Text } = Typography;
const { convertToJobTagDataList, convertSortField } = useJobTag();
dayjs.extend(duration)

const columns: TableColumnsType<JobTagData> = [
  {
    title: '职位编号',
    dataIndex: 'jobId',
    render: (value: string) => <Text>{value}</Text>,
    minWidth: 200,
  },
  {
    title: '职位名称',
    dataIndex: 'name',
    render: (value: string) => <Text>{value}</Text>,
    minWidth: 200,
  },
  {
    title: '公司全称',
    dataIndex: 'companyName',
    render: (value: string) => <Text>{value}</Text>,
    minWidth: 100,
  },
  {
    title: '招聘平台',
    dataIndex: 'platform',
    render: (value: string) => <Text>{platformFormat(value)}</Text>,
    minWidth: 100,
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
    minWidth: 100,
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
  const { tags } = values;
  searchParam.tagNames = tags;
}

const JobTagView: React.FC = () => {

  const [messageApi, contextHolder] = message.useMessage();
  const [whitelist, setWhitelist] = useState([]);

  const searchFields = {
    common: [
      <Col span={8} key="tags">
        <Form.Item
          name={`tags`}
          label={`标签`}
        >
          <Select
            allowClear
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入职位标签"
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
        return await JobApi.jobTagSearch(searchParam);
      },
      convertToDataList: convertToJobTagDataList,
      rowKeyFunction: (record) => { return record.jobId },
    }}
      exportProps={{
        dataToExcelJSONArray: jobTagDataToExcelJSONArray,
        title: "职位标签"
      }}
    ></BasicTable>
  </>
}

export default JobTagView;