import React from "react";
import { Link, withRouter } from "react-router-dom";
import { Typography, Card, Table, Dropdown, Button, Divider, Select, Menu, Modal } from "antd";
import { MoreOutlined } from '@ant-design/icons';
import LandingHeader from "../Landing/LandingHeader/LandingHeader";
import AppFooter from "../../../Components/Layout/Footer";
import moment from "moment-timezone";
import styles from "./index.module.scss";
import { useParams } from "react-router-dom";
import { getResearchers, changeRole, RemoveResearcher, } from "../../../APIs";
import { AddApplicableUserModal } from "../../../Components/Modals/AddApplicableUserModal";
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { SubMenu } = Menu;

const { Title } = Typography;

function Researchers(props) {
	let { studyId } = useParams();
	const [users, setUsers] = React.useState([]);

	React.useEffect(() => {	
		getUsers();
	}, []);

	const getUsers = () => {
		getResearchers(studyId).then((res) => {
			if (res.status === 200) {
				const data = res.data.result.map((item) => {
					return { ...item, key: item.id };
				});
				setUsers(data);
			}
		});
	};

	const confirmModal = (user, permission, action) => {
		const _this = this;
		let content = '';
	
		if (action === 'delete') {
		  content = `Are you sure you wish to remove user ${user.username} from this project?`;
		} else {
		  content = `Are you sure you wish to change the role for user ${user.username} to ${permission}?`;
		}
		Modal.confirm({
		  title: 'Confirm',
		  icon: <ExclamationCircleOutlined />,
		  content,
		  okText: 'OK',
		  cancelText: 'Cancel',
		  onOk() {
			if (action === 'delete') {
				handleRemoveUser(user.id, permission);
			} else {
				handleChangeRole(user.id, permission);
			}
		  },
		});
	  }

	async function handleChangeRole(userId, relation) {
		const res = await changeRole(studyId, userId, relation)
		
		if (res.status === 200) {
			const updatedUsers = users.map((user) => {
				if (user.id === userId) {
					user.permission = relation
				}

				return user;
			});

			setUsers(updatedUsers);
		}
	}

	async function handleRemoveUser(userId, permission) {
		const res = await RemoveResearcher(studyId, userId, permission);

		if (res.status === 200) {
			getUsers();
		}
	}

	const menu = (user) => (
		<Menu id="teams_role_dropdown">
			<SubMenu title="Change Role">
				<Menu.Item
					onClick={() => {
						console.log(user)
						confirmModal(user, 'member', 'changeRole')
					}}
					key="member"
					>
					Member
				</Menu.Item>

				<Menu.Item
					onClick={() => {
						confirmModal(user, 'admin', 'changeRole')
					}}
					key="admin"
					>
					Admin
				</Menu.Item>
			</SubMenu>
		
			<Menu.Item
				onClick={() => {
					confirmModal(user, null, 'delete')
				}}
				style={{ color: 'red' }}
				>
				Remove
			</Menu.Item>
		</Menu>
	)

	const columns = [
		{
			title: "Username",
			dataIndex: "username",
			key: "username",
			sorter: (a, b) => a.username.localeCompare(b.username),
		},

		{
			title: "First Name",
			dataIndex: "firstname",
			key: "firstName",
			sorter: (a, b) => a.firstname.localeCompare(b.firstname),
		},
		{
			title: "Last Name",
			dataIndex: "lastname",
			key: "lastName",
			sorter: (a, b) => a.lastname.localeCompare(b.lastname),
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
		},
		{
			title: "Join Date",
			dataIndex: "time_created",
			key: "createdTimestamp",
			sorter: (a, b) => {
				return new Date(a.created_time) - new Date(b.created_time);
			},
			render: (text) => {
				return moment(text).format('YYYY-MM-DD HH:mm:ss');
			},
		},
		{
			title: "Role",
			dataIndex: "permission",
			key: "Role",
		},
		{
			title: "Actions",
			key: "action",
			render: (text, record) => {
				return (
					<Dropdown overlay={menu(record)} placement="bottomRight">
					  <Button shape="circle">
						<MoreOutlined />
					  </Button>
					</Dropdown>
				)
			},
		},
	];
	return (
		<>
			<LandingHeader />
			<div className={styles.container}>
				<div>
					<Title level={2}>Researchers </Title>{" "}
				</div>

				<Card style={{ boxShadow: "0px 1px 9px #00000020" }}>
					<AddApplicableUserModal
						existedUsers={users}
						getUsers={getUsers}
					/>
					<Table
						dataSource={users}
						columns={columns}
						style={{ marginTop: 20 }}
					/>
				</Card>
			</div>
			<AppFooter />
		</>
	);
}

export default withRouter(Researchers);
