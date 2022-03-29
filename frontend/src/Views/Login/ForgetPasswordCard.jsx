import React from "react";
import { Card, Form, Button, Input, Row, Col, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { forgotPassword } from "../../APIs";
import { useTranslation } from "react-i18next";
import styles from "./index.module.scss";

const layout = {
	labelCol: {
		span: 5,
	},
	wrapperCol: {
		span: 19,
	},
};
const tailLayout = {
	wrapperCol: {
		span: 24,
	},
};

const ForgetPasswordCard = (props) => {
    const { setForgotMode } = props;
    const { t, i18n } = useTranslation(["message"]);
    const onForgotFinish = (values) => {
		forgotPassword(values.email).then((res) => {
			if (res.status === 200) {
				message.success(t("message:login.forgot_password.success"));
			}
		});
	};

	return (
		<Card>
			<h2 style={{ textAlign: "center" }}>Forgot Your Password?</h2>
			<Form
				{...layout}
				name="basic"
				onFinish={onForgotFinish}
			>
				<Form.Item
					label="Email"
					name="email"
					rules={[
						{
							required: true,
							message: t("message:login.email.required"),
						},
					]}
				>
					<Input prefix={<UserOutlined />} />
				</Form.Item>

				<Row style={{ marginTop: -15 }}>
					<Col xs={{ span: 0 }} sm={{ span: 5 }}></Col>
					<Col xs={{ span: 24 }} sm={{ span: 19 }}>
						<Form.Item {...tailLayout}>
							<a
								className={styles.forgot}
								onClick={() => {
									setForgotMode(false);
								}}
							>
								« Back to Login
							</a>
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col xs={{ span: 0 }} sm={{ span: 5 }}></Col>
					<Col xs={{ span: 24 }} sm={{ span: 19 }}>
						<Form.Item {...tailLayout}>
							<Button
								type="primary"
								htmlType="submit"
								className="login-form-button"
								style={{ width: "100%" }}
							>
								Submit
							</Button>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Card>
	);
};

export default ForgetPasswordCard;
