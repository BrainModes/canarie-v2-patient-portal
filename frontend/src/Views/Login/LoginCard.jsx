import React from "react";
import { useDispatch } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Card, Button, Form, Input, message } from "antd";
import { login, checkUserInfo } from "../../APIs";
import { parseJwt } from "../../Utility";
import { userAuthManager } from "../../Service/userAuthManager";
import { tokenManager } from "../../Service/tokenManager";
import { setIsLoginCreator, setCurrentUser } from "../../Redux/actions";
import {
	UserOutlined,
	LockOutlined,
	ExperimentOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import styles from "./index.module.scss";

const LoginCard = (props) => {
	const { role, setRole, forgotMode, setForgotMode } = props;
	const [cookies, setCookie] = useCookies();
	const { isLogin } = cookies;
	const dispatch = useDispatch();
	const { t, i18n } = useTranslation(["message"]);
	const handleOnClick = () => {
		if (role === "patient") {
			setRole("researcher");
		} else {
			setRole("patient");
		}
	};

	const loginInAssistant = () => {
		if (role === "patient") {
			return (
				<div className={styles.login_assistant}>
					<p onClick={() => setForgotMode(true)}>Forgot password?</p>
					<p>
						New to the platform?{" "}
						<Link to="/registration">Register here.</Link>
					</p>
				</div>
			);
		} else {
			return (
				<div className={styles.login_assistant}>
					<p onClick={() => setForgotMode(true)}>Forgot password?</p>
				</div>
			);
		}
	};

	const title = (
		<div className={styles.card_title}>
			<p>CANARIE Patient Portal</p>
			<Button
				type="link"
				icon={
					role === "patient" ? (
						<ExperimentOutlined />
					) : (
						<UserOutlined />
					)
				}
				onClick={handleOnClick}
			>
				<span>{`I am a ${
					role === "patient" ? "Researcher" : "Patient"
				}`}</span>
			</Button>
		</div>
	);

	const onFinish = (values) => {
		if (isLogin) {
			message.error(
				`You are already logged in as ${cookies.username}, you need to log out before logging in as different user.`,
			);
			return;
		}
		login({ ...values, user_role: role })
			.then(async (res) => {
				const { access_token, refresh_token } = res.data.result;
				const parsedJwt = parseJwt(access_token);

				tokenManager.setCookies({
					isLogin: true,
					username: values.username,
					role: parsedJwt.user_role,
					access_token: access_token,
					refresh_token: refresh_token,
				});
				dispatch(setIsLoginCreator(true));

				// initiating userAuthManger
				userAuthManager.initRefreshModal();
				userAuthManager.initExpirationLogout();
				tokenManager.refreshToken(access_token);

				const userInfoRes = await checkUserInfo({
					username: values.username,
				});
				if (userInfoRes.status === 200) {
					dispatch(setCurrentUser(userInfoRes.data.result));
				}

				// Redirect the user to former page, if they clicked to login page with a link that sends prevPath
				// Otherwise, direct to my-studies page.
				if (props.location.state) {
					props.history.push(props.location.state.prevPath);
				} else {
					props.history.push("/my-studies");
				}
				message.success(`Welcome back, ${values.username}`);
			})
			.catch((err) => {
				if (err.response && err.response.status === 409) {
					if (role === "patient") {
						message.error(t("message:login.patient_tab.role"));
					} else {
						message.error(t("message:login.researcher_tab.role"));
					}
				} else if (err.response && err.response.status === 403) {
					message.error(t("message:login.password_error"));
				}
				if (err.response && err.response.status === 400) {
					message.error(t("message:login.suspended"));
				}
			});
	};

	return (
		<Card title={title}>
			<Form
				className={styles.login_form}
				name="basic"
				onFinish={onFinish}
			>
				<Form.Item
					label="Username"
					name="username"
					rules={[
						{
							required: true,
							message: t("message:login.username.required"),
						},
					]}
				>
					<Input prefix={<UserOutlined />} />
				</Form.Item>
				<Form.Item
					style={{ marginBottom: "5px" }}
					label="Password"
					name="password"
					rules={[
						{
							required: true,
							message: t("message:login.password.required"),
						},
					]}
				>
					<Input.Password prefix={<LockOutlined />} />
				</Form.Item>
				{loginInAssistant()}
				<Form.Item className={styles.form_btn}>
					<Button
						type="primary"
						htmlType="submit"
						icon={
							role === "patient" ? (
								<UserOutlined />
							) : (
								<ExperimentOutlined />
							)
						}
					>
						{`Sign in as ${
							role === "patient" ? "Patient" : "Researcher"
						}`}
					</Button>
				</Form.Item>
			</Form>
		</Card>
	);
};

export default withRouter(LoginCard);
