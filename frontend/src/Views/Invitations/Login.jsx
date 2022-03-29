import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { login } from "../../APIs";
import { useCookies } from "react-cookie";

function Login(props) {
	const [role, setRole] = useState("patient");
	const [form] = Form.useForm();
	const [cookies, setCookie] = useCookies();
	const { isLogin } = cookies;

	const onFinish = (values) => {
		if (isLogin) {
			message.error(
				`You are already logged in as ${cookies.username}, you need to log out before logging in as different user.`,
			);
			return;
		}
		props.onSubmit(values);
	};
	console.log(props.username);
	form.setFieldsValue({ username: props.username });
	return (
		<Form
			name="basic"
			initialValues={{
				remember: true,
			}}
			onFinish={onFinish}
			form={form}
		>
			<Form.Item
				label="Username"
				name="username"
				initialValue={props.username}
				rules={[
					{
						required: true,
						message: "Enter your username.",
					},
				]}
			>
				<Input prefix={<UserOutlined />} disabled={props.username} />
			</Form.Item>

			<Form.Item
				label="Password"
				name="password"
				rules={[
					{
						required: true,
						message: "Enter your password.",
					},
				]}
			>
				<Input.Password prefix={<LockOutlined />} />
			</Form.Item>
			<Form.Item>
				<Button type="primary" htmlType="submit">
					Log In
				</Button>
			</Form.Item>
		</Form>
	);
}

export { Login };
