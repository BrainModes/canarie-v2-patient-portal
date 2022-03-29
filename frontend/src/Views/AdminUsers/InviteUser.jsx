import React from "react";
import { Modal, Form, Input, Tooltip, Radio, message } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import _ from "lodash";
import { useTranslation } from 'react-i18next';

import { inviteUser, checkUserInfo } from "../../APIs";

const formRef = React.createRef();

const layout = {
	labelCol: {
		span: 6,
	},
	wrapperCol: {
		span: 18,
	},
};

const onFinishFailed = (errorInfo) => {
	console.log("Failed:", errorInfo);
};

const options = [
	// { label: "Study Onwer", value: "container-requester" },
	// { label: "Study Member", value: "registered-user" },
	{ label: "Instance Admin", value: "instance-admin" },
];

function InviteUser(props) {
	const { t, i18n } = useTranslation(['message']);

	const onFinish = async () => {
		formRef.current.validateFields().then((values) => {
			const user = Object.assign({}, values, { projectId: -1 });
			console.log("onFinish -> user", user);
			inviteUser(user)
				.then((res) =>
					message.success(
						t('message:invitation.invite.success')
					),
				)
				.catch((err) => {
					console.error(err);
				});
			props.onInviteUserCancel();
			formRef.current.resetFields();
		});
	};
	const roleTip = (
		<p>
			Platform Admin: A platform admin who oversees the site
			{/* <br />
			Study Onwer: A user who can request containers
			<br />
			Study Member: A user who can be added to containers, with no special
			previliges */}
		</p>
	);
	/**
	 * Validate user with username or email
	 *
	 * @param {*} rule the
	 * @param {*} value
	 */
	const validateUser = async (rule, value) => {
		try {
			const query = {};
			query[rule.field] = value;
			const userInfo = await checkUserInfo(query);
			if (!_.isEmpty(userInfo.data.result)) {
				throw `${rule.field} ${value} is taken`;
			}
		} catch (err) {
			throw err;
		}
	};

	return (
		<Modal
			title="Invite User"
			visible={props.inviteUser}
			onOk={onFinish}
			onCancel={props.onInviteUserCancel}
		>
			<Form
				{...layout}
				name="basic"
				initialValues={{
					remember: true,
				}}
				onFinish={onFinish}
				onFinishFailed={onFinishFailed}
				ref={formRef}
			>
				<Form.Item
					label="Username"
					name="username"
					validateTrigger="onBlur"
					rules={[
						{
							required: true,
							message: t('message:invitation.invite.username.required')
						},
						{ validator: validateUser },
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="First Name"
					name="firstname"
					rules={[
						{
							required: true,
							message: t('message:invitation.invite.firstName.required'),
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="Last Name"
					name="lastname"
					rules={[
						{
							required: true,
							message: t('message:invitation.invite.lastName.required')
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="User Email"
					name="email"
					validateTrigger="onBlur"
					rules={[
						{
							required: true,
							message: t('message:invitation.invite.email.required')
						},
						{
							type: "email",
							message: t('message:invitation.invite.username.valid')
						},
						{ validator: validateUser },
					]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					label={
						<Tooltip placement="top" title={roleTip}>
							Role <QuestionCircleOutlined />
						</Tooltip>
					}
					name="role"
					rules={[
						{
							required: true,
							message: t('message:invitation.invite.role.required')
						},
					]}
				>
					<Radio.Group options={options} />
				</Form.Item>
			</Form>
		</Modal>
	);
}

export default InviteUser;
