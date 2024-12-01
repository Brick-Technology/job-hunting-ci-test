import { ConfigApi } from "@/common/api";
import { EXCEPTION, GithubApi } from "@/common/api/github";
import { Config } from "@/common/data/domain/config";
import { errorLog } from "@/common/log";
import type { CascaderProps } from 'antd';
import { Cascader, Empty, Flex, FloatButton, Modal, Pagination, Spin, message } from 'antd';
import React from 'react';
import { IssueData } from '../data/IssueData';
import { PageInfo } from '../data/PageInfo';
import { useLocation } from "../hooks/location";
import { BBSViewDTO } from "./bbs/BBSViewDTO";
import Issue from './bbs/Issue';
import IssueEdit from "./bbs/IssueEdit";
import { IssueEditData } from "../data/IssueEditData";
import { randomDelay } from "@/common/utils";
const { getAllData, getLocationId } = useLocation();

const CONFIG_KEY_VIEW_BBS = "CONFIG_KEY_VIEW_BBS";

interface Option {
  name: string;
  children?: Option[];
}

const options: Option[] = [...getAllData()];

const PAGE_SIZE = 10;

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
  const [messageApi, contextHolder] = message.useMessage();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editData, setEditData] = useState<IssueEditData>();
  const [refresh, setRefresh] = useState(false);

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
      scrollToTop();
      setLoading(true);
      try {
        let result = await GithubApi.queryComment(searchParam);
        setData(result.search.nodes);
        setTotal(result.search.issueCount);
        setPageInfo(result.search.pageInfo);
      } catch (e) {
        if (e == EXCEPTION.NO_LOGIN) {
          messageApi.open({
            type: 'warning',
            content: `需要登录后查看`,
          });
        } else {
          messageApi.open({
            type: 'error',
            content: `查询失败`,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    if (searchParam.id != "") {
      search();
    }
  }, [searchParam, refresh]);

  const scrollToTop = () => {
    rootRef.current.parentElement.scrollTo(0, 0);
  }

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

  const onIssueEditOpen = () => {
    setEditData({ id: getLocationId(selection) })
    setIsIssueModalOpen(true);
  }

  const onIssueSave = async (data: IssueEditData) => {
    try {
      await GithubApi.addComment(data.id, data.content);
      messageApi.open({
        type: 'success',
        content: `新增讨论成功`,
      });
      //延迟，以便能刷新出新讨论
      await randomDelay(1000, 0);
      setIsIssueModalOpen(false);
      setRefresh(!refresh)
    } catch (e) {
      messageApi.open({
        type: 'error',
        content: `新增讨论失败`,
      });
    }
  }

  return <>
    {contextHolder}
    <FloatButton.Group
      shape="circle"
    >
      <FloatButton type="primary" tooltip="新增讨论" onClick={onIssueEditOpen} />
      <FloatButton.BackTop onClick={scrollToTop} visibilityHeight={0} />
    </FloatButton.Group>

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
          <Flex>
            <Pagination simple current={currentPage} total={total} pageSize={PAGE_SIZE} onChange={onPageChange} />
          </Flex>
        </Flex>
      </Spin>
    </Flex>
    <Modal
      title={"新增讨论"}
      open={isIssueModalOpen}
      onCancel={() => {
        setIsIssueModalOpen(false);
      }}
      maskClosable={false}
      footer={null}
      style={{ maxWidth: "1000px" }}
      width="80%"
      destroyOnClose
    >
      <IssueEdit data={editData} onSave={onIssueSave}></IssueEdit>
    </Modal>
  </>
};

export default BbsView;