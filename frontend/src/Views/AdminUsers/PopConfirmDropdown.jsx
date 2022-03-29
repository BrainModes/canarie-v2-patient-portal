import React, { useState } from "react";
import { Menu, Dropdown, Button, Popconfirm, message, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useTranslation } from 'react-i18next';

import { suspendUsers } from "../../APIs";

const { Text } = Typography;

function PopconfirmDropdown({ record, fetchUsers }) {
	const [v, setV] = useState(false);
	const { t, i18n } = useTranslation(['message']);
	
	const menu = (id) => (
		<Menu>
			<Menu.Item key={id}>
				<Text type="danger" onClick={() => setV(true)}>
					Suspend
				</Text>
			</Menu.Item>
		</Menu>
	);

	async function suspendUser() {
		suspendUsers([record.username])
			.then((res) => {
				message.success(`The user ${record.username} is suspended`);
				fetchUsers();
			})
			.then((error) => console.log(error));
	}
	return (
		<Popconfirm
			title={`${t('message:users.suspend.doubleConfirm')} ${record.username}?`}
			cancelText="No"
			trigger="click"
			visible={v}
			onCancel={() => setV(false)}
			onConfirm={() => {
				suspendUser();
				setV(false);
			}}
		>
			<Dropdown
				overlay={menu(record._id, record.name)}
				placement="bottomLeft"
			>
				<Button
					className="ant-dropdown-link"
					type="link"
					style={{ paddingLeft: "0" }}
				>
					More <DownOutlined />
				</Button>
			</Dropdown>
		</Popconfirm>
	);
}

export default PopconfirmDropdown;
