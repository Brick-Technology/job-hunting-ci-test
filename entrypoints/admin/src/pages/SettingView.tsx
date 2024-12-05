import { CheckCard } from '@ant-design/pro-components';
import { Icon } from '@iconify/react';
import { Button, Card, Flex, Tooltip, Typography } from 'antd';
import React from 'react';
import { useShallow } from 'zustand/shallow';
import { useData } from '../hooks/data';
import useAuthStore from '../store/AuthStore';
import useDataSharePlanStore from '../store/DataSharePlanStore';
import DataBackupRestore from './setting/DataBackupRestore';
import DatabaseBackupRestore from './setting/DatabaseBackupRestore';

const { Title, Text, Link } = Typography;

const SettingView: React.FC = () => {
  const [enable, change] = useDataSharePlanStore(useShallow(((state) => [
    state.enable,
    state.change
  ])));
  const [installAndLogin] = useAuthStore(useShallow((state => [
    state.installAndLogin,
  ])));
  const [dataSharePlanEnable, setDataSharePlanEnable] = useState(false);
  const {
    getJobDataToExcelJsonArray, saveJobData, getCompanyDataToExcelJsonArray,
    saveCompanyData, getCompanyTagDataToExcelJsonArray, saveCompanyTagData,
    getJobTagDataToExcelJsonArray, saveJobTagData,
    JOB_FILE_HEADER, COMPANY_FILE_HEADER, COMPANY_TAG_FILE_HEADER, JOB_TAG_FILE_HEADER,
  } = useData();

  useEffect(() => {
    setDataSharePlanEnable(enable);
  }, [])

  return <>
    <Flex gap="small" wrap vertical>
      <Card title="GitHub App" bordered={false} size="small">
        <Flex vertical gap={5}>
          <Flex>
            <Tooltip title="安装GitHubApp获得评论、数据共享计划能力">
              <Button onClick={() => {
                installAndLogin();
              }} icon=<Icon icon="mdi:github" />>安装GitHubApp并登录</Button>
            </Tooltip>
          </Flex>
          <Flex gap={5}>
            <Text type="warning">注意：Github App要求的授权：</Text>
            <Link target="_blank"
              href="https://docs.github.com/rest/overview/permissions-required-for-github-apps#repository-permissions-for-administration">Administration
              <Icon icon="mingcute:warning-line" />
            </Link>
            <Link target="_blank"
              href="https://docs.github.com/rest/overview/permissions-required-for-github-apps#repository-permissions-for-issues">Issues
              <Icon icon="mingcute:warning-line" />
            </Link>
            <Link target="_blank"
              href="https://docs.github.com/rest/overview/permissions-required-for-github-apps#repository-permissions-for-contents">Contents
              <Icon icon="mingcute:warning-line" />
            </Link>
            <Link target="_blank"
              href="https://docs.github.com/rest/overview/permissions-required-for-github-apps#repository-permissions-for-metadata">Metadata
              <Icon icon="mingcute:warning-line" />
            </Link>
          </Flex>
        </Flex>
      </Card>
      <Card title="数据共享计划" bordered={false} size="small">
        <CheckCard.Group
          onChange={async (value) => {
            if (value) {
              await change(true);
              setDataSharePlanEnable(true);
            } else {
              await change(false);
              setDataSharePlanEnable(false);
            }
          }}
          value={dataSharePlanEnable}
        >
          <CheckCard title="开启" description="开启数据共享计划" value={true} />
          <CheckCard title="关闭" description="关闭数据共享计划" value={false} />
        </CheckCard.Group>
      </Card>
      <Card title="数据管理" bordered={false} size="small">
        <Flex vertical gap={5}>
          <DatabaseBackupRestore />
          <DataBackupRestore title="职位" getExcelJsonArrayFunction={getJobDataToExcelJsonArray}
            fileHeader={JOB_FILE_HEADER} saveDataFunction={saveJobData} />
          <DataBackupRestore title="公司" getExcelJsonArrayFunction={getCompanyDataToExcelJsonArray}
            fileHeader={COMPANY_FILE_HEADER} saveDataFunction={saveCompanyData} />
          <DataBackupRestore title="职位标签" getExcelJsonArrayFunction={getJobTagDataToExcelJsonArray}
            fileHeader={JOB_TAG_FILE_HEADER} saveDataFunction={saveJobTagData} />
          <DataBackupRestore title="公司标签"
            getExcelJsonArrayFunction={getCompanyTagDataToExcelJsonArray} fileHeader={COMPANY_TAG_FILE_HEADER}
            saveDataFunction={saveCompanyTagData} />
        </Flex>
      </Card>
    </Flex>
  </>
};

export default SettingView;