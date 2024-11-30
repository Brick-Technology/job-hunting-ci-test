import { UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Popconfirm, Typography } from 'antd';
import React from 'react';
import styles from "./HeaderRight.module.css";
const { Text } = Typography;

import Link from 'antd/es/typography/Link';
import { useShallow } from 'zustand/shallow';
import useAuthStore from "../store/AuthStore";
const HeaderRight: React.FC = () => {

    const [auth, login, logout, username, avatar] = useAuthStore(useShallow(((state) => [
        state.auth,
        state.login,
        state.logout,
        state.username,
        state.avatar,
    ])));

    return (
        <Flex gap="small" align="center" className={styles.root}>
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
                <Avatar alt={username} size="large" icon={auth ? <UserOutlined /> : null} src={auth ? avatar : null} />
            </Popconfirm>
                : <Avatar alt={username} onClick={() => {
                    login();
                }} size="large" icon={auth ? <UserOutlined /> : null} src={auth ? avatar : null} />
            }
        </Flex>
    );
};

export default HeaderRight;