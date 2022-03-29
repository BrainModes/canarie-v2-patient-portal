import React, { useState, useEffect } from "react";
import {
	Layout,
} from "antd";
import LoginCard from "./LoginCard";
import ForgetPasswordCard from "./ForgetPasswordCard";
import { StandardLayout } from "../../Components/Layout";
import styles from "./index.module.scss";
import { useMobile } from "../../Hooks";

const { Content } = Layout;

function Login(props) {
	const [role, setRole] = useState("patient");
	const [forgotMode, setForgotMode] = useState(false);
	const isMobile = useMobile();

	useEffect(() => {
		if (props.isLogin) {
			window.location = "/my-studies";
		}
	});

	const config = {
		observationVars: [],
		initFunc: () => {},
	};

	return (
		<StandardLayout {...config}>
			<Content className={"content"}>
				<div className={styles.container}>
					{!forgotMode ? (
						<LoginCard
							role={role}
							setRole={setRole}
							forgotMode={forgotMode}
							setForgotMode={setForgotMode}
						/>
					) : (
						<ForgetPasswordCard setForgotMode={setForgotMode} />
					)}
				</div>
			</Content>
		</StandardLayout>
	);
}

export default Login;
