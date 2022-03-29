import React from "react";
import { Modal, Button, Form, Radio, message, Select, Empty } from "antd";
import { getUserlistInContainer, addResearcherApplicable, getSisterContainerResearch } from "../../APIs";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const { Option } = Select;
function AddApplicableUserModal({ existedUsers, getUsers }) {
	const [visible, setVisible] = React.useState(false);
	const [form] = Form.useForm();
	const [applicableUsers, setApplicableUsers] = React.useState();
	const { t, i18n } = useTranslation(['message']);
	
	let { studyId } = useParams();

	React.useEffect(() => {
		fetchApplicable();
	}, [existedUsers]);

	function fetchApplicable() {
		getUserlistInContainer(studyId, {})
			.then((response) => {
				const users  = response.data.result;
				let researchers = users.filter(user => user.role !== 'patient');

				getSisterContainerResearch(studyId)
					.then((res) => {
						const sisterContainersUsers = res.data.result;

						for (const user of sisterContainersUsers) {
							const isExist = researchers.find(researcher => researcher.id === user.id);

							if (!isExist) researchers.push(user);
						}

						const usersElement = researchers.map((user) => {
							const isExist = existedUsers && existedUsers.find((el) => el.id === user.id)
							if (!isExist) return <Option key={user.username}>{user.username}</Option>;
						});
						setApplicableUsers(usersElement);
					})
					.catch((error) => {
						if (error.response && (error.response.status === 400 || error.response.status === 406)) {
							console.log('project have no sisiter project')
						}
						const usersElement = researchers.map((user) => {
							const isExist = existedUsers && existedUsers.find((el) => el.username === user.username)
							if (!isExist) return <Option key={user.username}>{user.username}</Option>;
						});
						setApplicableUsers(usersElement);
					});
			});
	}

	function handleChange(value) {
		console.log(`selected ${value}`);
	}

	const notFoundContent = (
		<Empty
			image={Empty.PRESENTED_IMAGE_SIMPLE}
			description={
				<span>
					All users from the associated Researcher Portal container have been added. 
					If attempting to add a new user, please add them on the associated Researcher Portal container first.
				</span>
			} 
		/>
	)

	return (
		<>
			<Button type="primary" onClick={() => setVisible(true)}>
				Add Researcher
			</Button>
			<Modal
				title="Add User as Researcher"
				visible={visible}
				okText="Add Researcher"
				onOk={() => {
					form.validateFields()
						.then(async (values) => {
							const users = values.users;
							const role = values.role;

							for (const user of users) {
								await addResearcherApplicable(
									studyId,
									user,
									role
								);
							}

							form.resetFields();

							getUsers();
							setVisible(false);
							message.success(t('message:invitation.researcher.success'));
						})
						.catch((info) => {
							console.log("Validate Failed:", info);
							message.error(t('message:invitation.researcher.failed'));
						});
				}}
				onCancel={() => {
					setVisible(false);
					form.resetFields();
				}}
			>
				<Form form={form} layout="vertical" name="add_appliable_user">
					<Form.Item
						label="Username"
						name="users"
						rules={[
							{
								required: true,
								message: "Please input researcher's username.",
							}
						]}
					>
						<Select
							mode="multiple"
							showSearch
							allowClear
							style={{ width: "100%" }}
							placeholder="Please select"
							onChange={handleChange}
							notFoundContent={notFoundContent}
						>
							{applicableUsers}
						</Select>
					</Form.Item>

					<Form.Item
						label="Role"
						name="role"
						initialValue="admin"
						rules={[
							{
								required: true,
								message: "Please select researcher's role.",
							},
						]}
					>
						<Radio.Group defaultValue="admin">
							<Radio value="admin">Admin</Radio>
							<Radio value="member">Member</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}

export { AddApplicableUserModal };
