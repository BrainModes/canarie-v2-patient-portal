import React, { Component, useState } from "react";
import { Layout, Menu, Button, message, Avatar } from "antd";
import {
	CompassOutlined,
	AppstoreOutlined,
	UserOutlined,
	TeamOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { userAuthManager } from "../../Service/userAuthManager";
import styles from "./index.module.scss";
import ResetPasswordModal from "../Modals/ResetPasswordModal";

const { Header } = Layout;
const { SubMenu } = Menu;

function AppHeader(props) {
	const [modalVisible, setModalVisible] = useState(false);
	const [cookies, setCookie] = useCookies();
	const { isLogin, username, role = "" } = cookies;
	const { t, i18n } = useTranslation(["message"]);
	function logout() {
		userAuthManager.receivedLogout();
		props.history.push("/");
		message.success(t("message:logout"));
	}

	function getActiveItem() {
		const basePage = props.location.pathname.slice(1).split("/")[0];
		// TODO: If on study inner pages, need to check user's access to decide what to highlight?
		switch (basePage) {
			case "":
				return ["logo"];
				break;
			case "login":
				return ["login"];
				break;
			case "my-studies":
				return ["my-studies"];
				break;
			case "studies":
				return ["studies"];
				break;
			default:
				return [];
		}
	}

	const handleCancel = () => {
		setModalVisible(false);
	};

	return (
		<div className={styles.header}>
			<Header
				style={{
					background: "white",
					boxShadow: "0 0 14px 1px rgba(0, 0, 0, 0.1)",
					position: "sticky",
					top: "0",
					zIndex: "100",
					width: "100%",
					height: "100%",
				}}
			>
				<Menu
					mode="horizontal"
					style={{ lineHeight: "64px" }}
					selectedKeys={getActiveItem()}
				>
					<Menu.Item
						key="logo"
						style={{ marginRight: "27px", paddingLeft: 0 }}
					>
						<Link to="/">
							<img
								src={require("../../Images/indoc-icon.png")}
								style={{ height: "40px" }}
								alt="icon"
							/>
						</Link>
					</Menu.Item>
					{isLogin && (
						<Menu.Item key="my-studies">
							<Link to="/my-studies">
								<AppstoreOutlined /> My studies
							</Link>
						</Menu.Item>
					)}
					{isLogin && role == "instance-admin" && (
						<Menu.Item key="users">
							<Link to="/admin/users">
								<TeamOutlined /> User Management
							</Link>
						</Menu.Item>
					)}
					{!isLogin && (
						<Menu.Item key="6" className={styles.login}>
							<Link to="/registration">
								<Button type="primary">Register</Button>
							</Link>
						</Menu.Item>
					)}
					{isLogin ? (
						<SubMenu
							title={
								<>
									<Avatar
										style={{
											backgroundColor:
												role === "researcher"
													? "#2768b7"
													: "#5e94d4",
										}}
										icon={<UserOutlined />}
										size="small"
									/>{" "}
									{username}
								</>
							}
							className={styles.login}
						>
							<Menu.ItemGroup
								key="role"
								title={role.toUpperCase()}
							>
								<Menu.Item
									key="reset"
									onClick={() => {
										setModalVisible(true);
									}}
								>
									Reset Password
								</Menu.Item>
								<Menu.Item key="5" onClick={logout}>
									Logout
								</Menu.Item>
							</Menu.ItemGroup>
						</SubMenu>
					) : (
						<Menu.Item key="login" className={styles.login}>
							<Link to="/login">
								<Button type="link">Login</Button>
							</Link>
						</Menu.Item>
					)}
				</Menu>

				<ResetPasswordModal
					visible={modalVisible}
					username={username || "Error"}
					handleCancel={handleCancel}
				/>
			</Header>
		</div>
	);
}

export default withRouter(AppHeader);
