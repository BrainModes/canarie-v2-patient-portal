import React, { useState, useEffect, useRef } from "react";
import {
	Typography,
	Table,
	Spin,
	Card,
	Button,
	Space,
	Dropdown,
	Menu,
	Modal,
	message,
	Badge,
	Tabs,
} from "antd";
import {
	MoreOutlined,
	UserOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { StandardLayout } from "../../Components/Layout";
import { useCookies } from "react-cookie";
import moment from "moment";
import csv from "papaparse";
import PopConfirmDropdown from "./PopConfirmDropdown";

import InviteUser from "./InviteUser";
import styles from "./index.module.scss";
import BulkInviteUsers from "./BulkInviteUsers";
import { getUsers, suspendUsers, activateUsers, getInvitaion, getInvitaions, } from "../../APIs";
import { useTranslation } from 'react-i18next';
import InvitationTable from "../../Components/Table/InvitationTable";
import ScalableDetails from "../../Components/ScalableDetail/ScalableDetails";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { TabPane } = Tabs;

function AdminUsers() {
	const [cookies] = useCookies(["user"]);
	const [loading, setLoading] = useState(false);
	const [bulkEdit, setBulkEdit] = useState(false);
	const [bulkModal, setBulkModal] = useState(false);
	const [inviteUser, setInviteUser] = useState(false);
	const [users, setUsers] = useState(null);
	const [selectedUsers, setSelectedUsers] = useState(null);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [researchers, setResearchers] = useState([]);
	const [patients, setPatients] = useState([]);

	const [sidePanel, setSidePanel] = useState(false);
	const [currentRecord, setCurrentRecord] = useState(null);
	const [panelWidth, setPanelWidth] = useState(350);
	const [tableWidth, setTableWidth] = useState('70%');

	const myRef = useRef(null);

	const { t, i18n } = useTranslation(['message']);

	useEffect(() => {
		fetchUsers();
	}, []);

	function fetchUsers() {
		getUsers()
			.then((res) => {
				setLoading(false);
				const users = res.data.result;

				const researchers = users.filter((user) => !user.role.includes('patient') && !user.role.includes('container-requester'));

				const patients = users.filter((user) => user.role.includes('patient'));

				setUsers(res.data.result);
				setPatients(patients);
				setResearchers(researchers);
			})
			.catch((res) => {
				setLoading(false);
				console.log(res);
			});
	}

	async function activateUser(users) {
		setLoading(true);
		const result = await activateUsers(users);
		if (result.status === 200) {
			message.success(`${t('message:users.activate.success')} ${users[0]}`);
			fetchUsers();
		} else {
			setLoading(false);
			console.error("failed activating user, ", result);
		}
	}

	async function bulkActivateUser() {
		setLoading(true);
		console.log("bulk activate", selectedRowKeys, selectedUsers);
		const result = await activateUsers(selectedRowKeys);
		if (result.status === 200) {
			message.success(`${selectedRowKeys.length} users activated`);
			fetchUsers();
		} else {
			setLoading(false);
			console.error("failed activating users, ", result);
		}
	}

	const columns = [
		{
			title: "Username",
			dataIndex: "username",
			key: "username",
		},

		{
			title: "Status",
			dataIndex: "enabled",
			key: "enabled",
			render: (text) => {
				return text ? (
					<Badge status="success" text="Active" />
				) : (
					<Badge status="error" text="Disabled" />
				);
			},
		},
		{
			title: "Created at",
			dataIndex: "createdTimestamp",
			key: "createdTimestamp",
			sorter: (a, b) => a.createdTimestamp - b.createdTimestamp,
			render: (text) => {
				return moment(text).format('YYYY-MM-DD HH:mm:ss');
			},
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
		},
		{
			title: "First Name",
			dataIndex: "firstname",
			key: "firstName",
		},
		{
			title: "Last Name",
			dataIndex: "lastname",
			key: "lastName",
		},
		{
			title: "Actions",
			key: "action",
			render: (text, record) => {
				const menu = (user) => (
					<Menu id="teams_role_dropdown">
						{
							record.role && record.role.includes("patient") && (
								<Menu.Item
									onClick={() => {
										setSidePanel(true);
										setCurrentRecord(record);
									}}
									>
									View
								</Menu.Item>
							)
						}

						{
							cookies.username !== record.username && !record.enabled && (
								<Menu.Item
									onClick={() => activateUser([record.username])}
									>
									Activate
								</Menu.Item>
							)
						}
						
						{
							cookies.username !== record.username && record.enabled && (
								<Menu.Item
									onClick={() => {
										suspendUsers([record.username])
										.then((res) => {
											message.success(`The user ${record.username} is suspended`);
											fetchUsers();
										})
										.then((error) => console.log(error));
									}}
									style={{ color: 'red' }}
									>
									Suspend
								</Menu.Item>
							)
						}
					</Menu>
				);

				return (
					<Dropdown overlay={menu(record)} placement="bottomRight">
					  <Button shape="circle">
						<MoreOutlined />
					  </Button>
					</Dropdown>
				)
				// return (
				// 	<Space size="middle">
				// 		{
				// 			record.role && record.role.includes("patient")	&& (<Button
				// 				type="link"
				// 				onClick={() => {
				// 					setSidePanel(true);
				// 					setCurrentRecord(record);
				// 				}}
				// 				style={{ paddingLeft: 0 }}
				// 			>
				// 				View
				// 			</Button>)
				// 		}
				// 		{cookies.username !== record.username && !record.enabled && (
				// 			<Button
				// 				type="link"
				// 				onClick={() => activateUser([record.username])}
				// 				style={{ paddingLeft: 0 }}
				// 			>
				// 				Activate
				// 			</Button>
				// 		)}
				// 		{cookies.username !== record.username && (
				// 			<PopConfirmDropdown
				// 				record={record}
				// 				fetchUsers={fetchUsers}
				// 			/>
				// 		)}
				// 	</Space>
				// )
			},
		},
	];

	const menu = (
		<Menu>
			<Menu.Item
				key="1"
				icon={<UserOutlined />}
				onClick={() => setInviteUser(true)}
			>
				Add One User
			</Menu.Item>
			<Menu.Item key="2" icon={<UserOutlined />} onClick={openBulkModal}>
				Bulk Add Users
			</Menu.Item>
		</Menu>
	);

	const bulkMenu = (
		<Menu>
			<Menu.Item
				key="1"
				onClick={() =>
					showConfirm(
						bulkActivateUser,
						"Activate selected users?",
					)
				}
			>
				<Text type="link">Activate</Text>
			</Menu.Item>
			<Menu.Item
				key="2"
				onClick={() =>
					showConfirm(
						bulkSuspend,
						"Suspend selected users?",
					)
				}
			>
				<Text type="danger">Suspend</Text>
			</Menu.Item>
		</Menu>
	);

	function showConfirm(onOk, title) {
		confirm({
			title: title,
			icon: <ExclamationCircleOutlined />,
			content: (
				<ul>
					{selectedUsers.map((user) => {
						return <li key={user.id}>{user.username}</li>;
					})}
				</ul>
			),
			onOk() {
				onOk();
			},
			onCancel() {
				console.log("Cancel");
			},
		});
	}

	function bulkSuspend() {
		setLoading(true);
		console.log("bulk suspend", selectedRowKeys, selectedUsers);
		suspendUsers(selectedRowKeys)
			.then((res) => {
				setLoading(false);
				message.success(`${selectedRowKeys.length} users suspend`);
				fetchUsers();
			})
			.catch((err) => {
				setLoading(false);
				console.log(err);
			});
	}

	function openBulkModal() {
		setBulkModal(true);
	}
	function closeBulkModal() {
		setBulkModal(false);
	}

	function onInviteUserCancel() {
		setInviteUser(false);
	}

	function downloadCSV() {
		var result = csv.unparse({
			fields: [
				"id",
				"username",
				"email",
				"firstName",
				"lastName",
				"createdTimestamp",
				"role",
			],
			data: users,
		});
		console.log("downloadCSV -> result", result);

		const currentTime = moment().format();
		const exportedFilename = `canarie-users-${currentTime}.csv`;
		const blob = new Blob([result], { type: "text/csv;charset=utf-8;" });
		if (navigator.msSaveBlob) {
			// IE 10+
			navigator.msSaveBlob(blob, exportedFilename);
		} else {
			const link = document.createElement("a");
			if (link.download !== undefined) {
				// feature detection
				// Browsers that support HTML5 download attribute
				const url = URL.createObjectURL(blob);
				link.setAttribute("href", url);
				link.setAttribute("download", exportedFilename);
				link.style.visibility = "hidden";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	}
	
	function onSelectChange(selectedRowKeys, selectedRows) {
		console.log("selectedRowKeys changed: ", selectedRowKeys);
		setSelectedRowKeys(selectedRowKeys);
		setSelectedUsers(selectedRows);
	}

	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange,
		getCheckboxProps: (record) => {
			return {
				disabled: record.username === cookies.username, // Column configuration not to be checked
			};
		},
	};

	function onBulkEdit() {
		setBulkEdit(!bulkEdit);
	}

	function callback(key) {
		console.log(key);
	}

	const toggleSidePanel = () => {
		setSidePanel(!sidePanel);
	};

	const mouseMove = (e) => {
		const mouseX = e.clientX;
		const parentX = myRef.current.getClientRects()[0].x;
		const parentWidth = myRef.current.getClientRects()[0].width;
		const delta = mouseX - parentX; //delta is the current table width
		const maxPanelwidth = 600;
		const panelWidth =
		  parentWidth - delta > maxPanelwidth ? maxPanelwidth : parentWidth - delta;
		const tableWidth = parentWidth - panelWidth;
	
		setTableWidth(tableWidth);
		setPanelWidth(panelWidth);
	  };
	
	const stopMove = () => {
		document.removeEventListener('mousemove', mouseMove, true);
		document.removeEventListener('mouseup', stopMove, true);
	};

	const mouseDown = (e) => {
		document.addEventListener('mousemove', mouseMove, true);
		document.addEventListener('mouseup', stopMove, true);
	};

	return (
		<StandardLayout>
			<div className={styles.wrapper}>
				<Title level={2} className={"mt-3"}>
					Manage Users
				</Title>
				<Spin spinning={loading}>
					<Card style={{ boxShadow: "0px 1px 9px #00000020" }}>
						<Tabs defaultActiveKey="1" onChange={callback}>
							<TabPane tab="Researchers" key="1">
								{/* <div className={styles.toolbar}>
									<Space>
										<Button onClick={downloadCSV}>
											Download CSV
										</Button>
										<Dropdown overlay={menu}>
											<Button>
												Add <DownOutlined />
											</Button>
										</Dropdown>
										{selectedRowKeys.length > 0 &&
											selectedRowKeys.length +
												" users selected"}
									</Space>
									<Space>
										{bulkEdit && (
											<Dropdown
												overlay={bulkMenu}
												disabled={
													!(
														selectedRowKeys.length >
														0
													)
												}
											>
												<Button>
													Bulk Actions{" "}
													<DownOutlined />
												</Button>
											</Dropdown>
										)}
										<Button
											onClick={onBulkEdit}
											type="primary"
											ghost
										>
											{bulkEdit ? "Cancel" : "Bulk Edit"}
										</Button>
									</Space>
								</div> */}
								<Table
									dataSource={researchers}
									columns={columns}
									rowKey={(record) => record.username}
									rowSelection={
										bulkEdit ? rowSelection : false
									}
								/>
							</TabPane>
							<TabPane tab="Patients" key="2">
								<Tabs>
									<TabPane tab="Enrolled" key="enrolled">
										<div ref={myRef} style={{ display: sidePanel ? 'flex' : '' }}>
											<div
												style={{
													borderRight:
													  sidePanel && '1px solid rgb(240, 240, 240)',
													marginRight: sidePanel && '16px',
													width: sidePanel && tableWidth,
												}}
											>
												<Table
													dataSource={patients}
													columns={columns}
												/>
											</div>
											{sidePanel && (
												<ScalableDetails
													close={() => {
														toggleSidePanel();
														setCurrentRecord(null);
													}}
													width={panelWidth}
													record={currentRecord}
													mouseDown={mouseDown}
												/>
											)}
										</div>
										
									</TabPane>
									<TabPane tab="Invited" key="invited">
										<InvitationTable 
										/>	
									</TabPane>
								</Tabs>
							</TabPane>
						</Tabs>
					</Card>
				</Spin>
				<BulkInviteUsers
					closeBulkModal={closeBulkModal}
					visible={bulkModal}
				/>
				<InviteUser
					inviteUser={inviteUser}
					onInviteUserCancel={onInviteUserCancel}
				/>
			</div>
		</StandardLayout>
	);
}
export default AdminUsers;
