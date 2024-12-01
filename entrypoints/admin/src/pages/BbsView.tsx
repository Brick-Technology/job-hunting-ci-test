import { ConfigApi } from "@/common/api";
import { GithubApi } from "@/common/api/github";
import { Config } from "@/common/data/domain/config";
import { errorLog } from "@/common/log";
import type { CascaderProps } from 'antd';
import { Cascader, Empty, Flex, Pagination, Spin } from 'antd';
import React from 'react';
import { IssueData } from '../data/IssueData';
import { PageInfo } from '../data/PageInfo';
import { useLocation } from "../hooks/location";
import { BBSViewDTO } from "./bbs/BBSViewDTO";
import Issue from './bbs/Issue';
const { getAllData, getLocationId } = useLocation();

const CONFIG_KEY_VIEW_BBS = "CONFIG_KEY_VIEW_BBS";

interface Option {
  name: string;
  children?: Option[];
}

const options: Option[] = [...getAllData()];

const PAGE_SIZE = 5;

const saveConfig = async (value: string[]) => {
  let configFromStorage = await ConfigApi.getConfigByKey(CONFIG_KEY_VIEW_BBS);
  let bbsViewDTO = new BBSViewDTO();
  let configObject = configFromStorage;
  if (!configObject) {
    configObject = new Config();
    configObject.key = CONFIG_KEY_VIEW_BBS;
  } else {
    if (configObject.value) {
      try {
        bbsViewDTO = JSON.parse(configObject.value);
      } catch (e) {
        errorLog(e);
      }
    }
  }
  bbsViewDTO.location = value;
  configObject.value = JSON.stringify(bbsViewDTO);
  await ConfigApi.addOrUpdateConfig(configObject);
}

const BbsView: React.FC = () => {

  const [selection, setSelection] = useState([]);
  const cascaderRef = useRef<Cascader>();
  const [searchParam, setSearchParam] = useState({
    first: PAGE_SIZE,
    after: null,
    last: null,
    before: null,
    id: getLocationId([])
  });
  const [data, setData] = useState<IssueData[]>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const rootRef = useRef();

  const onChange: CascaderProps<Option>['onChange'] = (value: string[]) => {
    cascaderRef.current.blur();
    saveConfig(value);
    setSelection(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        let configValue = await ConfigApi.getConfigByKey(CONFIG_KEY_VIEW_BBS);
        if (configValue && configValue.value) {
          let config = JSON.parse(configValue.value);
          setSelection(config.location)
        }
      } catch (e) {
        errorLog(e);
      }
    };
    fetchConfig();
  }, [])

  useEffect(() => {
    setSearchParam({
      first: PAGE_SIZE,
      after: null,
      last: null,
      before: null,
      id: getLocationId(selection)
    });
  }, [selection])

  useEffect(() => {
    const search = async () => {
      //scroll to top
      rootRef.current.parentElement.scrollTo(0, 0);
      setLoading(true);
      let result = await GithubApi.queryComment(searchParam);
      setData(result.search.nodes);
      setTotal(result.search.issueCount);
      setPageInfo(result.search.pageInfo);
      setLoading(false);
    };
    if (searchParam.id != "") {
      search();
    }
  }, [searchParam]);

  const onPageChange = (page: number, pageSize: number) => {
    if (page > currentPage) {
      searchParam.first = pageSize;
      searchParam.last = null;
      searchParam.after = pageInfo ? pageInfo.endCursor : null;
      searchParam.before = null;
      setCurrentPage(currentPage + 1);
    } else {
      searchParam.first = null;
      searchParam.last = pageSize;
      searchParam.after = null;
      searchParam.before = pageInfo ? pageInfo.startCursor : null;
      setCurrentPage(currentPage - 1);
    }
    setSearchParam(Object.assign({}, searchParam));
  }

  return <>
    <Flex ref={rootRef} gap="small" wrap vertical>
      <Flex>
        <Cascader ref={cascaderRef} value={selection} fieldNames={{ label: "name", value: "name", children: "children" }} options={options} onChange={onChange} changeOnSelect />
      </Flex>
      <Spin spinning={loading}>
        <Flex vertical gap={20}>
          {data && data.length > 0 ?
            data.map((item, index) => (
              <Issue key={item.id} data={item}></Issue>
            )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          }
          <Flex justify="end">
            <Pagination simple current={currentPage} total={total} pageSize={PAGE_SIZE} onChange={onPageChange} />
          </Flex>
        </Flex>
      </Spin>
    </Flex>
  </>
};

export default BbsView;