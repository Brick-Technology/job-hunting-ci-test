import { ShareAltOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, message, Modal, Popconfirm, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import styles from "./HeaderRight.module.css";
const { Text } = Typography;

import { Icon } from '@iconify/react';
import Link from 'antd/es/typography/Link';
import Markdown from 'marked-react';
import { useShallow } from 'zustand/shallow';
import useAuthStore from "../store/AuthStore";
import useDataSharePlanStore from '../store/DataSharePlanStore';
import useSystemStore from '../store/SystemStore';
const HeaderRight: React.FC = () => {

    const [auth, login, logout, username, avatar] = useAuthStore(useShallow(((state) => [
        state.auth,
        state.login,
        state.logout,
        state.username,
        state.avatar,
    ])));

    const [enable] = useDataSharePlanStore(useShallow(((state) => [
        state.enable,
    ])));

    const [versionObject, newVersion, latestVersion, latestVersionCreatedAt, latestChangelogContent, query, downloadLatest] = useSystemStore(useShallow((state => [
        state.versionObject,
        state.newVersion,
        state.latestVersion,
        state.latestVersionCreatedAt,
        state.latestChangelogContent,
        state.query,
        state.downloadLatest,
    ])));

    const [isLatestChangelogContentModalOpen, setIsLatestChangelogContentModalOpen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        query();
    }, [])

    return (
        <Flex gap="small" align="center" className={styles.root}>
            {contextHolder}
            <Flex gap={5} vertical>
                <Flex justify="end">
                    {newVersion ? <Tag style={{ cursor: "pointer" }} onClick={() => {
                        setIsLatestChangelogContentModalOpen(true);
                    }} color="yellow"><Flex align="center"><Icon icon="mdi:arrow-up-bold-box"></Icon>发现新版本</Flex></Tag> : null}
                </Flex>
                <Flex justify="end">
                    {
                        enable ? <Tooltip color="green" title="数据共享计划：开启"><ShareAltOutlined style={{ color: "green", fontSize: "18px" }} /></Tooltip>
                            : null
                    }
                </Flex>
            </Flex>
            <Flex vertical align="end">
                {auth ? <Text>{`${username}`}</Text> : <Link onClick={login} >登录</Link>}
                {auth ? <Text type="success">在线</Text> : <Text type="warning">离线</Text>}
            </Flex>
            {auth ? <Popconfirm
                title="登出"
                description="确定登出？"
                onConfirm={logout}
                onCancel={() => { }}
                okText="是"
                cancelText="否"
            >
                <Avatar style={{ cursor: "pointer" }} alt={username} size="large" icon={auth ? <UserOutlined /> : null} src={auth ? avatar : null} />
            </Popconfirm>
                : <Avatar style={{ cursor: "pointer" }} alt={username} onClick={() => {
                    login();
                }} size="large" icon={auth ? <UserOutlined /> : null} src={auth ? avatar : null} />
            }
            <Modal
                title={`新版本详情[${latestVersion}]${latestVersionCreatedAt}`}
                width="80%"
                destroyOnClose
                open={isLatestChangelogContentModalOpen}
                onCancel={() => {
                    setIsLatestChangelogContentModalOpen(false);
                }}
                okText="下载新版本"
                onOk={() => {
                    try {
                        downloadLatest(versionObject);
                    } catch (e) {
                        messageApi.error(e);
                    }
                }}
            >
                <Markdown>
                    {latestChangelogContent}
                </Markdown>
            </Modal>
        </Flex>
    );
};

export default HeaderRight;