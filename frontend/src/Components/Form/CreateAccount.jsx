import React, { useState } from "react";
import { withRouter, Link } from "react-router-dom";
import {
	Card,
	Form,
	Input,
	Button,
	Typography,
	Tabs,
	Row,
	Col,
	Checkbox,
	message,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { register } from "../../APIs";
import { useMobile } from "../../Hooks";
import TermsOfUseModal from "../Modals/TermsOfUseModal";
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { TabPane } = Tabs;

const layout = {
	labelCol: {
		span: 6,
	},
	wrapperCol: {
		span: 18,
	},
};
const tailLayout = {
	wrapperCol: {
		span: 24,
	},
};

function CreateAccount(props) {
	const [role, setRole] = useState("patient");
	const [visible, setVisible] = useState(false);
	const isMobile = useMobile();
	const { t, i18n } = useTranslation(['message']);

	const {
		match: { path, params },
	} = props;
	const config = {
		observationVars: [],
		initFunc: () => {},
	};
	const onFinish = (values) => {
		props.onSubmit(values);
	};

	const onFinishFailed = (errorInfo) => {
		console.log("Failed:", errorInfo);
	};

	function onTabChange(value) {
		setRole(value);
	}

	const onCancel = () => {
		setVisible(false);
	};

	return (
		<>
			<Card style={{ borderRadius: "8px" }}>
				<Row style={{ marginBottom: "24px" }}>
					<Col xs={{ span: 0 }} sm={{ span: 6 }}></Col>
					<Col xs={{ span: 24 }} sm={{ span: 18 }}>
						<Title level={3}>Create an Account</Title>
						<p>
							After registration, you can use the full functions
							on this platform.
						</p>
					</Col>
				</Row>
				<Form
					{...layout}
					name="basic"
					initialValues={{
						remember: true,
					}}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
				>
					<Form.Item
						label="Username"
						name="username"
						rules={[
							{
								required: true,
								message: t(
									"message:register.username.required",
								),
							},
						]}
					>
						<Input prefix={<UserOutlined />} />
					</Form.Item>
					<Form.Item
						label="First Name"
						name="firstname"
						rules={[
							{
								required: true,
								message: t(
									"message:register.firstName.required",
								),
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
								message: t(
									"message:register.lastName.required",
								),
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Email"
						name="email"
						initialValue={props.email}
						rules={[
							{
								required: true,
								message: t("message:register.email.required"),
							},
							{
								type: "email",
								message: t("message:register.email.valid"),
							},
						]}
					>
						<Input disabled={props.email} />
					</Form.Item>

					<Form.Item
						label="Password"
						name="password"
						rules={[
							{
								required: true,
								message: t(
									"message:register.password.required",
								),
							},
							{
								pattern: new RegExp(
									/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_!%&/()=?*+#,.;])[A-Za-z\d-_!%&/()=?*+#,.;]{11,30}$/g,
								),
								message: t("message:register.password.valid"),
							},
						]}
					>
						<Input.Password prefix={<LockOutlined />} />
					</Form.Item>

					<Form.Item
						label="Confirm Password"
						name="password_confirm"
						rules={[
							{
								required: true,
								message: t(
									"message:register.confirmPassword.required",
								),
							},

							({ getFieldValue }) => ({
								validator(rule, value) {
									if (
										!value ||
										getFieldValue("password") === value
									) {
										return Promise.resolve();
									}

									return Promise.reject(
										t(
											"message:register.confirmPassword.valid",
										),
									);
								},
							}),
						]}
					>
						<Input.Password
							onCopy={(e) => e.preventDefault()}
							onPaste={(e) => e.preventDefault()}
							autoComplete="off"
							prefix={<LockOutlined />}
						/>
					</Form.Item>

					<Row style={{ marginBottom: "24px" }}>
						<Col xs={{ span: 0 }} sm={{ span: 6 }}></Col>
						<Col xs={{ span: 24 }} sm={{ span: 18 }}>
							<Form.Item
								{...tailLayout}
								name="tou"
								valuePropName="checked"
								style={{ marginBottom: "8px" }}
								rules={[
									{
										validator: (_, value) =>
											value
												? Promise.resolve()
												: Promise.reject(
														t(
															"message:register.ToU.required",
														),
												  ),
									},
								]}
							>
								<Checkbox>
									I have read and agree to the{" "}
									<Button
										style={{ borderRadius: "6px" }}
										onClick={() => setVisible(true)}
									>
										Terms of Use
									</Button>
								</Checkbox>
							</Form.Item>
						</Col>
					</Row>

					<Row>
						<Col xs={{ span: 0 }} sm={{ span: 6 }}></Col>
						<Col xs={{ span: 24 }} sm={{ span: 18 }}>
							<Form.Item {...tailLayout}>
								<Button
									style={{ borderRadius: "6px" }}
									type="primary"
									htmlType="submit"
								>
									Sign Up
								</Button>
							</Form.Item>
						</Col>
					</Row>
					<TermsOfUseModal
						visible={visible}
						handleCancel={onCancel}
					/>
				</Form>
			</Card>
		</>
	);
}

export default withRouter(CreateAccount);
