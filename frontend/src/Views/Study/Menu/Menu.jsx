import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "antd";
import { useCookies } from "react-cookie";
import {
	SettingOutlined,
	HomeOutlined,
	UnorderedListOutlined,
	TeamOutlined,
	UserOutlined,
	QuestionOutlined,
	FormOutlined,
	ProfileOutlined,
	LineChartOutlined,
} from "@ant-design/icons";
import Icon from "@ant-design/icons";
import styles from './index.module.scss';

function StudyMenu({
	currentStudy,
	currentPath,
	isPublicView,
	isSurveyConnected,
}) {
	const [muneItemSelected, setMuneItemSelected] = useState(currentPath);
	const [cookies] = useCookies();
	const currentRole = cookies.role;
	const currentPermission = currentStudy && currentStudy.permission;

	return (
		<div id={styles.life_side_menu}>
			<Menu
				selectedKeys={[currentPath]}
				mode="inline"
				style={{ backgroundColor: "#003262", borderRight: "0px" }}
			>
				<Menu.Item
					className={styles.menu_item}
					key="landing"
					onClick={() => setMuneItemSelected("landing")}
				>
					<Link to="landing">
						{muneItemSelected === "landing" ? (
							<span role="img" className="anticon">
								<img
									style={{ width: 15 }}
									src={require("../../../Images/Dashboard-selected.svg")}
								/>
							</span>
						) : (
							<span role="img" className="anticon">
								<img
									style={{ width: 15 }}
									src={require("../../../Images/Dashboard.svg")}
								/>
							</span>
						)}
						<span>Study Details</span>
					</Link>
				</Menu.Item>
				{!isPublicView &&
					(currentRole === "instance-admin" ||
						currentPermission === "admin") && (
						<Menu.Item
							className={styles.menu_item}
							key="config"
							//icon={<SettingOutlined />}
						>
							<Link to="config">
								<SettingOutlined />
								<span>Study Configuration</span>
							</Link>
						</Menu.Item>
					)}

				{!isPublicView && currentRole !== "patient" && (
					<Menu.Item
						className={styles.menu_item}
						key="patients"
						//icon={<UserOutlined />}
					>
						<Link to="patients">
							<UserOutlined />
							<span>Participants</span>
						</Link>
					</Menu.Item>
				)}

				{!isPublicView &&
					(currentRole === "instance-admin" ||
						currentPermission === "admin") && (
						<Menu.Item
							className={styles.menu_item}
							key="researchers"
							//icon={<TeamOutlined />}
						>
							<Link to="researchers">
								<TeamOutlined />
								<span>Researchers</span>
							</Link>
						</Menu.Item>
					)}

				{!isPublicView && currentRole === "patient" && (
					<Menu.Item
						className={styles.menu_item}
						key="survey"
						disabled={!isSurveyConnected}
						onClick={() => setMuneItemSelected("")}
					>
						<Link to="survey">
							<ProfileOutlined />
							<span>Survey</span>
						</Link>
					</Menu.Item>
				)}
				{/* {!isPublicView &&
					(currentRole === "instance-admin" ||
						currentPermission === "admin") && (
						<Menu.Item
							className={styles.menu_item}
							key="logging"
							onClick={() => setMuneItemSelected("")}
							//icon={<UnorderedListOutlined />}
						>
							<UnorderedListOutlined />
							<span>Logging</span>
						</Menu.Item>
					)} */}
				{!isPublicView && currentRole === "patient" && (
					<Menu.Item
						className={styles.menu_item}
						key="smartwatch"
						onClick={() => setMuneItemSelected("")}
					>
						<Link to="smartwatch">
							<LineChartOutlined />
							<span>Smartwatch</span>
						</Link>
					</Menu.Item>
				)}
			</Menu>
		</div>
	);
}

export default StudyMenu;
