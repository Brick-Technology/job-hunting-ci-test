import { Flex } from 'antd';
import React from 'react';
import { Typography } from 'antd';
import { CheckCard } from '@ant-design/pro-components';
import useDataSharePlanStore from '../store/DataSharePlanStore';
import { useShallow } from 'zustand/shallow';

const { Title } = Typography;

const SettingView: React.FC = () => {
  const [enable, change] = useDataSharePlanStore(useShallow(((state) => [
    state.enable,
    state.change
  ])));
  const [dataSharePlanEnable, setDataSharePlanEnable] = useState(false);

  useEffect(() => {
    setDataSharePlanEnable(enable);
  }, [])

  return <>
    <Flex gap="small" wrap vertical>
      <Flex vertical>
        <Title level={4}>数据共享计划</Title>
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
      </Flex>
    </Flex>
  </>
};

export default SettingView;