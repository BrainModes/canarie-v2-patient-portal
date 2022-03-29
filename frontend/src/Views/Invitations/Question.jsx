import React from "react";
import { Form, Input, Button, message } from "antd";
import { Login } from "./Login";
import { connect } from "react-redux";
import {
	login as loginApi,
	answerQuestion as answerQuestionAPI,
} from "../../APIs";
import { withRouter } from "react-router-dom";
import { parseJwt } from "../../Utility";
import { tokenManager } from "../../Service/tokenManager";
import { setIsLoginCreator } from "../../Redux/actions";
import { userAuthManager } from "../../Service/userAuthManager";
import { useTranslation } from "react-i18next";

function Question(props) {
	const [form] = Form.useForm();
	const [isLogged, setIsLogin] = React.useState(false);
	const { t, i18n } = useTranslation(["message"]);

	const onFinish = (values) => {
		const { invitationHash } = props.match.params;
		answerQuestionAPI(invitationHash, values.answer, props.projectId)
			.then((res) => {
				if (res.data.result) {
					const { success, container_guid_guid } = res.data.result;
					if (!success) {
						message.error(
							t("message:invitation.patient.answer.valid"),
						);
					} else {
						props.history.push("/my-studies");
					}
				}
			})
			.catch((err) => {
				message.error(
					t("message:invitation.patient.patientExist.exist"),
				);
			});
	};

	const onFinishFailed = (errorInfo) => {
		console.log("Failed:", errorInfo);
	};

	const login = (values) => {
		loginApi({ ...values, user_role: "patient" })
			.then((res) => {
				const { access_token, refresh_token } = res.data.result;

				if (res.status == 200) {
					setIsLogin(true);

					const parsedJwt = parseJwt(access_token);

					tokenManager.setCookies({
						isLogin: true,
						username: values.username,
						role: parsedJwt.user_role,
						access_token: access_token,
						refresh_token: refresh_token,
					});

					props.setIsLoginCreator(true);

					userAuthManager.initRefreshModal();
					userAuthManager.initExpirationLogout();
					tokenManager.refreshToken(access_token);
				}
			})
			.catch((err) => {
				if (err.response && err.response.status === 409) {
					message.error(t("message:login.patient_tab.role"));
				} else if (err.response && err.response.status === 403) {
					message.error(t("message:login.password_error"));
				}
			});
	};

	return isLogged === false ? (
		<Login onSubmit={login} username={props.username} />
	) : (
		<Form
			name="invite_question"
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
		>
			<Form.Item label="Security Question">
				<span className="ant-form-text">{props.question}</span>
			</Form.Item>
			<Form.Item
				label="Security Answer"
				name="answer"
				rules={[
					{
						required: true,
						message: "Enter the security answer.",
					},
				]}
			>
				<Input placeholder="Security answer" />
			</Form.Item>
			<Form.Item
			// wrapperCol={{
			// 	xs: { span: 24, offset: 0 },
			// 	sm: { span: 16, offset: 8 },
			// }}
			>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
}

export default withRouter(connect(null, { setIsLoginCreator })(Question));
