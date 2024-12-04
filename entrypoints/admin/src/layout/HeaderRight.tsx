import { ShareAltOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Popconfirm, Tooltip, Typography } from 'antd';
import React from 'react';
import styles from "./HeaderRight.module.css";
const { Text } = Typography;

import Link from 'antd/es/typography/Link';
import { useShallow } from 'zustand/shallow';
import useAuthStore from "../store/AuthStore";
import useDataSharePlanStore from '../store/DataSharePlanStore';
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

    return (
        <Flex gap="small" align="center" className={styles.root}>
            <Flex gap={5} align="end" vertical>
                <Flex>
                    <></>
                </Flex>
                <Flex>
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
        </Flex>
    );
};

export default HeaderRight;